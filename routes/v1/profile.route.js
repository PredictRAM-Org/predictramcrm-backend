const { UserController, ProfileController, MarketCallController } = require("../../controllers");
const { ROLES } = require("../../enums");
const { roleBasedAccess } = require("../../middlewares/accessControl");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const { UserValidate, MarketCallValidate } = require("../../validation");

const router = require("express").Router();

// router.use(auth);

router.get("/", ProfileController.getUserProfile);
router.put(
  "/:id",
  auth,
  roleBasedAccess([ROLES.ANALYST]),
  validate(UserValidate.updateUser),
  ProfileController.updateProfile
);

module.exports = router;
