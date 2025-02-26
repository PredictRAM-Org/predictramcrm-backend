const { Schema, model, models } = require("mongoose");
const mongooseErrorPlugin = require("./plugin/mongoErrorPlugin");
const { marketCallTypes, stockCallTypes } = require("../enums");
const { ObjectId } = Schema.Types;

const marketcallPortfolioSchema = new Schema(
  {
    marketCall: {
      type: ObjectId,
      ref: "marketCall",
      required: true,
    },
    createdBy: {
      type: ObjectId,
      ref: "User",
      required: [true, "market call portfolio creator is needed"],
    },
    stockList: [
      {
        symbol: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ['BUY', 'SELL'],
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

marketcallPortfolioSchema.plugin(mongooseErrorPlugin);

marketcallPortfolioSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.updatedAt;
    delete returnedObject.deleted;
  },
});

module.exports = models.stock || model("marketcallPortfolio", marketcallPortfolioSchema);
