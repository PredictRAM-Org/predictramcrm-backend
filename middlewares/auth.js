const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");

module.exports = function auth(req, res, next) {
  try {
    if (req.isAuthenticated()) {
      next();
    } else {
      throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized");
    }
  } catch (err) {
    next(err);
  }
};
