/* /routes/notification.router.js */
const { NotificationController } = require("../../controllers");
const { ROLES } = require("../../enums");
const { roleBasedAccess } = require("../../middlewares/accessControl");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const { NotificationValidate } = require("../../validation");

const router = require("express").Router();

router.use(auth);

router.get(
    "/",
    roleBasedAccess([ROLES.ANALYST, ROLES.CLIENT, ROLES.EMPLOYEE, ROLES.ADMIN]),
    validate(NotificationValidate.getNotifications),
    NotificationController.getNotifications
);

router.put(
    "/:id",
    roleBasedAccess([ROLES.ANALYST, ROLES.CLIENT, ROLES.EMPLOYEE, ROLES.ADMIN]),
    validate(NotificationValidate.markNotificationRead),
    NotificationController.markNotificationRead
);

router.delete(
    "/:id",
    roleBasedAccess([ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.ANALYST]),
    validate(NotificationValidate.deleteNotification),
    NotificationController.deleteNotification
);

// Internal API for service-to-service communication
router.post(
    "/",
    validate(NotificationValidate.createNotification),
    NotificationController.createNotification
);

module.exports = router;