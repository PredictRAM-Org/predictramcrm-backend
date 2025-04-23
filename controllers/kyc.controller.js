const axios = require("axios");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");
const envConfig = require("../utils/envConfig");
const response = require("../utils/formatResponse");
const { UserService } = require("../services");

module.exports = class CallController {
  static async sendESignRequest(req, res, next) {
    try {
      const { kyc, id, firstName, lastName, email } = req.user;
      if (kyc?.esign) {
        throw new ApiError(httpStatus.BAD_REQUEST, "E-sign already done");
      }
      const esignData = {
        document: {
          name: "Agreement Esigning",
          data: envConfig.kyc.pdf,
          info: "Agreement Esigning",
        },
        signers: [
          {
            signer_name: `${firstName} ${lastName}`,
            signer_email: email,
            signer_city: "Delhi",
            signer_purpose: "Agreement Esigning",
            sign_coordinates: [
              {
                page_num: 0,
                x_coord: 400,
                y_coord: 550,
              },
            ],
          },
        ],
        txn_expiry_min: "10080",
        white_label: "Y",
        redirect_url: envConfig.kyc.redirect_url,
        response_url: envConfig.kyc.response_url,
        esign_type: "AADHAAR",
        email_template: {
          org_name: "Predictram",
        },
      };
      console.log(esignData);

      const api_res = await axios.post(
        envConfig.kyc.base_url + "/contract/esign/v5/init",
        esignData,
        {
          headers: {
            "api-key": envConfig.kyc.apiKey,
            "app-id": envConfig.kyc.appID,
          },
        }
      );

      if (api_res?.data?.success) {
        await UserService.updateUser(
          id,
          {
            "kyc.webhook_security_key": api_res?.data?.webhook_security_key,
          },
          {}
        );
      } else {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "E-sign request failed, please try again"
        );
      }

      res.json(response(api_res.data, "E-sign request sent"));
    } catch (err) {
      next(err);
    }
  }
  static async handelESignResponse(req, res, next) {
    try {
      const headers = req.headers;
      const body = req.body;
      console.log(headers?.["webhook-security-key"]);
      console.log(headers, body);
      if (body.success) {
        const { id } = await UserService.getOneUser({
          "kyc.webhook_security_key": headers?.["webhook-security-key"],
        });
        await UserService.updateUser(
          id,
          { "kyc.esign": true, "kyc.esignInfo": body.result },
          {}
        );
      } else {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "E-sign failed, please try again"
        );
      }
      res.json(response(body, "Esign done"));
    } catch (err) {
      next(err);
    }
  }

  static async sendEKYCRequest(req, res, next) {
    try {
      const { aadhaar_number } = req.body;
      const { firstName, lastName, kyc } = req.user;
      if (kyc?.ekyc) {
        throw new ApiError(httpStatus.BAD_REQUEST, "KYC already done");
      }
      const ekycData = {
        mode: "sync",
        data: {
          customer_aadhaar_number: aadhaar_number,
          name_to_match: firstName + " " + lastName,
          consent: "Y",
          consent_text:
            "I hear by declare my consent agreement for fetching my information via Predictram",
        },
        task_id: "08b01aa8-9487-4e6d-a0f0-c796839d6b77",
      };

      const api_res = await axios.post(
        envConfig.kyc.base_url + "/in/identity/okyc/otp/request",
        ekycData,
        {
          headers: {
            "api-key": envConfig.kyc.apiKey,
            "app-id": envConfig.kyc.appID,
            "Content-Type": "application/json",
          },
        }
      );

      res.json(response(api_res.data, "KYC request sent"));
    } catch (err) {
      next(err);
    }
  }

  static async verifyEKYCRequest(req, res, next) {
    try {
      const { request_id, otp } = req.body;
      const { kyc, id } = req.user;
      if (kyc?.ekyc) {
        throw new ApiError(httpStatus.BAD_REQUEST, "KYC already done");
      }
      const ekycData = {
        mode: "sync",
        data: {
          request_id: request_id,
          otp: otp,
          consent: "Y",
          consent_text:
            "I hear by declare my consent agreement for fetching my information via Predictram",
        },
        task_id: "08b01aa8-9487-4e6d-a0f0-c796839d6b77",
      };

      const api_res = await axios.post(
        envConfig.kyc.base_url + "/in/identity/okyc/otp/verify",
        ekycData,
        {
          headers: {
            "api-key": envConfig.kyc.apiKey,
            "app-id": envConfig.kyc.appID,
            "Content-Type": "application/json",
          },
        }
      );

      if (api_res?.data?.success) {
        await UserService.updateUser(
          id,
          { "kyc.ekyc": true, "kyc.ekycInfo": api_res?.data?.result },
          {}
        );
      } else {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "KYC verification failed, please try again"
        );
      }

      res.json(response(api_res.data, "KYC verification done"));
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
};

// static async getESignDoc(req, res, next) {
//   try {
//     const { document_id } = req.query;
//     const api_res = await axios.get(
//       envConfig.kyc.base_url +
//         `/v2/client/document/download?document_id=${document_id}`,
//       {
//         headers: {
//           Authorization: `Basic ${envConfig.kyc.apiToken}`,
//         },
//         responseType: "arraybuffer",
//       }
//     );
//     const data = Buffer.from(api_res.data, "binary").toString("base64");
//     res.send(data);
//   } catch (err) {
//     console.log(err);
//     next(err);
//   }
// }
// static async getEKYCDocReport(req, res, next) {
//     try {
//       const { document_id } = req.query;
//       const api_res = await axios.post(
//         envConfig.kyc.base_url + `/client/kyc/v3/${document_id}/kyc_report`,
//         {},
//         {
//           headers: {
//             Authorization: `Basic ${envConfig.kyc.apiToken}`,
//           },
//           responseType: "arraybuffer",
//         }
//       );
//       const data = Buffer.from(api_res.data, "binary").toString("base64");
//       res.send(data);
//     } catch (err) {
//       next(err);
//     }
//   }
