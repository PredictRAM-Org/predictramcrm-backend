const httpStatus = require("http-status");
const { User } = require("../models");
const ApiError = require("../utils/ApiError");

module.exports = class UserService {
  static async createUser(payload, options = {}) {
    try {
      const user = await User.create(payload, { ...options });
      return user;
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }
  static async getOneUser(filter) {
    try {
      const user = await User.findOne({ ...filter, deleted: { $ne: true } });
      return user;
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }

  static async getUsers(
    filter = {},
    paginate = { limit: 0, page: 0 },
    options = {}
  ) {
    try {
      const skip = paginate.limit * paginate.page;

      const base_filter = { ...filter, deleted: { $ne: true } };
      const user = await User.find(base_filter)
        .skip(skip)
        .limit(paginate.limit)
        .session(options?.session);
      const total = await User.countDocuments(base_filter).session(
        options?.session
      );
      return { user, total };
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }

  static async updateUser(id, payload, filter) {
    try {
      const user = await User.findOneAndUpdate(
        { _id: id, deleted: { $ne: true }, ...filter },
        { ...payload }
      );
      if (!user) {
        throw new Error("No user found to update");
      }
      return user;
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }

  static async clientEmployeeLink(payload, filter, options = {}) {
    try {
      const { clients, employee } = payload;
      const link = await User.updateMany(
        { _id: { $in: clients }, ...filter },
        {
          managedBy: employee,
        },
        { ...options }
      );
      return link;
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }

  static async clientEmployeeUnlink(payload, filter, options = {}) {
    try {
      const { clients } = payload;
      const unlink = await User.updateMany(
        { _id: { $in: clients }, ...filter },
        {
          $unset: { managedBy: "" },
        },
        { ...options }
      );
      return unlink;
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }

  static async deleteUser(id, filter) {
    try {
      const user = await User.findOneAndUpdate(
        { _id: id, deleted: { $ne: true }, ...filter },
        { deleted: true }
      );
      if (!user) {
        throw new Error("No user found to update");
      }
      return user;
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }
};
