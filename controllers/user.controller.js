const httpStatus = require("http-status");
const { User } = require("../models");
const ApiError = require("../utils/ApiError");
const { UserService } = require("../services");
const response = require("../utils/formatResponse");
const { ROLES } = require("../enums");

module.exports = class UserController {
  static async getUsers(req, res, next) {
    try {
      let filter = req.query;

      const paginate = { limit: 0, page: 0 };

      if (filter?.page >= 0 && filter?.limit >= 0) {
        paginate.limit = Number(filter.limit);
        paginate.page = Number(filter.page);
        delete filter.limit;
        delete filter.page;
      }

      if (filter?.isManagedBy === false) {
        filter.managedBy = { $exists: false };
        delete filter?.isManagedBy;
      }

      if (filter?.isManagedBy === true) {
        filter.managedBy = { $exists: true };
        delete filter?.isManagedBy;
      }

      if (req.user?.organization) {
        filter.organization = req.user.organization;
      }
      if (req.user?.role === ROLES.EMPLOYEE) {
        filter = {
          $and: [
            filter,
            {
              $or: [
                { managedBy: req.user._id },
                { _id: req.user._id },
                { role: ROLES.ANALYST },
              ],
            },
          ],
        };
      }
      if (req.user?.role === ROLES.CLIENT) {
        filter = {
          $and: [
            filter,
            { _id: { $in: [req.user?._id, req.user?.managedBy] } },
          ],
        };
      }

      const user = await UserService.getUsers(filter, paginate);
      res.json(response(user, "Users fetch successful"));
    } catch (err) {
      next(err);
    }
  }

  static async updateUser(req, res, next) {
    try {
      let filter = {};
      let body = req.body;

      if (req.user?.organization) {
        filter.organization = req.user.organization;
      }

      if (body.ekyc && body.ekycDocid) {
        body["kyc.ekyc"] = body.ekyc;
        body["kyc.ekycDocid"] = body.ekycDocid;
        delete body.ekycDocid;
        delete body.ekyc;
      }

      if (body.esign && body.esignDocid) {
        body["kyc.esign"] = body.esign;
        body["kyc.esignDocid"] = body.esignDocid;
        delete body.esignDocid;
        delete body.esign;
      }
      if (body.esignDocid) {
      }

      if (
        [ROLES.EMPLOYEE, ROLES.CLIENT].includes(req.user?.role) &&
        req.params.id !== req.user.id
      ) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          "You can not update others profile"
        );
      }

      const user = await UserService.updateUser(req.params.id, body, filter);
      res.json(response(user, "User updated"));
    } catch (err) {
      next(err);
    }
  }

  static async userLinkUnlink(req, res, next) {
    try {
      const { type } = req.params;
      const filter = {};
      if (req.user?.organization) {
        filter.organization = req.user.organization;
      }
      if (type === "LINK") {
        const link = await UserService.clientEmployeeLink(req.body, filter);
        res.json(response(link, "clients are assigned"));
      } else if (type === "UNLINK") {
        const unlink = await UserService.clientEmployeeUnlink(req.body, filter);
        res.json(response(unlink, "clients are unassigned"));
      }
    } catch (err) {
      next(err);
    }
  }
  static async deleteUser(req, res, next) {
    try {
      let filter = {};
      if (req.user?.organization) {
        filter.organization = req.user.organization;
      }

      if (
        [ROLES.EMPLOYEE, ROLES.CLIENT].includes(req.user?.role) &&
        req.params.id !== req.user.id
      ) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          "You can not update others profile"
        );
      }

      const user = await UserService.deleteUser(req.params.id, filter);
      res.json(response({}, "User deleted"));
    } catch (err) {
      next(err);
    }
  }
};
