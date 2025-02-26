const { StockController } = require("../../controllers");
const { ROLES } = require("../../enums");
const { roleBasedAccess } = require("../../middlewares/accessControl");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const { StockValidate } = require("../../validation");

const router = require("express").Router();

router.use(auth);

router.post(
  "/",
  roleBasedAccess([ROLES.ANALYST]),
  validate(StockValidate.createStock),
  StockController.createStock
);
// router.get("/", validate(StockValidate.getStock), StockController.getStocks);
router.get(
  "/:id",
  validate(StockValidate.getOneStock),
  StockController.getOneStock
);
router.put(
  "/:id",
  roleBasedAccess([ROLES.ANALYST]),
  validate(StockValidate.updateStock),
  StockController.updateStock
);

router.delete(
  "/:id",
  roleBasedAccess([ROLES.ANALYST]),
  validate(StockValidate.deleteStock),
  StockController.deleteStock
);

module.exports = router;
