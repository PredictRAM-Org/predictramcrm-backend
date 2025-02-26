const joi = require("joi");

const livePrice = {
  query: joi.object({
    symbols: joi.string().required(),
  }),
};

const historyData = {
  query: joi.object({
    symbol: joi.string().required(),
    resolution: joi.string().required(),
    fromDate: joi.string().required(),
    toDate: joi.string().required(),
  }),
};

module.exports = { livePrice, historyData };
