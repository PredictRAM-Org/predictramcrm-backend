const httpStatus = require("http-status");
const { ROLES, TASK_STATUS, STOCK_CHANGE_STATE } = require("../enums");
const { StockService } = require("../services");
const response = require("../utils/formatResponse");
const { MarketCallHistory, Stock } = require("../models");
const { ObjectId } = require("mongoose").Types;
const moment = require("moment");

module.exports = class StockController {
  static async createStock(req, res, next) {
    try {
      if (req?.user?.organization) {
        req.body.organization = req.user.organization;
      }
      const { marketCall, organization } = req.body;
      const currentDate = new Date();
      const startOfDay = moment(currentDate).startOf("day").toDate();
      const endOfDay = moment(currentDate).endOf("day").toDate();

      // create stock
      const [stock] = await StockService.createStock([{ ...req.body }]);

      // find all stocks of that market call
      const currentPortfolio = await Stock.find({ marketCall });

      // craete market call history if on this day any change occured then update that or create new
      await MarketCallHistory.findOneAndUpdate(
        {
          marketCall,
          organization,
          date: { $gte: startOfDay, $lte: endOfDay },
        },
        {
          marketCall,
          date: new Date(),
          $push: {
            stockChanges: {
              symbol: stock?.symbol,
              date: new Date(),
              state: STOCK_CHANGE_STATE.ADD,
              currentStockInfo: stock,
            },
          },
          currentPortfolio,
          organization,
        },
        { upsert: true }
      );
      res.json(response(stock, "Stock created"));
    } catch (err) {
      next(err);
    }
  }

  // TODO: SECURITY FIX
  static async updateStock(req, res, next) {
    try {
      const stock = await StockService.getOneStock({
        _id: new ObjectId(req.params.id),
      });

      const { marketCall, organization } = stock;

      // update stock
      const currentStockInfo = await StockService.updateStock(
        req.params.id,
        req.body
      );

      // find all stocks of that market call
      const currentPortfolio = await Stock.find({ marketCall });

      // create market call history if on this day any change occured then update that or create new
      const currentDate = new Date();
      const startOfDay = moment(currentDate).startOf("day").toDate();
      const endOfDay = moment(currentDate).endOf("day").toDate();

      await MarketCallHistory.findOneAndUpdate(
        {
          marketCall,
          organization,
          date: { $gte: startOfDay, $lte: endOfDay },
        },
        {
          marketCall,
          date: new Date(),
          $push: {
            stockChanges: {
              symbol: stock?.symbol,
              date: new Date(),
              state: STOCK_CHANGE_STATE.EDIT,
              previousStockInfo: stock,
              currentStockInfo,
            },
          },
          currentPortfolio,
          organization,
        },
        { upsert: true }
      );

      res.json(response({}, "Stock updated"));
    } catch (err) {
      next(err);
    }
  }

  // TODO: SECURITY FIX
  static async deleteStock(req, res, next) {
    try {
      const stock = await StockService.getOneStock({
        _id: new ObjectId(req.params.id),
      });

      const { marketCall, organization } = stock;

      // delete stock
      await StockService.deleteStock(req.params.id);

      // find all stocks of that market call
      const currentPortfolio = await Stock.find({ marketCall });

      // create market call history if on this day any change occured then update that or create new
      const currentDate = new Date();
      const startOfDay = moment(currentDate).startOf("day").toDate();
      const endOfDay = moment(currentDate).endOf("day").toDate();

      await MarketCallHistory.findOneAndUpdate(
        {
          marketCall,
          organization,
          date: { $gte: startOfDay, $lte: endOfDay },
        },
        {
          marketCall,
          date: new Date(),
          $push: {
            stockChanges: {
              symbol: stock?.symbol,
              date: new Date(),
              state: STOCK_CHANGE_STATE.REMOVE,
              previousStockInfo: stock,
            },
          },
          currentPortfolio,
          organization,
        },
        { upsert: true }
      );

      res.json(response({}, "Stock deleted"));
    } catch (err) {
      next(err);
    }
  }

  static async getOneStock(req, res, next) {
    try {
      const stock = await StockService.getOneStock({ _id: req.params.id });

      res.json(response(stock, "Stock found"));
    } catch (err) {
      next(err);
    }
  }
};
