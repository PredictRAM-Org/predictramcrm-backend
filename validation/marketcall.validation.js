const joi = require("joi");
const { objectId } = require("./custom.validation");
const { stockCallTypes, marketCallTypes } = require("../enums");
const { createStock } = require("./stock.validation");

const stockData = {
  image: joi.string(),
  symbol: joi.string().required(),
  quantity: joi.number().min(1),
  percentage: joi.number().min(1).max(100),
  type: joi
    .string()
    .valid(...stockCallTypes)
    .required(),
  durationType: joi
    .string()
    .valid(...marketCallTypes)
    .required(),
  startDate: joi.date(),
  endDate: joi.date(),
  stopLossPrice: joi.number(),
  buyPrice: joi.number(),
  targetPrice: joi.number(),
};

const createMarketCall = {
  body: joi.object({
    title: joi.string().required(),
    description: joi.string().required(),
    allocation: joi.string().required(),
    clients: joi.array().items(joi.custom(objectId)),
    stockList: joi.array().items(stockData).min(1).required(),
  }),
};

const getMarketCall = {
  query: joi.object({
    _id: joi.custom(objectId),
    isLive: joi.boolean(),
    type: joi.string(),
    client: joi.custom(objectId),
    createdBy: joi.custom(objectId),
    organization: joi.custom(objectId),
    showResponse: joi.bool(),
    showSubmitted: joi.bool(),
    populate: joi.string(),
    page: joi.string(),
    limit: joi.string(),
  }),
};

const updateMarketCall = {
  params: joi.object({
    id: joi.string().custom(objectId).required(),
  }),
  body: joi.object({
    title: joi.string(),
    description: joi.string(),
    notifiedClients: joi.array().items(joi.custom(objectId)),
    clients: joi.array().items(joi.custom(objectId)),
  }),
};

const deleteMarketCall = {
  params: joi.object({
    id: joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createMarketCall,
  getMarketCall,
  updateMarketCall,
  deleteMarketCall,
};
