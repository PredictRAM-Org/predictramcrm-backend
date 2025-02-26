const httpStatus = require("http-status");
const { ROLES, STOCK_CHANGE_STATE } = require("../enums");
const {
  MarketCallService,
  UserService,
  StockService,
  MarketCallHistoryService,
} = require("../services");
const ApiError = require("../utils/ApiError");
const response = require("../utils/formatResponse");
const WSResponse = require("../utils/formatWSResponse");
const { DBConnect } = require("../utils/DBconfig");
const { User, Stock } = require("../models");
const marketCallEmail = require("../utils/EmailTemplates/marketCall.mail");
const EmailService = require("../services/email.service");
const MarketCallPortfolioService = require("../services/marketcallPortfolio.service");
const { ObjectId } = require("mongoose").Types;

module.exports = class MarketCallPortfolioController {
  static async createMarketCallPortfolio(req, res, next) {
    try {
      req.body.createdBy = req?.user?._id;

      const session = await (await DBConnect()).startSession();

      await session.withTransaction(async (session) => {
        const {
          marketCall,
          stockList,
          createdBy,
        } = req.body;

        // create market call
        const [marketCallPortfolio] = await MarketCallPortfolioService.createMarketCallPortfolio(
          {
            marketCall,
            stockList,
            createdBy,
          },
          { session }
        );
      });
      res.json(response({}, "market call portfolio created successfully"));
    } catch (err) {
      next(err);
    }
  }

  static async getMarketCall(req, res, next) {
    try {
      const filter = { ...req.query };
      let populate = [];
      const pagination = { limit: 0, page: 0 };

      if (req?.user?.organization) {
        filter.organization = req.user.organization;
      }

      // if (req.user?.role === ROLES.EMPLOYEE) {
      //   const clients = (await User.find({ managedBy: req.user._id })).map(
      //     (client) => client?._id
      //   );
      //   filter.$or = [
      //     { createdBy: req.user._id },
      //     { clients: { $in: clients } },
      //   ];
      // }

      // if (req.user?.role === ROLES.ANALYST) {
      //   filter.createdBy = req.user._id;
      // }

      // if (req.user?.role === ROLES.CLIENT) {
      //   filter.clients = { $in: [req.user?._id] };
      // }

      if (filter?.client) {
        filter.clients = { $in: [filter?.client] };
        delete filter.client;
      }

      if (filter?._id) {
        filter._id = new ObjectId(filter._id);
      }

      if (filter?.populate) {
        populate = filter.populate?.split(",");
        delete filter?.populate;
      }

      if (filter?.limit >= 0 && filter?.page >= 0) {
        pagination.limit = filter.limit;
        pagination.page = filter.page;
        delete filter.limit;
        delete filter.page;
      }

      const { marketCallData, total } = await MarketCallService.getMarketCall(
        filter,
        populate,
        pagination
      );

      const stocks = await Stock.find({
        marketCall: { $in: marketCallData?.map((m) => m?._id) },
      });

      const marketCall = marketCallData?.map((m) => {
        const portfolio = stocks?.filter(
          (s) => s?.marketCall.toString() === m?.id.toString()
        );
        return { ...m.toObject(), portfolio };
      });

      res.json(response({ marketCall, total }, "Market calls fetched"));
    } catch (err) {
      next(err);
    }
  }

  static async updateMarketCall(req, res, next) {
    try {
      let filter = {};
      const { } = req.body;
      if (req.user?.organization) {
        filter.organization = req.user.organization;
      }
      if (req.user.role === ROLES.ANALYST) {
        filter.createdBy = new ObjectId(req.user?._id);
      }

      const marketCall = await MarketCallService.updateMarketCall(
        req.params.id,
        req.body,
        filter
      );

      //TODO: do some better
      if (req.body?.notifiedClients) {
        const portfolio = await Stock.find({
          marketCall: new ObjectId(req.params.id),
        });

        const clients = await User.find({
          _id: { $in: req.body.notifiedClients },
        });
        clients?.map(async (client) => {
          const newMail = marketCallEmail(
            portfolio,
            req.params.id,
            `${client?.firstName} ${client?.lastName}`
          );
          await EmailService.sendCustomisedEmail(
            client?.email,
            newMail.subject,
            newMail.html
          );
        });
      }
      res.json(response(marketCall, "Market call updated"));
    } catch (err) {
      next(err);
    }
  }

  static async deleteMarketCall(req, res, next) {
    try {
      let filter = {};
      if (req.user?.organization) {
        filter.organization = req.user.organization;
      }
      if (req.user.role === ROLES.EMPLOYEE) {
        const marketCall = await MarketCallService.getMarketCall({
          _id: req.params.id,
        });
        if (marketCall?.createdBy !== req.user._id)
          throw new ApiError(
            httpStatus.FORBIDDEN,
            "You can not delete other's market call"
          );
      }
      await MarketCallService.deleteMarketCall(req.params.id, filter);
      res.json(response({}, "Market call deleted"));
    } catch (err) {
      next(err);
    }
  }
};

//TODO: Uncomment in prod
// Email queue
// if (marketCall) {
// await MarketCallService.sendMarketCallEmail({
//   id: req.user._id,
//   name: `${req.user?.firstName} ${req.user?.lastName}`,
// });
// }
