const httpStatus = require("http-status");
const { Organization } = require("../models");
const ApiError = require("../utils/ApiError");

module.exports = class OrganizationService {
  static createorganization = async (organizationBody, options = {}) => {
    try {
      if (!Array.isArray(organizationBody))
        organizationBody = [organizationBody];
      const [organization] = await Organization.create(organizationBody, {
        ...options,
      });

      //TODO: send mail on onboard
      // TODO: this is important

      return organization;
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  };

  static getorganization = async (filters) => {
    try {
      const organization = await Organization.find({
        ...filters,
        deleted: { $ne: true },
      });
      return organization;
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  };

  static updateorganization = async (id, organizationBody, options = {}) => {
    try {
      const organization = await Organization.findOneAndUpdate(
        { _id: id, deleted: { $ne: true } },
        { ...organizationBody },
        { ...options }
      );
      if (!organization) {
        throw new Error("organization not Found");
      }
      return organization;
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  };
};
