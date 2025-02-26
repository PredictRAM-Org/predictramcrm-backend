const { UserService, PredictRamService } = require("../services");
const response = require("../utils/formatResponse");

module.exports = class PredictRamController {
  static async getRiskScore(req, res, next) {
    try {
      const { client } = req.params;
      const { email, phone } = await UserService.getOneUser({ _id: client });
      const predictRamUser = await PredictRamService.getOneInvestorUser({
        $or: [{ email }, { mobileNumber: phone }],
      });
      const riskProfile = await PredictRamService.getRiskScore({
        userId: predictRamUser?._id,
      });

      res.send(response(riskProfile, "Risk Score"));
    } catch (err) {
      next(err);
    }
  }
};
