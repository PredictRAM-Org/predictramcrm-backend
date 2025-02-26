const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { Task } = require("../models");
const { TASK_STATUS } = require("../enums");

module.exports = class TaskService {
  static async createTask(payload) {
    try {
      const task = await Task.create({ ...payload });
      return task;
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }

  static async getTask(
    filter,
    pagination = { limit: 0, page: 0 },
    populate = []
  ) {
    try {
      const limit = Number(pagination?.limit);
      const skip = Number(pagination?.page) * Number(pagination?.limit);
      const base_filter = { ...filter, deleted: { $ne: true } };
      const tasks = await Task.find(base_filter)
        .skip(skip)
        .limit(limit)
        .populate([...populate]);

      const total = await Task.countDocuments(base_filter);
      return { tasks, total };
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }

  static async getOneTask(filter, populate = []) {
    try {
      const task = await Task.findOne({
        ...filter,
        deleted: { $ne: true },
      }).populate([...populate]);
      if (!task) throw new Error("Task not found");
      return task;
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }

  static async updateTask(id, payload, filter) {
    try {
      const task = await Task.findOneAndUpdate(
        { _id: id, deleted: { $ne: true }, ...filter },
        { ...payload }
      );
      if (!task) {
        throw new Error("No task found");
      }
      return task;
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }

  static async deleteTask(id, filter) {
    try {
      const task = await Task.findOneAndUpdate(
        { _id: id, deleted: { $ne: true }, ...filter },
        { deleted: true }
      );
      if (!task) {
        throw new Error("No task found to update");
      }
      return task;
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }

  static async getAnalystTaskCount(analyst) {
    try {
      const totalTask = await Task.countDocuments({
        $or: [
          { analyst: analyst },
          { notRespondedBy: analyst },
          { rejectedBy: analyst },
        ],
        deleted: { $ne: true },
      });
      const completedTask = await Task.countDocuments({
        analyst: analyst,
        status: TASK_STATUS.COMPLETE,
        deleted: { $ne: true },
      });
      const pendingTask = await Task.countDocuments({
        analyst: analyst,
        status: TASK_STATUS.PENDING,
        expieryDate: { $gte: new Date() },
        deleted: { $ne: true },
      });
      const rejectedTask = await Task.countDocuments({
        $or: [
          { analyst: analyst, status: TASK_STATUS.REJECTED },
          { rejectedBy: analyst },
        ],
        deleted: { $ne: true },
      });
      const expiredTask = await Task.countDocuments({
        $or: [
          {
            analyst: analyst,
            status: TASK_STATUS.PENDING,
            expieryDate: { $lt: new Date() },
          },
          { notRespondedBy: analyst },
        ],
        deleted: { $ne: true },
      });
      const data = {
        "TOTAL TASKS": totalTask,
        "COMPLETE TASKS": completedTask,
        "PENDING TASKS": pendingTask,
        "REJECTED TASKS": rejectedTask,
        "EXPIRED TASKS": expiredTask,
      };
      return data;
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }
};
