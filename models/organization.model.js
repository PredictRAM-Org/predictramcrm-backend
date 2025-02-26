const { Schema, Types, models, model } = require("mongoose");

const { addressSchema } = require("./subSchema");
const mongooseErrorPlugin = require("./plugin/mongoErrorPlugin");

const organizationSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
      min: [3, "Organization name must be at least 3 characters long"],
      max: [50, "Organization name cannot exceed 50 characters"],
    },
    logo: {
      type: String,
    },
    contact: {
      type: String,
      required: [true, "Organization Contact is required"],
      validate: [/\+91[0-9]{10}/, "Enter a valid phone number"],
      unique: [true, "Organization Contact already exists"],
    },
    email: {
      type: String,
      lowercase: true,
      required: [true, "Organization Email is required"],
      unique: [true, "Organization Email already exists"],
      trim: true,
      regex: [
        /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/,
        "Enter a valid Organization Email",
      ],
      // index: true,
    },
    address: {
      type: addressSchema,
      _id: false,
    },
    // gst: {
    //   type: String,
    //   trim: true,
    //   unique: [true, "GST number already exists"],
    //   regex: [
    //     /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}[A-Z]{1}[0-9A-Z]{1}$/,
    //     "Enter a valid gst number",
    //   ],
    // },
    attributes: Object,
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

organizationSchema.plugin(mongooseErrorPlugin);

organizationSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.createdAt;
    delete returnedObject.updatedAt;
    delete returnedObject.deleted;
  },
});
let organization =
  models.organization || model("organization", organizationSchema);

module.exports = organization;
