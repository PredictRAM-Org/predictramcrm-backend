const { TaskController } = require("../../controllers");
const { ROLES } = require("../../enums");
const { roleBasedAccess } = require("../../middlewares/accessControl");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const { TaskValidate } = require("../../validation");

const router = require("express").Router();

router.use(auth);

router.post(
  "/",
  roleBasedAccess([ROLES.EMPLOYEE]),
  validate(TaskValidate.createTask),
  TaskController.createTask
);
router.get("/", validate(TaskValidate.getTask), TaskController.getTasks);
router.get(
  "/analyst-task",
  validate(TaskValidate.getTask),
  TaskController.getAnalystTasks
);
router.get(
  "/count",
  validate(TaskValidate.getTaskCount),
  TaskController.getTaskCount
);
router.get(
  "/analyst/count",
  roleBasedAccess([ROLES.ANALYST]),
  TaskController.getAnalystTaskCount
);
router.get(
  "/all-analyst/count",
  validate(TaskValidate.getAllAnalystTaskCount),
  TaskController.getAllAnalystTaskCount
);
router.get(
  "/:id",
  validate(TaskValidate.getOneTask),
  TaskController.getOneTask
);
router.put(
  "/:id",
  roleBasedAccess([ROLES.EMPLOYEE, ROLES.ANALYST]),
  validate(TaskValidate.updateTask),
  TaskController.updateTask
);
router.put(
  "/assign-new-analyst/:id",
  roleBasedAccess([ROLES.EMPLOYEE]),
  validate(TaskValidate.assignNewAnalyst),
  TaskController.assignNewAnalyst
);
router.delete(
  "/:id",
  roleBasedAccess([ROLES.EMPLOYEE]),
  validate(TaskValidate.deleteTask),
  TaskController.deleteTask
);

module.exports = router;
