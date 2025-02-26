const { ResponseController } = require("../../controllers");
const { ROLES } = require("../../enums");
const { roleBasedAccess } = require("../../middlewares/accessControl");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const { ResponseValidate } = require("../../validation");

const router = require("express").Router();

router.use(auth);

router.post(
  "/",
  roleBasedAccess([ROLES.CLIENT]),
  validate(ResponseValidate.createResponse),
  ResponseController.createResponse
);

router.get(
  "/",
  validate(ResponseValidate.getResponse),
  ResponseController.getResponses
);

router.put(
  "/:id",
  roleBasedAccess([ROLES.ANALYST]),
  validate(ResponseValidate.updateResponse),
  ResponseController.updateResponse
);

module.exports = router;
