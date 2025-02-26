const { Schema, model, models } = require("mongoose");
const mongooseErrorPlugin = require("./plugin/mongoErrorPlugin");
const { stockDataSchema } = require("./subSchema");
const {
  clientResponses,
  responseStatus,
  RESPONSE_STATUS,
} = require("../enums");
const { ObjectId } = Schema.Types;

const responseSchema = new Schema(
  {
    marketCallId: {
      type: ObjectId,
      ref: "marketCall",
      required: [true, "Market call id is required"],
    },
    portfolio: {
      type: [Object],
    },
    submittedBy: {
      type: ObjectId,
      ref: "User",
      required: [true, "Submitted by is required"],
    },
    response: {
      type: String,
      enum: clientResponses,
      required: [true, "Choose a response"],
    },
    status: {
      type: String,
      enum: responseStatus,
      default: RESPONSE_STATUS.INITIATED,
    },
    comment: {
      type: String,
    },
    organization: {
      type: ObjectId,
      ref: "organization",
      required: [true, "User's organization is required"],
    },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// responseSchema.index({ marketCallId: 1, submittedBy: 1 }, { unique: true });

responseSchema.plugin(mongooseErrorPlugin);

responseSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    // delete returnedObject.createdAt;
    delete returnedObject.updatedAt;
    delete returnedObject.deleted;
  },
});

module.exports = models.response || model("response", responseSchema);
