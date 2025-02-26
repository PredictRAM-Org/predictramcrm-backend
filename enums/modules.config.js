const { path } = require("../models/schema/riskScore.schema");

const MODULES = {
  AUTH: {
    name: "AUTH",
    routes: require("../routes/v1/auth.route"),
    path: "/auth",
  },
  USERS: {
    name: "USERS",
    routes: require("../routes/v1/user.route"),
    path: "/users",
  },
  PROFILE: {
    name: "PROFILE",
    routes: require("../routes/v1/profile.route"),
    path: "/profile",
  },
  ORGANIZATION: {
    name: "ORGANIZATION",
    routes: require("../routes/v1/organization.route"),
    path: "/organization",
  },
  MARKETCALL: {
    name: "MARKETCALL",
    routes: require("../routes/v1/marketcall.router"),
    path: "/marketcall",
  },
  PROFILEMARKETCALL: {
    name: "PROFILEMARKETCALL",
    routes: require("../routes/v1/profileMarketcall.router"),
    path: "/marketcall-profile",
  },
  MARKETCALLPORTFOLIO: {
    name: "MARKETCALLPORTFOLIO",
    routes: require("../routes/v1/marketcallPortfolio.router"),
    path: "/marketcall-portfolio",
  },
  RESPONSE: {
    name: "RESPONSE",
    routes: require("../routes/v1/response.route"),
    path: "/response",
  },
  MARKETDATA: {
    name: "MARKETDATA",
    routes: require("../routes/v1/marketdata.router"),
    path: "/marketdata",
  },
  TASK: {
    name: "TASK",
    routes: require("../routes/v1/task.route"),
    path: "/task",
  },
  CALL: {
    name: "CALL",
    routes: require("../routes/v1/call.route"),
    path: "/call",
  },
  PREDICTRAM: {
    name: "PREDICTRAM",
    routes: require("../routes/v1/predictram.route"),
    path: "/predictram",
  },
  STOCK: {
    name: "STOCK",
    routes: require("../routes/v1/stock.route"),
    path: "/stock",
  },
  MARKETCALL_HISTORY: {
    name: "MARKETCALL_HISTORY",
    routes: require("../routes/v1/marketcallHistory.route"),
    path: "/marketcall-history",
  },
  NOTIFICATION: {
    name: "NOTIFICATION",
    routes: require("../routes/v1/notification.router"),
    path: "/notifications",
  },
  KYC: {
    name: "KYC",
    routes: require("../routes/v1/kyc.route"),
    path: "/kyc",
  },
};

module.exports = MODULES;
