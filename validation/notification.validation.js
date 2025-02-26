// validation/notification.validation.js
const joi = require('joi');
const { objectId } = require('./custom.validation');
const { NOTIFICATION_TYPES } = require('../enums');

const getNotifications = {
  query: joi.object({
    type: joi.string().valid(...Object.values(NOTIFICATION_TYPES)),
    read: joi.boolean(),
    marketCall: joi.string().custom(objectId),
    recipient: joi.string().custom(objectId),
    page: joi.number().integer().min(1),
    limit: joi.number().integer().min(1),
    populate: joi.string(),
  }),
};

const markNotificationRead = {
  params: joi.object({
    id: joi.string().custom(objectId).required(),
  }),
};

const deleteNotification = {
  params: joi.object({
    id: joi.string().custom(objectId).required(),
  }),
};

const createNotification = {
  body: joi.object({
    type: joi.string().valid(...Object.values(NOTIFICATION_TYPES)).required(),
    recipient: joi.string().custom(objectId).required(),
    marketCall: joi.string().custom(objectId).required(),
    message: joi.string().required(),
  }),
};

module.exports = {
  getNotifications,
  markNotificationRead,
  deleteNotification,
  createNotification,
};