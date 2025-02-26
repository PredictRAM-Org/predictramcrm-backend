const joi = require("joi");
const { objectId, email } = require("./custom.validation");
const { roleTypes, clientTypes } = require("../enums");
const { password, phoneNumber } = require("./custom.validation");

const addressSchema = {
  area: joi.string(),
  landmark: joi.string(),
  country: joi.string().required(),
  houseNumber: joi.string(),
  pin: joi.number().required(),
  city: joi.string().required(),
  state: joi.string().required(),
};

const companyDetailsSchema = {
  companyName: joi.string().required(),
  sebiRegistration: joi.string().required(),
  address: joi.string().required(),
};

const createUser = {
  firstName: joi.string().required(),
  lastName: joi.string().required(),
  avatar: joi.string(),
  organization: joi.string(),
  phone: joi.custom(phoneNumber).required(),
  email: joi.custom(email).required(),
  password: joi.custom(password).required(),
  address: joi.object(addressSchema),
  companyDetails: joi.object(companyDetailsSchema),
  client_type: joi.string().valid(...clientTypes),
  role: joi
    .string()
    .valid(...roleTypes.slice(1))
    .required(),
};

const getUser = {
  query: joi.object({
    _id: joi.custom(objectId),
    firstName: joi.string(),
    lastName: joi.string(),
    phone: joi.string(),
    email: joi.string(),
    role: joi.string().valid(...roleTypes.slice(1)),
    organization: joi.custom(objectId),
    limit: joi.string(),
    page: joi.string(),
    client_type: joi.string().valid(...clientTypes),
    managedBy: joi.string(),
    isManagedBy: joi.boolean(),
    kyc: joi.object(),
  }),
};

const updateUser = {
  params: joi.object({
    id: joi.string().custom(objectId).required(),
  }),
  body: joi.object({
    firstName: joi.string(),
    lastName: joi.string(),
    avatar: joi.string(),
    username: joi.string(),
    image: joi.string(),
    description: joi.string(),
    ekyc: joi.boolean(),
    esign: joi.boolean(),
    esignDocid: joi.string(),
    ekycDocid: joi.string(),
  }),
};

const linkUnlink = {
  params: joi.object({
    type: joi
      .string()
      .valid(...["LINK", "UNLINK"])
      .required(),
  }),
  body: joi.object({
    clients: joi.array().items(joi.custom(objectId)).required(),
    employee: joi.custom(objectId),
  }),
};

const deleteUser = {
  params: joi.object({
    id: joi.string().custom(objectId).required(),
  }),
};

module.exports = { createUser, getUser, updateUser, linkUnlink, deleteUser };
