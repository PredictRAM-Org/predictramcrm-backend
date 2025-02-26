const nodemailer = require("nodemailer");
const axios = require("axios");
const envConfig = require("../utils/envConfig");

module.exports = class EmailService {
  constructor() {
    const config = {
      service: "gmail",
      auth: {
        user: envConfig.email.user,
        pass: envConfig.email.pass,
      },
    };
    this.transporter = nodemailer.createTransport(config);
  }

  static async sendCustomisedEmail(receiverMail, subject, message) {
    try {
      const sendingMail = await axios.get(`${envConfig.email.mail_function}`, {
        params: { destinationMail: receiverMail, subject, body: message },
      });
      if (sendingMail) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      throw err;
    }
  }
};
