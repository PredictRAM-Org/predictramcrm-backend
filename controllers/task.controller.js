const httpStatus = require("http-status");
const { ROLES, TASK_STATUS } = require("../enums");
const { TaskService, UserService } = require("../services");
const ApiError = require("../utils/ApiError");
const response = require("../utils/formatResponse");
const { ObjectId } = require("mongoose").Types;
const moment = require("moment");
const { Task } = require("../models");

module.exports = class TaskController {
  static async createTask(req, res, next) {
    try {
      if (req?.user?.organization) {
        req.body.organization = req.user.organization;
      }
      req.body.createdBy = req?.user?._id;
      const task = await TaskService.createTask(req.body);
      res.json(response(task, "Task created"));
    } catch (err) {
      next(err);
    }
  }

  static async getTasks(req, res, next) {
    try {
      const filter = { ...req.query };
      const pagination = { limit: 0, page: 0 };
      let populate = [];

      if (req.user?.organization) {
        filter.organization = req.user.organization;
      }

      if (req.user.role === ROLES.EMPLOYEE) {
        filter.createdBy = req.user._id;
      }

      if (req.user.role === ROLES.ANALYST) {
        filter.analyst = req.user._id;
      }

      if (filter._id) {
        filter._id = new ObjectId(filter._id);
      }

      if (filter.limit >= 0 && filter.page >= 0) {
        pagination.limit = filter.limit;
        pagination.page = filter.page;
        delete filter.limit;
        delete filter.page;
      }

      if (filter.fromDate || filter.toDate) {
        filter.createdAt = {
          ...(filter.fromDate ? { $gte: new Date(filter.fromDate) } : {}),
          ...(filter.toDate ? { $lte: new Date(filter.toDate) } : {}),
        };
        delete filter.fromDate;
        delete filter.toDate;
      }

      if (filter.completionFromDate || filter.completiontoDate) {
        filter.completionDate = {
          ...(filter.completionFromDate
            ? { $gte: new Date(filter.completionFromDate) }
            : {}),
          ...(filter.completiontoDate
            ? { $lte: new Date(filter.completiontoDate) }
            : {}),
        };
        delete filter.completionFromDate;
        delete filter.completiontoDate;
      }

      if (filter.populate) {
        populate = filter.populate.split(",");
        delete filter.populate;
      }

      if (filter.status === TASK_STATUS.PENDING) {
        filter.expieryDate = { $gte: new Date() };
      }

      if (filter.status === TASK_STATUS.EXPIRED) {
        filter.expieryDate = { $lt: new Date() };
        filter.status = TASK_STATUS.PENDING;
      }

      const task = await TaskService.getTask(filter, pagination, populate);

      res.json(response(task, "Tasks fetched"));
    } catch (err) {
      next(err);
    }
  }

  static async getTaskCount(req, res, next) {
    try {
      const filter = { ...req.query };

      if (req.user?.organization) {
        filter.organization = req.user.organization;
      }

      if (req.user.role === ROLES.EMPLOYEE) {
        filter.createdBy = req.user._id;
      }

      if (filter.fromDate || filter.toDate) {
        filter.createdAt = {
          ...(filter.fromDate ? { $gte: new Date(filter.fromDate) } : {}),
          ...(filter.toDate ? { $lte: new Date(filter.toDate) } : {}),
        };
        delete filter.fromDate;
        delete filter.toDate;
      }

      if (filter.completionFromDate || filter.completiontoDate) {
        filter.completionDate = {
          ...(filter.completionFromDate
            ? { $gte: new Date(filter.completionFromDate) }
            : {}),
          ...(filter.completiontoDate
            ? { $lte: new Date(filter.completiontoDate) }
            : {}),
        };
        delete filter.completionFromDate;
        delete filter.completiontoDate;
      }

      const totalTask = await Task.countDocuments({
        ...filter,
        deleted: { $ne: true },
      });
      const completedTask = await Task.countDocuments({
        ...filter,
        status: TASK_STATUS.COMPLETE,
        deleted: { $ne: true },
      });
      const pendingTask = await Task.countDocuments({
        ...filter,
        status: TASK_STATUS.PENDING,
        expieryDate: { $gte: new Date() },
        deleted: { $ne: true },
      });
      const rejectedTask = await Task.countDocuments({
        ...filter,
        status: TASK_STATUS.REJECTED,
        deleted: { $ne: true },
      });
      const expiredTask = await Task.countDocuments({
        ...filter,
        status: TASK_STATUS.PENDING,
        expieryDate: { $lt: new Date() },
        deleted: { $ne: true },
      });

      const data = {
        "TOTAL TASKS": totalTask,
        "COMPLETE TASKS": completedTask,
        "PENDING TASKS": pendingTask,
        "REJECTED TASKS": rejectedTask,
        "EXPIRED TASKS": expiredTask,
      };
      res.send(response(data, "Task Count fetched"));
    } catch (err) {
      next(err);
    }
  }

  static async getAnalystTaskCount(req, res, next) {
    try {
      const data = await TaskService.getAnalystTaskCount(req.user._id);

      res.send(response(data, "Analyst Task Count fetched"));
    } catch (err) {
      next(err);
    }
  }

  static async getAllAnalystTaskCount(req, res, next) {
    try {
      let filter = req.query;
      const paginate = { limit: 0, page: 0 };

      if (filter?.page >= 0 && filter?.limit >= 0) {
        paginate.limit = Number(filter.limit);
        paginate.page = Number(filter.page);
        delete filter.limit;
        delete filter.page;
      }
      if (req.user?.organization) {
        filter.organization = req.user.organization;
      }
      const { user = [], total } = await UserService.getUsers(
        { ...filter, role: ROLES.ANALYST },
        paginate
      );
      const data = [];
      for (let u of user) {
        const taskCounts = await TaskService.getAnalystTaskCount(u?.id);
        data.push({ ...u.toObject(), ...taskCounts });
      }
      res.send(response({ analyst: data, total }, "all analyst task count"));
    } catch (err) {
      next(err);
    }
  }

  static async getAnalystTasks(req, res, next) {
    try {
      const filter = { ...req.query };
      const pagination = { limit: 0, page: 0 };
      let populate = [];

      if (req.user?.organization) {
        filter.organization = req.user.organization;
      }

      filter.$or = [
        { analyst: req.user._id },
        { notRespondedBy: req.user._id },
        { rejectedBy: req.user._id },
      ];

      if (filter._id) {
        filter._id = new ObjectId(filter._id);
      }

      if (filter.limit >= 0 && filter.page >= 0) {
        pagination.limit = filter.limit;
        pagination.page = filter.page;
        delete filter.limit;
        delete filter.page;
      }

      if (filter.fromDate) {
        filter.createdAt = {
          $gte: new Date(filter.fromDate),
        };
        delete filter.fromDate;
      }

      if (filter.toDate) {
        filter.createdAt = {
          ...filter?.createdBy,
          $lte: new Date(filter.toDate),
        };
        delete filter.toDate;
      }

      if (filter.populate) {
        populate = filter.populate.split(",");
        delete filter.populate;
      }

      if (filter.status === TASK_STATUS.PENDING) {
        filter.expieryDate = { $gte: new Date() };
        filter.analyst = req.user._id;
        delete filter.$or;
      }

      if (filter.status === TASK_STATUS.REJECTED) {
        filter.$or = [
          { analyst: req.user._id, status: TASK_STATUS.REJECTED },
          { rejectedBy: req.user._id },
        ];
        delete filter.status;
      }

      if (filter.status === TASK_STATUS.EXPIRED) {
        filter.$or = [
          {
            analyst: req.user._id,
            status: TASK_STATUS.PENDING,
            expieryDate: { $lt: new Date() },
          },
          { notRespondedBy: req.user._id },
        ];
        delete filter.status;
      }

      const task = await TaskService.getTask(filter, pagination, populate);

      res.json(response(task, "Tasks fetched"));
    } catch (err) {
      next(err);
    }
  }

  static async updateTask(req, res, next) {
    try {
      const filter = {};
      if (req.user?.organization) {
        filter.organization = req.user.organization;
      }

      if (req.user.role === ROLES.EMPLOYEE) {
        filter.createdBy = req.user._id;
      }

      if (req.user.role === ROLES.ANALYST) {
        filter.analyst = req.user._id;
      }

      if (req.body.status === TASK_STATUS.COMPLETE) {
        req.body.completionDate = new Date();
      }

      const task = await TaskService.updateTask(
        req.params.id,
        req.body,
        filter
      );
      res.json(response(task, "Task updated"));
    } catch (err) {
      next(err);
    }
  }

  static async assignNewAnalyst(req, res, next) {
    try {
      const filter = {};
      if (req.user?.organization) {
        filter.organization = req.user.organization;
      }

      if (req.user.role === ROLES.EMPLOYEE) {
        filter.createdBy = req.user._id;
      }

      const existingTask = await TaskService.getOneTask({
        ...filter,
        _id: req.params.id,
      });

      if (TASK_STATUS.COMPLETE === existingTask.status)
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "You can not change analyst in complete state"
        );

      if (existingTask?.analyst.toString() !== req.body?.analyst.toString()) {
        if (existingTask.status === TASK_STATUS.REJECTED) {
          req.body.$push = { rejectedBy: [existingTask?.analyst] };
        } else if (
          existingTask.status === TASK_STATUS.PENDING &&
          moment(new Date()).isAfter(new Date(existingTask?.expieryDate))
        ) {
          req.body.$push = { notRespondedBy: [existingTask?.analyst] };
        }
      }

      const task = await TaskService.updateTask(
        req.params.id,
        { ...req.body, status: TASK_STATUS.PENDING },
        filter
      );
      res.json(response(task, "New Analyst assigned"));
    } catch (err) {
      next(err);
    }
  }

  static async getOneTask(req, res, next) {
    try {
      const filter = { ...req.query };
      let populate = [];
      if (req.user?.organization) {
        filter.organization = req.user.organization;
      }

      if (filter.populate) {
        populate = filter.populate.split(",");
        delete filter?.populate;
      }

      if (req.user.role === ROLES.EMPLOYEE) {
        filter.createdBy = req.user._id;
      }

      if (req.user.role === ROLES.ANALYST) {
        filter.$or = [
          { analyst: req.user._id },
          { notRespondedBy: req.user._id },
          { rejectedBy: req.user._id },
        ];
      }

      const task = await TaskService.getOneTask(
        {
          _id: req.params.id,
          ...filter,
        },
        populate
      );
      res.json(response(task));
    } catch (err) {
      next(err);
    }
  }

  static async deleteTask(req, res, next) {
    try {
      const filter = {};
      if (req.user?.organization) {
        filter.organization = req.user.organization;
      }
      filter.createdBy = req.user._id;
      await TaskService.deleteTask(req.params.id, filter);
      res.json(response({}, "Task deleted"));
    } catch (err) {
      next(err);
    }
  }
};
