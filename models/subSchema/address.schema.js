const mongoose = require("mongoose");

const addressSchema = mongoose.Schema(
  {
    country: {
      type: String,
      required: [true, "Country is required for address"],
    },
    area: {
      type: String,
      required: false,
    },
    landmark: {
      type: String,
      default: "",
    },
    houseNumber: {
      type: String,
      required: false,
    },
    pin: {
      type: Number,
      required: [true, "PIN is required for address"],
      regex: [/^\d{6}$/, "Please enter a valid 6-digit PIN"],
    },
    city: {
      type: String,
      required: [true, "City is required for address"],
    },
    state: {
      type: String,
      required: [true, "Address is required for address"],
    },
  },
  { _id: false }
);

module.exports = addressSchema;
