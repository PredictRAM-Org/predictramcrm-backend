const { MarketCallHistoryController } = require("../../controllers");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const { MarketCallHistoryValidate } = require("../../validation");

const router = require("express").Router();

router.use(auth);

router.get(
  "/",
  validate(MarketCallHistoryValidate.getMarketCallHistory),
  MarketCallHistoryController.getMarketCallHistory
);

module.exports = router;
