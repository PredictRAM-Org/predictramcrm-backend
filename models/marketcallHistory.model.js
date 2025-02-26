const { Schema, model, models } = require("mongoose");
const mongooseErrorPlugin = require("./plugin/mongoErrorPlugin");
const { stockChange } = require("./subSchema");
const { ObjectId } = Schema.Types;

const marketCallHistorySchema = new Schema(
  {
    marketCall: {
      type: ObjectId,
      ref: "marketCall",
    },
    date: {
      type: Date,
      required: [true, "market call history creation time required"],
    },
    stockChanges: {
      type: [stockChange],
    },
    currentPortfolio: {
      type: [Object],
    },
    organization: {
      type: ObjectId,
      ref: "organization",
      required: [true, "organization is required"],
    },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

marketCallHistorySchema.plugin(mongooseErrorPlugin);

marketCallHistorySchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.updatedAt;
    delete returnedObject.deleted;
  },
});

module.exports =
  models.marketCallHistory ||
  model("marketCallHistory", marketCallHistorySchema);
