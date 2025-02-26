const httpStatus = require("http-status");
const { MarketCallService, ResponseService } = require("../services");
const response = require("../utils/formatResponse");
const ApiError = require("../utils/ApiError");
const { ROLES, RESPONSE_STATUS } = require("../enums");
const socketService = require("../services/socket.service");
const { ObjectId } = require("mongoose").Types;
const { isAfter } = require("date-fns");
const WSResponse = require("../utils/formatWSResponse");
const { Stock, MarketCall } = require("../models");

module.exports = class ResponseController {
  static async createResponse(req, res, next) {
    try {
      req.body.organization = req.user.organization;
      req.body.submittedBy = req?.user?._id;

      // check if client is notified or not
      const marketCall = await MarketCallService.getOneMarketCall({
        _id: req.body?.marketCallId,
        notifiedClients: { $in: [req?.user?._id] },
      });

      if (!marketCall)
        throw new ApiError(
          httpStatus.FORBIDDEN,
          "You can not submit response on this market call you are not notified"
        );
      // get current portfolio
      const portfolio = await Stock.find({ marketCall });

      // create new response
      const newResponse = await ResponseService.createResponse({
        ...req.body,
        portfolio,
      });

      // remove client from notified clients list
      await MarketCallService.updateMarketCall(req.body?.marketCallId, {
        $pull: { notifiedClients: req?.user?._id },
      });

      res.json(response(newResponse, "Your response submitted successfully"));
    } catch (err) {
      next(err);
    }
  }

  static async getResponses(req, res, next) {
    try {
      const filter = req.query;
      const pagination = { limit: 0, page: 0 };
      let populate = [];

      if (req.user?.organization) {
        filter.organization = req.user.organization;
      }

      // if (req.user.role === ROLES.ANALYST) {
      //   const marketCalls = (
      //     await MarketCall.find({ createdBy: req.user?._id })
      //   ).map((call) => call?._id);
      //   filter.marketCallId = { $in: marketCalls };
      // }

      if (req.user.role === ROLES.CLIENT) {
        filter.submittedBy = req.user?._id;
      }

      if (req.query?.marketCallId) {
        filter.marketCallId = new ObjectId(req.query.marketCallId);
      }

      if (req.query?.submittedBy) {
        filter.submittedBy = new ObjectId(req.query.submittedBy);
      }

      if (filter?.limit >= 0 && filter?.page >= 0) {
        pagination.limit = filter.limit;
        pagination.page = filter.page;
        delete filter.limit;
        delete filter.page;
      }

      if (filter?.fromDate || filter?.toDate) {
        filter.createdAt = {};
        if (filter?.fromDate) {
          filter.createdAt = { $gte: new Date(filter?.fromDate) };
        }
        if (filter?.toDate) {
          filter.createdAt = { $lte: new Date(filter?.toDate) };
        }
      }

      if (filter?.populate) {
        populate = filter.populate?.split(",");
        delete filter?.populate;
      }

      const responses = await ResponseService.getResponse(
        filter,
        pagination,
        populate
      );

      res.json(response(responses, "Your response submitted successfully"));
    } catch (err) {
      next(err);
    }
  }

  static async updateResponse(req, res, next) {
    try {
      const id = req.params.id;
      const responseData = await ResponseService.getOneResponse({ _id: id });
      if (
        [RESPONSE_STATUS.COMPLETE, RESPONSE_STATUS.REJECTED].includes(
          responseData?.status
        )
      ) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Status can not be modified already reached to final state"
        );
      }
      const marketCall = await MarketCallService.getOneMarketCall({
        createdBy: req.user._id,
        _id: responseData.marketCallId,
        organization: req.user.organization,
      });
      if (!marketCall)
        throw new ApiError(
          httpStatus.FORBIDDEN,
          "You can not update this response"
        );
      const updatedResponse = await ResponseService.updateResponse(id, {
        ...req.body,
      });

      res.json(response(updatedResponse, "Response status updated"));
    } catch (err) {
      next(err);
    }
  }
};
