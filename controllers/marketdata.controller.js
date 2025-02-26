const { FyersService } = require("../services");
const response = require("../utils/formatResponse");

module.exports = class MarketDataController {
  static async livePrice(req, res, next) {
    try {
      const stocks = req.query?.symbols
        ?.split(",")
        .map((stock) => `NSE:${stock}-EQ`);

      const livePrice = await FyersService.getQuotes(stocks);
      res.json(response(livePrice, "live price fetched successfullly"));
    } catch (err) {
      next(err);
    }
  }
  static async historyData(req, res, next) {
    try {
      const paylaod = {
        symbol: `NSE:${req.query.symbol}-EQ`,
        resolution: req.query.resolution,
        date_format: "1",
        range_from: req.query.fromDate,
        range_to: req.query.toDate,
        cont_flag: "1",
      };

      const historyData = await FyersService.getHistory(paylaod);
      res.json(response(historyData, "stock history fetched successfullly"));
    } catch (err) {
      next(err);
    }
  }
};
