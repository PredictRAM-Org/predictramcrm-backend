const httpStatus = require("http-status");
const { ROLES, STOCK_CHANGE_STATE } = require("../enums");
const {
  MarketCallService,
  UserService,
  StockService,
  MarketCallHistoryService,
  ProfileMarketCallService,
} = require("../services");
const ApiError = require("../utils/ApiError");
const response = require("../utils/formatResponse");
const WSResponse = require("../utils/formatWSResponse");
const { DBConnect } = require("../utils/DBconfig");
const { User, Stock } = require("../models");
const marketCallEmail = require("../utils/EmailTemplates/marketCall.mail");
const EmailService = require("../services/email.service");
const { ObjectId } = require("mongoose").Types;

module.exports = class ProfileMarketCallController {
  static async getMarketCall(req, res, next) {
    try {
      const filter = { ...req.query };
      let populate = [];
      const pagination = { limit: 0, page: 0 };

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

      const { marketCallData, total } = await ProfileMarketCallService.getMarketCall(
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
};

//TODO: Uncomment in prod
// Email queue
// if (marketCall) {
// await MarketCallService.sendMarketCallEmail({
//   id: req.user._id,
//   name: `${req.user?.firstName} ${req.user?.lastName}`,
// });
// }
