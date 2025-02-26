const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const envConfig = require("../utils/envConfig");
// const Mongoose = require("mongoose");
// const accessTokenSchema = require("../models/schema/fyersAccessToke.schema");
const FyersAPI = require("fyers-api-v3").fyersModel;
const redisClient = require("../utils/redisCache");

const fyers = new FyersAPI();

fyers.setAppId(envConfig.fyers.appId);

// const conn = Mongoose.createConnection(envConfig.predictRam.DB);
// const fyersModel = conn.model("accessToken", accessTokenSchema);

module.exports = class fyersService {
  static async getHistory(payload) {
    try {
      // const { access_token } = await fyersModel.findOne({
      //   key: "fyersToken",
      // });
      // fyers.setAccessToken(access_token);

      let token = await redisClient.get("fyersToken");
      token = token && JSON.parse(token);

      fyers.setAccessToken(token?.access_token);

      const data = await fyers.getHistory(payload);

      if (data?.code === 200) {
        return data;
      } else {
        throw new Error(data?.message);
      }
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }

  static async getQuotes(stocks) {
    try {
      // const { access_token } = await fyersModel.findOne({
      //   key: "fyersToken",
      // });
      // fyers.setAccessToken(access_token);

      let token = await redisClient.get("fyersToken");
      token = token && JSON.parse(token);

      fyers.setAccessToken(token?.access_token);

      const data = await fyers.getQuotes([stocks]);

      if (data?.code === 200) {
        return data;
      } else {
        throw new Error(data?.message);
      }
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }
};
