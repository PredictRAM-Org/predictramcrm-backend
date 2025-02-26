const mongoose = require("mongoose");
const {
  stockCallTypes,
  marketCallTypes,
  stockChangeTypes,
} = require("../../enums");

const stockInfo = {
  quantity: { type: Number, defualt: 0 },
  type: {
    type: String,
    enum: stockCallTypes,
  },
  durationType: {
    type: String,
    enum: marketCallTypes,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  stopLossPrice: { type: String, defualt: 0 },
  buyPrice: { type: String, defualt: 0 },
  targetPrice: { type: String },
};

const stockChangeSchema = mongoose.Schema({
  _id: false,
  symbol: { type: String, required: [true, "Stock Symbol is required"] },
  currentStockInfo: stockInfo,
  previousStockInfo: stockInfo,
  date: { type: Date, required: [true, "Stock Change Time is required"] },
  state: {
    type: String,
    enum: stockChangeTypes,
    required: [true, "Stock Change state is required"],
  },
});

module.exports = stockChangeSchema;
