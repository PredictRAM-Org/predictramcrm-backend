const { MarketDataController } = require("../../controllers");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const { MarketDataValidate } = require("../../validation");

const router = require("express").Router();

router.use(auth);

router.get(
  "/live",
  validate(MarketDataValidate.livePrice),
  MarketDataController.livePrice
);
router.get(
  "/history",
  validate(MarketDataValidate.historyData),
  MarketDataController.historyData
);

module.exports = router;
