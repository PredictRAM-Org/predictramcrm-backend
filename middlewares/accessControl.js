const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { model } = require("mongoose");
const { ROLES } = require("../enums");

const roleBasedAccess =
  (acceptedRoles = []) =>
  (req, res, next) => {
    if (![...acceptedRoles, ROLES.SUPER_ADMIN].includes(req?.user?.role)) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You don't have access to this function"
      );
    }
    next();
  };

module.exports = { roleBasedAccess };
