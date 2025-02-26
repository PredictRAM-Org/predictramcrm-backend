const UserService = require("./user.service");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");
const otpGenerator = require("otp-generator");
const moment = require("moment");
const envConfig = require("../utils/envConfig");
const { OTP } = require("../models");
const OTPEmail = require("../utils/EmailTemplates/OTP.mail");
const EmailService = require("./email.service");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");

module.exports = class OTPService {
  static async saveOtp(otp, expires, user) {
    try {
      const savedOtp = await OTP.create({ otp, expires, user });
      return savedOtp;
    } catch (err) {
      throw new ApiError(httpStatus.BAD_GATEWAY, err.message);
    }
  }

  static async sendOTP(sendingTo) {
    try {
      const userDoc = await UserService.getOneUser({ email: sendingTo });

      if (!userDoc) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          `${sendingTo} is not registered with any account`
        );
      }

      const otp = this.generateOtp();

      let now = moment();
      const expires = now.add(envConfig.otp.accessExpirationMinutes, "minutes");

      const otpDoc = await this.saveOtp(otp, expires, userDoc.id);

      const newMail = OTPEmail(
        `${userDoc?.firstName} ${userDoc?.lastName}`,
        otp
      );
      await EmailService.sendCustomisedEmail(
        userDoc?.email,
        newMail.subject,
        newMail.html
      );
      const payload = {
        otp_id: otpDoc.id,
        isPhoneVerified: userDoc.isPhoneVerified,
      };

      return {
        timestamp: now.unix(),
        otpToken: jwt.sign(payload, envConfig.secret),
      };
    } catch (err) {
      throw new ApiError(httpStatus.BAD_GATEWAY, err.message);
    }
  }

  static async verifyOTP(otp, otpToken) {
    try {
      let payload;
      try {
        payload = jwt.verify(otpToken, envConfig.secret);
      } catch (error) {
        throw new Error("Invalid token");
      }
      const otpDoc = await OTP.findOne({
        _id: new mongoose.Types.ObjectId(payload.otp_id),
      });

      if (!otpDoc) {
        throw new Error("Wrong OTP");
      }

      if (otpDoc.otp !== Number(otp)) {
        throw new Error("Wrong OTP");
      }

      if (otpDoc.isVerified) {
        throw new Error("OTP has been already used");
      }

      const now = moment();
      const isOTPExpired = now.isAfter(moment(otpDoc.expires));

      if (isOTPExpired) {
        throw new Error("OTP expired");
      }

      otpDoc.isVerified = true;
      await otpDoc.save();
      const userDoc = await UserService.getOneUser({ _id: otpDoc?.user });

      if (!payload.isPhoneVerified) {
        await UserService.updateUser(userDoc?.id, { isEmailVerified: true });
      }
      return userDoc;
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }

  static generateOtp = () => {
    return otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
  };
};
