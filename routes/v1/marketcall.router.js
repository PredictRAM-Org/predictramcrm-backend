const { MarketCallController } = require("../../controllers");
const { ROLES } = require("../../enums");
const { roleBasedAccess } = require("../../middlewares/accessControl");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const { MarketCallValidate } = require("../../validation");

const router = require("express").Router();

router.use(auth);

router.post(
  "/",
  roleBasedAccess([ROLES.EMPLOYEE, ROLES.ANALYST]),
  validate(MarketCallValidate.createMarketCall),
  MarketCallController.createMarketCall
);
router.get(
  "/",
  validate(MarketCallValidate.getMarketCall),
  MarketCallController.getMarketCall
);
router.put(
  "/:id",
  roleBasedAccess([ROLES.ANALYST, ROLES.CLIENT]),
  validate(MarketCallValidate.updateMarketCall),
  MarketCallController.updateMarketCall
);
router.delete(
  "/:id",
  roleBasedAccess([ROLES.ADMIN, ROLES.EMPLOYEE]),
  validate(MarketCallValidate.deleteMarketCall),
  MarketCallController.deleteMarketCall
);

module.exports = router;
