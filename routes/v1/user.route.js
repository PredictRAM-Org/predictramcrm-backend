const { UserController } = require("../../controllers");
const { ROLES } = require("../../enums");
const { roleBasedAccess } = require("../../middlewares/accessControl");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const { UserValidate } = require("../../validation");

const router = require("express").Router();

router.use(auth);

router.get("/", validate(UserValidate.getUser), UserController.getUsers);
router.put(
  "/:id",
  validate(UserValidate.updateUser),
  UserController.updateUser
);
router.put(
  "/employee/:type",
  roleBasedAccess([ROLES.ADMIN]),
  validate(UserValidate.linkUnlink),
  UserController.userLinkUnlink
);
router.delete(
  "/:id",
  roleBasedAccess([ROLES.ADMIN]),
  validate(UserValidate.deleteUser),
  UserController.deleteUser
);

module.exports = router;
