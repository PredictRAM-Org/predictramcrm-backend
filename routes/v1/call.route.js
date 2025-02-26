const { CallController } = require("../../controllers");

const router = require("express").Router();

router.post("/incomeing", CallController.handelIncomeingCall);

module.exports = router;
