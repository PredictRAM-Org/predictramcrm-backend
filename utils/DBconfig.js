const mongoose = require("mongoose");
const envConfig = require("./envConfig");

const DBConnect = async () => {
  const connection = await mongoose.connect(envConfig.mongoose.url);

  return connection;
};

const transactionOptions = {
  readPreference: "primary",
  readConcern: { level: "local" },
  writeConcern: { w: "majority" },
};

module.exports = { DBConnect, transactionOptions };
