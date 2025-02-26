const { ProfileMarketCallController } = require("../../controllers");
const { ROLES } = require("../../enums");
const { roleBasedAccess } = require("../../middlewares/accessControl");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const { MarketCallValidate } = require("../../validation");

const router = require("express").Router();

// router.use(auth);

router.get(
  "/",
  validate(MarketCallValidate.getMarketCall),
  ProfileMarketCallController.getMarketCall
);

module.exports = router;
