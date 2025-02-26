const joi = require("joi");
const { objectId, phoneNumber, email } = require("./custom.validation");
const { createUser } = require("./user.validation");

const addressSchema = {
  area: joi.string(),
  landmark: joi.string(),
  country: joi.string().required(),
  houseNumber: joi.string(),
  pin: joi.number().required(),
  city: joi.string().required(),
  state: joi.string().required(),
};

const createorganization = {
  name: joi.string().min(3).max(50).required(),
  logo: joi.string(),
  contact: joi.custom(phoneNumber).required(),
  email: joi.custom(email).required(),
  address: addressSchema,
};

const createOrganizationWithPrimaryUser = {
  body: joi.object({
    organization: joi.object(createorganization).required(),
    user: joi.object(createUser).required(),
  }),
};

const getOrganization = {
  query: joi.object({
    _id: joi.custom(objectId),
    name: joi.string(),
    contact: joi.string(),
    email: joi.string(),
  }),
};

const updateorganization = {
  params: joi.object({
    id: joi.custom(objectId).required(),
  }),
  body: joi.object({
    name: joi.string(),
    logo: joi.string(),
    contact: joi.custom(phoneNumber),
    email: joi.custom(email),
    address: addressSchema,
  }),
};

module.exports = {
  createOrganizationWithPrimaryUser,
  getOrganization,
  updateorganization,
};
