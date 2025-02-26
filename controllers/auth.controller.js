const { AuthService, UserService, OTPService } = require("../services");
const { DBConnect, transactionOptions } = require("../utils/DBconfig");
const response = require("../utils/formatResponse");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");

module.exports = class AuthController {
  static login = async (req, res, next) => {
    try {
      const { user } = req;
      res.json(response(user, "User login successful"));
    } catch (err) {
      next(err);
    }
  };

  static checkUserAuth = async (req, res, next) => {
    try {
      res.json(response(req.user, "User is authenticated"));
    } catch (err) {
      next(err);
    }
  };

  static register = async (req, res, next) => {
    try {
      let organization = req.body[0].organization || null;
      if (req?.user?.organization) {
        organization = req.user.organization;
      }
      const session = await (await DBConnect()).startSession();
      let user;
      await session.withTransaction(async (session) => {
        user = await AuthService.register(req.body, organization, {
          session,
        });
        // TODO: LOOP THROUGH CREATED USER AND CREATE PREDICTRAM ACCOUNT IF ROLE IS EMPLOYEE
      }, transactionOptions);
      res.json(response(user, "User register successfully"));
    } catch (err) {
      next(err);
    }
  };

  static changePassword = async (req, res, next) => {
    try {
      const user = await UserService.getOneUser({ _id: req.user.id });
      const isPasswordMatch = bcrypt.compareSync(
        req.body?.currentPassword,
        user?.password
      );
      if (!isPasswordMatch) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Incorrect Password");
      }
      const hashPassword = AuthService.hashUserPassword(req.body?.newPassword);
      await UserService.updateUser(user?.id, {
        password: hashPassword,
      });
      res.json(response({}, "Password changed successfully"));
    } catch (err) {
      next(err);
    }
  };

  static sendForgetPasswordOTP = async (req, res, next) => {
    try {
      const otp = await OTPService.sendOTP(req.body.email);
      res.json(response(otp, "OTP sent check your email"));
    } catch (err) {
      next(err);
    }
  };

  static resetPassword = async (req, res, next) => {
    try {
      const user = await OTPService.verifyOTP(
        req.body?.otp,
        req.body?.otpToken
      );
      if (user) {
        const hashPassword = AuthService.hashUserPassword(
          req.body?.newPassword
        );
        await UserService.updateUser(user?._id, { password: hashPassword });
      }
      res.json(response({}, "Password reset successfully"));
    } catch (err) {
      next(err);
    }
  };
};
