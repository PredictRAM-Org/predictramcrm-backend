const Mongoose = require("mongoose");
const envConfig = require("../utils/envConfig");
const riskscoreSchema = require("../models/schema/riskScore.schema");
const investorSchema = require("../models/schema/investor.schema");

const conn = Mongoose.createConnection(envConfig.predictRam.DB);
const investorModel = conn.model("investors", investorSchema);
const riskScoreModel = conn.model("Riskscore", riskscoreSchema);

module.exports = class PredictRamService {
  static async getOneInvestorUser(filter) {
    const user = await investorModel.findOne({ ...filter });

    return user;
  }
  static async updateOneInvestorUser(filter, updateData) {
    const user = await investorModel.findOneAndUpdate(
      { ...filter },
      updateData,
      { new: true }
    );
    return user;
  }
  static async getRiskScore(filter) {
    const riskScore = await riskScoreModel.findOne({ ...filter });
    return riskScore;
  }
};
