const httpStatus = require("http-status");
const { NotificationService } = require("../services");
const ApiError = require("../utils/ApiError");
const response = require("../utils/formatResponse");
const { ObjectId } = require("mongoose").Types;

module.exports = class NotificationController {
    static async getNotifications(req, res, next) {
        try {
            const filter = { recipient: req.user._id };
            const pagination = {
                page: parseInt(req.query.page) || 0,
                limit: parseInt(req.query.limit) || 20
            };

            if (req.query.marketCall) {
                filter.marketCall = new ObjectId(req.query.marketCall);
            }

            if (req.query.type) {
                filter.type = req.query.type;
            }

            if (req.query.read) {
                filter.read = req.query.read === 'true';
            }

            const { notifications, total } = await NotificationService.getNotifications(
                filter,
                pagination
            );

            res.json(response({ notifications, total }, "Notifications fetched successfully"));
        } catch (err) {
            next(err);
        }
    }

    static async markNotificationRead(req, res, next) {
        try {
            const notification = await NotificationService.markAsRead(req.params.id);
            if (!notification) {
                throw new ApiError(httpStatus.NOT_FOUND, "Notification not found");
            }
            res.json(response(notification, "Notification marked as read"));
        } catch (err) {
            next(err);
        }
    }

    static async deleteNotification(req, res, next) {
        try {
            const notification = await NotificationService.deleteNotification(req.params.id);
            if (!notification) {
                throw new ApiError(httpStatus.NOT_FOUND, "Notification not found");
            }
            res.json(response({}, "Notification deleted successfully"));
        } catch (err) {
            next(err);
        }
    }

    // Internal API for triggering notifications from other services
    static async createNotification(req, res, next) {
        try {
            const notification = await NotificationService.createNotification(req.body);
            res.json(response(notification, "Notification created successfully"));
        } catch (err) {
            next(err);
        }
    }
};