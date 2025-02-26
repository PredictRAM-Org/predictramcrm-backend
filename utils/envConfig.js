require("dotenv").config();
const dotenv = require("dotenv").config({
  path: `.env.${process.env.SETUP || "dev"}`,
});

console.log(
  `Starting in ${process.env.SETUP} setup & ${process.env.NODE_ENV} environment...`
);

module.exports = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 8080,
  mongoose: {
    url: process.env.MONGODB_URL,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  secret: process.env.SECRET,
  email: {
    mail_function: process.env.MAIL_FUNCTION,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  fyers: {
    appId: process.env.FYERS_APP_ID,
  },
  predictRam: {
    DB: process.env.PREDICTRAM_DB,
  },
  otp: {
    accessExpirationMinutes: 5,
  },
  queue: {
    connection_uri: process.env.AZURE_BUS_SERVICE_CONNECTION_URI,
    email: {
      name: process.env.AZURE_BUS_SERVICE_EMAIL_QUEUE,
    },
  },
  twilio: {
    sid: process.env.TWILIO_ACCOUNT_SID,
    secret: process.env.TWILIO_AUTH_TOKEN,
  },
  kyc: {
    apiToken: process.env.DIGIO_AUTH_TOKEN,
    pdf: process.env.KYC_PDF,
    base_url: process.env.DIGIO_BASE_URL,
  },
};
