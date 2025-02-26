const joi = require("joi");
const { createUser } = require("./user.validation");
const { email, password } = require("./custom.validation");

const login = {
  body: joi.object({
    email: joi.custom(email).required(),
    password: joi.custom(password).required(),
  }),
};

const register = { body: joi.array().items(createUser).min(1) };

const changePassword = {
  body: joi.object({
    currentPassword: joi.custom(password).required(),
    newPassword: joi.custom(password).required(),
  }),
};

const sendOTP = {
  body: joi.object({
    email: joi.custom(email).required(),
  }),
};

const resetPassword = {
  body: joi.object({
    otp: joi.string().required(),
    otpToken: joi.string().required(),
    newPassword: joi.custom(password).required(),
  }),
};

module.exports = {
  login,
  register,
  changePassword,
  sendOTP,
  changePassword,
  resetPassword,
};
