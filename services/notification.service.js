const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { Notification } = require("../models");
const { DBConnect } = require("../utils/DBconfig");

module.exports = class NotificationService {
    static async createNotification(payload, options = {}) {
        try {
            const notification = await Notification.create([payload], {
                ...options,
            });
            return notification[0];
        } catch (err) {
            throw new ApiError(httpStatus.BAD_REQUEST, err.message);
        }
    }

    static async createBulkNotifications(payloadArray, options = {}) {
        try {
            const session = await (await DBConnect()).startSession();
            let result;

            await session.withTransaction(async () => {
                result = await Notification.insertMany(payloadArray, { session });
            });

            return result;
        } catch (err) {
            throw new ApiError(httpStatus.BAD_REQUEST, err.message);
        }
    }

    static async getNotifications(filter, pagination = { page: 0, limit: 0 }) {
        try {
            const skip = pagination?.page * pagination?.limit;
            const query = {
                ...filter,
                deleted: { $ne: true },
            };
            
            const notifications = await Notification.find(query)
            .skip(skip)
            .limit(pagination?.limit)
            .sort({ createdAt: -1 })
            .populate('marketCall', 'title')
            .populate('recipient', 'firstName lastName email');
            
            const docCount = await Notification.countDocuments(query);
            return { total: docCount, notifications };
        } catch (err) {
            throw new ApiError(httpStatus.BAD_REQUEST, err.message);
        }
    }

    static async markAsRead(notificationId) {
        try {
            return await Notification.findByIdAndUpdate(
                notificationId,
                { read: true },
                { new: true }
            );
        } catch (err) {
            throw new ApiError(httpStatus.BAD_REQUEST, err.message);
        }
    }

    static async deleteNotification(notificationId) {
        try {
            return await Notification.findByIdAndUpdate(
                notificationId,
                { deleted: true },
                { new: true }
            );
        } catch (err) {
            throw new ApiError(httpStatus.BAD_REQUEST, err.message);
        }
    }
};