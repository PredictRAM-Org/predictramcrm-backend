const { Schema, model, models } = require("mongoose");
const mongooseErrorPlugin = require("./plugin/mongoErrorPlugin");
const { marketCallTypes, stockCallTypes } = require("../enums");
const { ObjectId } = Schema.Types;

const stockSchema = new Schema(
  {
    image: { type: String, required: false },
    marketCall: {
      type: ObjectId,
      ref: "marketCall",
      required: true,
    },
    symbol: { type: String, required: [true, "Stock Symbol is required"] },
    quantity: { type: Number },
    percentage: { type: Number },
    type: {
      type: String,
      enum: stockCallTypes,
      required: [true, "Choose a market call type"],
    },
    durationType: {
      type: String,
      enum: marketCallTypes,
      required: [true, "Call Type is required"],
    },
    stopLossPrice: { type: String, required: false },
    buyPrice: { type: String, required: false },
    targetPrice: { type: String, required: false },
    organization: {
      type: ObjectId,
      ref: "organization",
      required: [true, "organization is required"],
    },
  },
  { timestamps: true }
);

stockSchema.plugin(mongooseErrorPlugin);

stockSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.updatedAt;
    delete returnedObject.deleted;
  },
});

module.exports = models.stock || model("stock", stockSchema);
