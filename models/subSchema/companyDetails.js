const mongoose = require("mongoose");

const companyDetailsSchema = mongoose.Schema(
  {
    companyName: { type: String },
    sebiRegistration: { type: String },
    address: { type: String },
  },
  { _id: false }
);

module.exports = companyDetailsSchema;
