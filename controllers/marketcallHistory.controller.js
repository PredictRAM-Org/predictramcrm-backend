const { MarketCallHistoryService } = require("../services");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const response = require("../utils/formatResponse");

module.exports = class MarketCallHistoryController {
  static async getMarketCallHistory(req, res, next) {
    try {
      const filter = { ...req.query };
      let populate = [];
      const pagination = { limit: 0, page: 0 };

      if (req?.user?.organization) {
        filter.organization = req.user.organization;
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

      const marketCallHistory =
        await MarketCallHistoryService.getMarketCallHistory(
          filter,
          pagination,
          populate
        );
      res.send(response(marketCallHistory, "Market Call History"));
    } catch (err) {
      next(err);
    }
  }
};
