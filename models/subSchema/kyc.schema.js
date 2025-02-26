const mongoose = require("mongoose");

const kycSchema = mongoose.Schema(
  {
    esign: { type: Boolean, default: false },
    ekyc: { type: Boolean, default: false },
  },
  { _id: false }
);

module.exports = kycSchema;
