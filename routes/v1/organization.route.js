const { OrganizationController } = require("../../controllers");
const { roleBasedAccess } = require("../../middlewares/accessControl");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const { OrganizationValidate } = require("../../validation");

const router = require("express").Router();

router.post(
  "/",
  auth,
  roleBasedAccess([]),
  validate(OrganizationValidate.createOrganizationWithPrimaryUser),
  OrganizationController.createOrganizationWithPrimaryUser
);
router.get(
  "/",
  validate(OrganizationValidate.getOrganization),
  OrganizationController.getorganization
);
router.put(
  "/:id",
  auth,
  roleBasedAccess([]),
  validate(OrganizationValidate.updateorganization),
  OrganizationController.updateorganization
);

module.exports = router;
