const joi = require("joi");
const { objectId } = require("./custom.validation");
const { taskStatus, TASK_STATUS } = require("../enums");

const createTask = {
  body: joi.object({
    title: joi.string().min(3).required(),
    description: joi.string().min(3).required(),
    client: joi.custom(objectId).required(),
    expieryDate: joi.date().required(),
    analyst: joi.custom(objectId).required(),
  }),
};

const getTask = {
  query: joi.object({
    _id: joi.custom(objectId),
    title: joi.string(),
    createdBy: joi.custom(objectId),
    status: joi.string().valid(...taskStatus),
    description: joi.string(),
    client: joi.custom(objectId),
    expieryDate: joi.date(),
    analyst: joi.custom(objectId),
    populate: joi.string(),
    fromDate: joi.date(),
    toDate: joi.date(),
    completionFromDate: joi.date(),
    completiontoDate: joi.date(),
    page: joi.number(),
    limit: joi.number(),
  }),
};

const updateTask = {
  params: joi.object({
    id: joi.custom(objectId).required(),
  }),
  body: joi.object({
    title: joi.string().min(3),
    description: joi.string().min(3),
    status: joi.string().valid(...taskStatus),
    client: joi.custom(objectId),
    expieryDate: joi.date(),
    analyst: joi.custom(objectId),
  }),
};

const assignNewAnalyst = {
  params: joi.object({
    id: joi.custom(objectId).required(),
  }),
  body: joi.object({
    analyst: joi.custom(objectId).required(),
    expieryDate: joi.date(),
  }),
};

const deleteTask = {
  params: joi.object({
    id: joi.string().custom(objectId).required(),
  }),
};

const getOneTask = {
  params: joi.object({
    id: joi.string().custom(objectId).required(),
  }),
  query: joi.object({
    populate: joi.string(),
  }),
};

const getTaskCount = {
  query: joi.object({
    organization: joi.custom(objectId),
    createdBy: joi.custom(objectId),
    analyst: joi.custom(objectId),
    fromDate: joi.date(),
    toDate: joi.date(),
    completionFromDate: joi.date(),
    completiontoDate: joi.date(),
  }),
};

const getAllAnalystTaskCount = {
  query: joi.object({
    organization: joi.custom(objectId),
    limit: joi.string(),
    page: joi.string(),
  }),
};

module.exports = {
  createTask,
  getTask,
  updateTask,
  deleteTask,
  getOneTask,
  assignNewAnalyst,
  getTaskCount,
  getAllAnalystTaskCount,
};
