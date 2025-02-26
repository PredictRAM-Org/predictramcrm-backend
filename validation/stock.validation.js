const joi = require("joi");
const { objectId } = require("./custom.validation");
const {
  taskStatus,
  TASK_STATUS,
  stockCallTypes,
  marketCallTypes,
} = require("../enums");

const createStock = {
  body: joi.object({
    image: joi.string(),
    marketCall: joi.custom(objectId).required(),
    symbol: joi.string().required(),
    quantity: joi.number().min(1).required(),
    type: joi
      .string()
      .valid(...stockCallTypes)
      .required(),
    durationType: joi
      .string()
      .valid(...marketCallTypes)
      .required(),
    stopLossPrice: joi.number(),
    buyPrice: joi.number().required(),
    targetPrice: joi.number().required(),
  }),
};

const getStock = {
  query: joi.object({
    _id: joi.custom(objectId),
    image: joi.string(),
    marketCall: joi.custom(objectId),
    symbol: joi.string(),
    quantity: joi.number().min(1),
    type: joi.string().valid(...stockCallTypes),
    durationType: joi.string().valid(...marketCallTypes),

    stopLossPrice: joi.number(),
    buyPrice: joi.number(),
    targetPrice: joi.number(),
    populate: joi.string(),
    page: joi.number(),
    limit: joi.number(),
  }),
};

const getOneStock = {
  params: joi.object({
    id: joi.string().custom(objectId).required(),
  }),
  query: joi.object({
    populate: joi.string(),
  }),
};

const updateStock = {
  params: joi.object({
    id: joi.custom(objectId).required(),
  }),
  body: joi.object({
    image: joi.string(),
    quantity: joi.number().min(1),
    type: joi.string().valid(...stockCallTypes),
    durationType: joi.string().valid(...marketCallTypes),

    stopLossPrice: joi.number(),
    buyPrice: joi.number(),
    targetPrice: joi.number(),
  }),
};

const deleteStock = {
  params: joi.object({
    id: joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createStock,
  getStock,
  updateStock,
  deleteStock,
  getOneStock,
};
