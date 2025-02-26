const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { Response } = require("../models");

module.exports = class ResponseService {
  static async createResponse(payload) {
    try {
      const response = await Response.create({ ...payload });
      return response;
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }

  static async getResponse(
    filter,
    pagination = { limit: 0, page: 0 },
    populate = []
  ) {
    try {
      const skip = pagination?.limit * pagination?.page;

      const query = {
        ...filter,
        deleted: { $ne: true },
      };

      const responses = await Response.find(query)
        .skip(skip)
        .limit(pagination?.limit)
        .populate(populate);

      const count = await Response.countDocuments(query);
      return { total: count, responses };
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }

  static async getOneResponse(filter) {
    try {
      const response = await Response.findOne({
        ...filter,
        deleted: { $ne: true },
      });
      if (!response) throw new Error("Response not found");
      return response;
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }

  static async updateResponse(id, payload, filter) {
    try {
      const response = await Response.findOneAndUpdate(
        { _id: id, deleted: { $ne: true }, ...filter },
        { ...payload }
      );
      if (!response) {
        throw new Error("No response found");
      }
      return response;
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }
};
