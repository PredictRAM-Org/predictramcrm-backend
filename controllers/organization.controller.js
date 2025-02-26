const httpStatus = require("http-status");
const { OrganizationService, AuthService } = require("../services");
const ApiError = require("../utils/ApiError");
const { client, transactionOptions, DBConnect } = require("../utils/DBconfig");
const response = require("../utils/formatResponse");

module.exports = class OrganizationController {
  static createOrganizationWithPrimaryUser = async (req, res, next) => {
    try {
      const { organization: orgPayload, user: userPayload } = req.body;
      const session = await (await DBConnect()).startSession();

      const transactionResult = await session.withTransaction(
        async (session) => {
          const org = await OrganizationService.createorganization(orgPayload, {
            session,
          });
          await AuthService.register([userPayload], org?._id, { session });
        },
        transactionOptions
      );

      res.json(
        response({}, "Organization with primary user created successfully")
      );
    } catch (err) {
      next(err);
    }
  };

  static getorganization = async (req, res, next) => {
    try {
      if (req?.user?.organization) {
        req.query._id = req.user.organization;
      }
      const organizations = await OrganizationService.getorganization(
        req.query
      );
      res.json(response(organizations));
    } catch (err) {
      next(err);
    }
  };

  static updateorganization = async (req, res, next) => {
    try {
      const organization = await OrganizationService.updateorganization(
        req.params.id,
        req.body
      );
      res.json(response(organization, "Organization updated successfully"));
    } catch (err) {
      next(err);
    }
  };
};
