const passport = require("passport");
const { AuthController } = require("../../controllers");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const { AuthValidate } = require("../../validation");
const { roleBasedAccess } = require("../../middlewares/accessControl");
const { ROLES } = require("../../enums");

const router = require("express").Router();

router.post(
  "/login",
  validate(AuthValidate.login),
  passport.authenticate("login-email-password"),
  AuthController.login
);
router.get("/check", auth, AuthController.checkUserAuth);
router.post(
  "/register",
  // roleBasedAccess([ROLES.ADMIN]),
  validate(AuthValidate.register),
  AuthController.register
);
router.post(
  "/send-otp",
  validate(AuthValidate.sendOTP),
  AuthController.sendForgetPasswordOTP
);
router.post(
  "/reset-password",
  validate(AuthValidate.resetPassword),
  AuthController.resetPassword
);
router.post(
  "/change-password",
  validate(AuthValidate.changePassword),
  AuthController.changePassword
);

module.exports = router;
