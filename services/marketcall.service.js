const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { MarketCall } = require("../models");
const UserService = require("./user.service");
const { sendToEmailQueue } = require("../Queue/email.queue");
const NotificationService = require("./notification.service");

module.exports = class MarketCallService {
  static async createMarketCall(payload, options = {}) {
    try {
      const marketCall = await MarketCall.create([{ ...payload }], {
        ...options,
      });
      return marketCall;
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }

  static async getMarketCall(
    filter,
    populate,
    pagination = { page: 0, limit: 0 }
  ) {
    try {
      const skip = pagination?.page * pagination?.limit;
      const query = {
        ...filter,
        deleted: { $ne: true },
      };
      const marketCall = await MarketCall.find(query)
        .skip(skip)
        .limit(pagination?.limit)
        .populate(populate)
        .sort({ createdAt: -1 });
      const docCount = await MarketCall.countDocuments(query);
      return { total: docCount, marketCallData: marketCall };
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }

  static async getMarketCallWithResponse(
    marketFilter,
    responseFilter,
    populate,
    pagination,
    showSubmitted
  ) {
    try {
      const limit = Number(pagination?.limit);
      const skip = Number(pagination?.page) * Number(pagination?.limit);

      const query = [
        {
          $match: {
            ...marketFilter,
          },
        },
        {
          $lookup: {
            from: "responses",
            let: { marketCallId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$marketCallId", "$$marketCallId"] },
                  ...responseFilter,
                },
              },
              {
                $lookup: {
                  from: "users",
                  localField: "submittedBy",
                  foreignField: "_id",
                  as: "submittedBy",
                },
              },
              { $unwind: "$submittedBy" },
              {
                $project: {
                  _id: 0,
                  submittedBy: {
                    _id: 1,
                    phone: 1,
                    email: 1,
                    firstName: 1,
                    lastName: 1,
                  },
                  response: 1,
                  status: 1,
                },
              },
            ],
            as: "responses",
          },
        },
        {
          $addFields: {
            id: "$_id",
          },
        },
      ];

      if (!marketFilter?._id) {
        query.push({
          $match: {
            responses: showSubmitted ? { $ne: [] } : { $eq: [] },
          },
        });
      }

      const [count] = await MarketCall.aggregate(query).count("totalDocuments");

      let result = [];
      if (limit > 0) {
        result = await MarketCall.aggregate(query)
          .skip(skip)
          .limit(limit)
          .sort({ endDate: 1 });
      } else {
        result = await MarketCall.aggregate(query);
      }

      const marketCallWithResponse = await MarketCall.populate(
        result,
        populate
      );

      return {
        total: count?.totalDocuments || 0,
        marketCallData: marketCallWithResponse,
      };
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }

  static async getOneMarketCall(filter) {
    try {
      const marketCall = await MarketCall.findOne({
        ...filter,
        deleted: { $ne: true },
      });
      if (!marketCall) throw new Error("Market call not found");
      return marketCall;
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }

  static async updateMarketCall(id, payload, filter) {
    try {
      const marketCall = await MarketCall.findOneAndUpdate(
        { _id: id, deleted: { $ne: true }, ...filter },
        { ...payload, new: true }
      );

      // Check if clients array was updated
      if (payload.clients) {
        const newClients = payload.clients.filter(
          client => !marketCall.clients.includes(client)
        );

        // Create notifications for new subscribers
        await Promise.all(newClients.map(async (clientId) => {
          await NotificationService.createNotification({
            type: 'NEW_SUBSCRIBER',
            recipient: marketCall.createdBy, // Analyst who created the market call
            marketCall: marketCall._id,
            message: `New client subscribed to your "${marketCall.title}" market call`
          });
        }));
      }
      if (!marketCall) {
        throw new Error("No market call found");
      }
      return marketCall;
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }

  static async deleteMarketCall(id, filter) {
    try {
      const marketCall = await MarketCall.findOneAndUpdate(
        { _id: id, deleted: { $ne: true }, ...filter },
        { deleted: true }
      );
      if (!marketCall) {
        throw new Error("No market call found");
      }
      return marketCall;
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }

  static async sendMarketCallEmail(employee) {
    try {
      const sendEmailInfo = (
        await UserService.getUsers({
          managedBy: employee?.id,
        })
      )?.user?.map((client) => ({
        body: {
          email: client?.email,
          sender: employee?.name,
        },
      }));

      await sendToEmailQueue(sendEmailInfo);
    } catch (err) {
      //TODO: handel error trigger mail to super admin
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }
};
