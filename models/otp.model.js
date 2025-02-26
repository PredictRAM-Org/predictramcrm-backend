const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const otpSchema = mongoose.Schema(
  {
    otp: {
      type: Number,
      required: true,
    },
    expires: {
      type: Date,
      required: true,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    user: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
  },

  { timestamps: true }
);

const OTP = mongoose.models.OTP || mongoose.model("OTP", otpSchema);

module.exports = OTP;
