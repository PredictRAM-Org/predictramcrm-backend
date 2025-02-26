const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { MarketCallHistory } = require("../models");

module.exports = class MarketCallHistoryService {
  static async createMarketCallHistory(payload, options = {}) {
    try {
      const marketCallHistory = await MarketCallHistory.create(
        [{ ...payload }],
        { options }
      );
      return marketCallHistory;
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }

  static async getMarketCallHistory(
    filter,
    pagination = { limit: 0, page: 0 },
    populate = []
  ) {
    try {
      const limit = Number(pagination?.limit);
      const skip = Number(pagination?.page) * Number(pagination?.limit);
      const base_filter = { ...filter, deleted: { $ne: true } };
      const marketCallHistorys = await MarketCallHistory.find(base_filter)
        .skip(skip)
        .limit(limit)
        .populate([...populate])
        .sort({ date: -1 });

      const total = await MarketCallHistory.countDocuments(base_filter);
      return { marketCallHistorys, total };
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }

  static async getOneMarketCallHistory(filter, populate = []) {
    try {
      const marketCallHistory = await MarketCallHistory.findOne({
        ...filter,
        deleted: { $ne: true },
      }).populate([...populate]);
      if (!marketCallHistory) throw new Error("market call history not found");
      return marketCallHistory;
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }

  static async updateMarketCallHistory(id, payload, filter) {
    try {
      const marketCallHistory = await MarketCallHistory.findOneAndUpdate(
        { _id: id, deleted: { $ne: true }, ...filter },
        { ...payload }
      );
      if (!marketCallHistory) {
        throw new Error("No market call history found");
      }
      return marketCallHistory;
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }

  static async deleteMarketCallHistory(id, filter) {
    try {
      const marketCallHistory = await MarketCallHistory.findOneAndUpdate(
        { _id: id, deleted: { $ne: true }, ...filter },
        { deleted: true }
      );
      if (!marketCallHistory) {
        throw new Error("No market call history found to update");
      }
      return marketCallHistory;
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }
};
