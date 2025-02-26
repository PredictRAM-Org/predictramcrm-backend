const joi = require("joi");
const { objectId } = require("./custom.validation");

const getMarketCallHistory = {
  query: joi.object({
    _id: joi.custom(objectId),
    marketCall: joi.custom(objectId),
    populate: joi.string(),
    page: joi.string(),
    limit: joi.string(),
  }),
};

module.exports = { getMarketCallHistory };
