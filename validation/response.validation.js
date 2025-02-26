const joi = require("joi");
const { objectId } = require("./custom.validation");
const { clientResponses, responseStatus } = require("../enums");

const createResponse = {
  body: joi.object({
    marketCallId: joi.custom(objectId).required(),
    response: joi
      .string()
      .valid(...clientResponses)
      .required(),
    comment: joi.string(),
  }),
};

const getResponse = {
  query: joi.object({
    marketCallId: joi.custom(objectId),
    submittedBy: joi.custom(objectId),
    response: joi.string().valid(...clientResponses),
    populate: joi.string(),
    page: joi.number(),
    limit: joi.number(),
    status: joi.string().valid(...responseStatus),
    fromDate: joi.date(),
    toDate: joi.date(),
  }),
};

const updateResponse = {
  params: joi.object({
    id: joi.string().custom(objectId).required(),
  }),
  body: joi.object({
    status: joi.string().valid(...responseStatus),
  }),
};

module.exports = { createResponse, getResponse, updateResponse };
