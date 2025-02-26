const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { Stock, MarketCall } = require("../models");
const NotificationService = require("./notification.service");

module.exports = class StockService {
  static async createStock(payload = [], options = {}) {
    try {
      const stocks = await Stock.create(payload, { ...options });

      // Get unique market calls from created stocks
      const marketCallIds = [...new Set(stocks.map(stock => stock.marketCall.toString()))];

      // Create notifications for each market call
      await Promise.all(marketCallIds.map(async (marketCallId) => {
        const marketCall = await MarketCall.findById(marketCallId).populate('clients');
        if (!marketCall) return;

        const notifications = marketCall.clients.map(client => ({
          type: 'MARKETCALL_UPDATE',
          recipient: client._id,
          marketCall: marketCallId,
          message: `${stocks.length} stock(s) added to "${marketCall.title}"`
        }));

        await NotificationService.createBulkNotifications(notifications);
      }));

      return stocks;
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }

  static async getStock(
    filter,
    pagination = { limit: 0, page: 0 },
    populate = []
  ) {
    try {
      const limit = Number(pagination?.limit);
      const skip = Number(pagination?.page) * Number(pagination?.limit);
      const base_filter = { ...filter };
      const stocks = await Stock.find(base_filter)
        .skip(skip)
        .limit(limit)
        .populate([...populate]);

      const total = await Stock.countDocuments(base_filter);
      return { stocks, total };
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }

  static async getOneStock(filter, populate = []) {
    try {
      const stock = await Stock.findOne({
        ...filter,
      }).populate([...populate]);
      if (!stock) throw new Error("Stock not found");
      return stock;
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }

  static async updateStock(id, payload, filter = {}) {
    try {
      const stock = await Stock.findOneAndUpdate(
        { _id: id, ...filter },
        { ...payload },
        { new: true }
      );

      if (!stock) throw new Error("No stock found");

      // Get associated market call
      const marketCall = await MarketCall.findById(stock.marketCall).populate('clients');
      if (marketCall) {
        const notifications = marketCall.clients.map(client => ({
          type: 'MARKETCALL_UPDATE',
          recipient: client._id,
          marketCall: stock.marketCall,
          message: `Stock updated in "${marketCall.title}"`
        }));

        await NotificationService.createBulkNotifications(notifications);
      }
      return stock;
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }

  static async deleteStock(id, filter) {
    try {
      // First get the stock to access marketCall reference
      const stock = await Stock.findById(id).populate('marketCall');

      if (!stock) {
        throw new Error("No stock found to delete");
      }

      // Perform deletion
      const deletedStock = await Stock.deleteOne({ _id: id, ...filter });

      if (deletedStock.deletedCount === 0) {
        throw new Error("Stock deletion failed");
      }

      // Create notifications if market call exists
      if (stock.marketCall) {
        const marketCall = await MarketCall.findById(stock.marketCall._id).populate('clients');

        if (marketCall) {
          const notifications = marketCall.clients.map(client => ({
            type: 'MARKETCALL_UPDATE',
            recipient: client._id,
            marketCall: stock.marketCall._id,
            message: `Stock deleted from "${marketCall.title}"`
          }));

          await NotificationService.createBulkNotifications(notifications);
        }
      }

      return deletedStock;
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }
};
