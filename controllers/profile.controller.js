const httpStatus = require("http-status");
const { ROLES, STOCK_CHANGE_STATE } = require("../enums");
const {
  MarketCallService,
  UserService,
  StockService,
  MarketCallHistoryService,
  ProfileService,
} = require("../services");
const ApiError = require("../utils/ApiError");
const response = require("../utils/formatResponse");
const WSResponse = require("../utils/formatWSResponse");
const { DBConnect } = require("../utils/DBconfig");
const { User, Stock } = require("../models");
const marketCallEmail = require("../utils/EmailTemplates/marketCall.mail");
const EmailService = require("../services/email.service");
const { ObjectId } = require("mongoose").Types;

module.exports = class ProfileController {
  static async getUserProfile(req, res, next) {
    try {      
      const filter = { ...req.query };
      
      const profile = await ProfileService.getOneUser(
        filter
      );

      res.json(response({ profile }, "Profile fetched"));
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      let filter = {};
      
      const { } = req.body;
      
      if (req.user?.organization) {
        filter.organization = req.user.organization;
      }
      // if (req.user.role === ROLES.ANALYST) {
      //   filter.createdBy = new ObjectId(req.user?._id);
      // }

      const marketCall = await ProfileService.updateUser(
        new ObjectId(req.params.id),
        req.body,
        filter
      );

      res.json(response(marketCall, "Profile updated"));
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
