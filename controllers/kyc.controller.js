const crypto = require("crypto");
const { User } = require("../models");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");
const envConfig = require("../utils/envConfig");
const response = require("../utils/formatResponse");
const { PredictRamService } = require("../services");

module.exports = class CallController {
  static async handelKYCResponse(req, res, next) {
    try {
      const headers = req.headers;
      const body = req.body;
      console.log(headers?.webhook_security_key);
      console.log(headers, body);
      res.json(response(body, "KYC response body"));
    } catch (err) {
      next(err);
    }
  }

  static async sendESignRequest(req, res, next) {
    try {
      const { firstName, lastName, email, kyc } = req.user;
      if (kyc?.esign) {
        throw new ApiError(httpStatus.BAD_REQUEST, "KYC already done");
      }
      const esignData = {
        signers: [
          {
            identifier: email,
            name: firstName + " " + lastName,
            sign_type: "aadhaar",
            reason: "Aggrement eSign",
          },
        ],
        file_name: email + "_" + new Date().getDate(),
        display_on_page: "custom",
        sign_coordinates: {
          [email]: {
            1: [
              {
                llx: 315,
                lly: 20,
                urx: 455,
                ury: 60,
              },
            ],
          },
        },
        notify_signers: false,
        signature_type: "aadhaar",
        include_authentication_url: true,
        send_sign_link: false,
        generate_access_token: true,
        file_data: envConfig.kyc.pdf,
      };

      const api_res = await axios.post(
        envConfig.kyc.base_url + "/v2/client/document/uploadpdf",
        esignData,
        {
          headers: {
            Authorization: `Basic ${envConfig.kyc.apiToken}`,
          },
        }
      );

      res.json(response(api_res.data, "KYC request sent"));
    } catch (err) {
      next(err);
    }
  }

  static async getESignDoc(req, res, next) {
    try {
      const { document_id } = req.query;
      const api_res = await axios.get(
        envConfig.kyc.base_url +
          `/v2/client/document/download?document_id=${document_id}`,
        {
          headers: {
            Authorization: `Basic ${envConfig.kyc.apiToken}`,
          },
          responseType: "arraybuffer",
        }
      );
      const data = Buffer.from(api_res.data, "binary").toString("base64");
      res.send(data);
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  static async sendEKYCRequest(req, res, next) {
    try {
      const { firstName, lastName, email, kyc } = req.user;
      if (kyc?.ekyc) {
        throw new ApiError(httpStatus.BAD_REQUEST, "e-Sign already done");
      }
      const ekycData = {
        customer_identifier: email,
        customer_name: firstName + " " + lastName,
        template_name: "DIGILOCKER_AADHAAR_PAN",
        notify_customer: false,
        generate_access_token: true,
      };

      const api_res = await axios.post(
        envConfig.kyc.base_url + "/client/kyc/v2/request/with_template",
        ekycData,
        {
          headers: {
            Authorization: `Basic ${envConfig.kyc.apiToken}`,
          },
        }
      );

      res.json(response(api_res.data, "KYC request sent"));
    } catch (err) {
      next(err);
    }
  }

  static async getEKYCDocReport(req, res, next) {
    try {
      const { document_id } = req.query;
      const api_res = await axios.post(
        envConfig.kyc.base_url + `/client/kyc/v3/${document_id}/kyc_report`,
        {},
        {
          headers: {
            Authorization: `Basic ${envConfig.kyc.apiToken}`,
          },
          responseType: "arraybuffer",
        }
      );
      const data = Buffer.from(api_res.data, "binary").toString("base64");
      res.send(data);
    } catch (err) {
      next(err);
    }
  }

  static async kycWebhook(req, res, next) {
    try {
      // 1. Check static Authorization key
      const authHeader = req.headers["authorization"];
      const STATIC_KEY = envConfig.kyc.webhook_secret;

      if (!authHeader || authHeader !== `Basic ${STATIC_KEY}`) {
        return res.status(401).json({
          status: "error",
          message: "Unauthorized access",
        });
      }

      // 2. Extract phone number from payload
      const { phone_no, ...kycDetails } = req.body;
      if (!phone_no) {
        return res.status(400).json({
          status: "error",
          message: "Missing phone number",
        });
      }

      // 3. Find user by phone number
      const crmUser = await User.findOne({ phone: `+91${phone_no}` });
      const investorUser = await PredictRamService.getOneInvestorUser({
        mobileNumber: `+91${phone_no}`,
      });

      if (!crmUser && !investorUser) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // 4. Save KYC data
      if (crmUser) {
        crmUser.kycDetails = kycDetails;
        crmUser.kycCompleted = true;
        await crmUser.save();
      }

      if (investorUser) {
        await PredictRamService.updateOneInvestorUser(
          { mobileNumber: `+91${phone_no}` },
          { kycDetails, kycCompleted: true }
        );
      }

      return res.json({
        status: "success",
        message: "KYC data updated successfully",
      });
    } catch (err) {
      next(err);
    }
  }

  // static async kycAuth(req, res, next) {
  //   try {
  //     const { phone_no } = req.body;

  //     const user = await User.findOne({
  //       phone: `+91${phone_no}`,
  //     });

  //     if (!user) {
  //       return res
  //         .status(404)
  //         .json({ status: "error", message: "User not found" });
  //     }

  //     const token = jwt.sign(
  //       { userId: user._id },
  //       envConfig.kyc.webhook_secret,
  //       {
  //         expiresIn: "30m",
  //       }
  //     );

  //     res.json({
  //       status: "success",
  //       message: "Authorization token generated",
  //       token,
  //     });
  //   } catch (err) {
  //     next(err);
  //   }
  // }

  // static async kycWebhook(req, res, next) {
  //   try {
  //     const authHeader = req.headers["authorization"];
  //     const token = authHeader?.split(" ")[1];

  //     if (!token) {
  //       return res
  //         .status(401)
  //         .json({ status: "error", message: "Missing token" });
  //     }

  //     const decoded = jwt.verify(token, envConfig.kyc.webhook_secret);
  //     const userId = decoded.userId;

  //     const user = await User.findById(userId);

  //     if (!user) {
  //       return res
  //         .status(404)
  //         .json({ status: "error", message: "User not found" });
  //     }

  //     const body = req.body;
  //     const { phone_no, e_mail, ...kycDetails } = body;

  //     user.kycDetails = kycDetails;
  //     user.kycCompleted = true;
  //     await user.save();

  //     res.json({
  //       status: "success",
  //       message: "KYC data updated successfully",
  //       data: { userId: user.id },
  //     });
  //   } catch (err) {
  //     if (err.name === "TokenExpiredError") {
  //       return res
  //         .status(401)
  //         .json({ status: "error", message: "Token expired" });
  //     }
  //     next(err);
  //   }
  // }
};
