const { Schema, model, models } = require("mongoose");
const mongooseErrorPlugin = require("./plugin/mongoErrorPlugin");
const { ObjectId } = Schema.Types;
const {
  allocations
} = require("../enums");

const marketCallSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true
    },
    allocation: {
      type: String,
      enum: allocations, 
      required: true
    },
    createdBy: {
      type: ObjectId,
      ref: "User",
      required: [true, "market call creator is needed"],
    },
    clients: {
      type: [{ type: ObjectId, ref: "User" }],
    },
    notifiedClients: {
      type: [{ type: ObjectId, ref: "User" }],
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

marketCallSchema.plugin(mongooseErrorPlugin);

marketCallSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.updatedAt;
    delete returnedObject.deleted;
  },
});

module.exports = models.marketCall || model("marketCall", marketCallSchema);
