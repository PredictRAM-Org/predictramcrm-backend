const { Schema, Types, models, model } = require("mongoose");
const { ObjectId } = Types;
const { roleTypes, ROLES, clientTypes, CLIENT_TYPE } = require("../enums");
const mongoErrorPlugin = require("./plugin/mongoErrorPlugin");
const addressSchema = require("./subSchema/address.schema");
const companyDetailsSchema = require("./subSchema/companyDetails");
const kycSchema = require("./subSchema/kyc.schema");

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
    },
    avatar: {
      type: String,
    },
    phone: {
      type: String,
      required: [true, "Users's Phone number is required"],
      validate: [/\+91[0-9]{10}/, "Enter a valid phone number"],
      unique: [true, "User's Phone number already exists"],
    },
    email: {
      type: String,
      required: [true, "Users's Email is required"],
      regex: [
        /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/,
        "Enter a valid email",
      ],
      unique: [true, "User's Email already exists"],
    },
    password: {
      type: String,
      required: [true, "User's Password is required"],
    },
    isEnabled: {
      type: Boolean,
      required: true,
      default: true,
    },
    isPhoneVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    managedBy: {
      type: ObjectId,
      ref: "User",
    },
    client_type: {
      type: String,
      enum: clientTypes,
      required: () => {
        return this.role === ROLES.CLIENT;
      },
      default: CLIENT_TYPE.DISCRETIONARY,
    },
    organization: {
      type: ObjectId,
      ref: "organization",
      required: [true, "User's organization is required"],
    },
    username: {
      type: String,
      unique: [true, "Username already exists"],
    },
    description: {
      type: String,
    },
    image: {
      type: String,
    },
    deleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    companyDetails: {
      type: companyDetailsSchema,
    },
    address: {
      type: addressSchema,
    },
    kycCompleted: {
      type: Boolean,
      default: false,
    },
    kycDetails: {
      type: Object,
    },
    role: {
      type: String,
      enum: roleTypes,
      required: [true, "User's Role is required"],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.plugin(mongoErrorPlugin);

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.createdAt;
    delete returnedObject.updatedAt;
    delete returnedObject.deleted;
    delete returnedObject.password;
  },
});

const User = models.User || model("User", userSchema);

module.exports = User;
