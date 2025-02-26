const { PredictRamController } = require("../../controllers");
const { roleBasedAccess } = require("../../middlewares/accessControl");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");

const router = require("express").Router();

router.use(auth);

router.get("/risk-score/:client", PredictRamController.getRiskScore);

module.exports = router;
