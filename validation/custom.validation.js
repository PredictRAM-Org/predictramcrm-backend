const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message("{{#label}} must be a valid mongo id");
  }
  return value;
};

const password = (value, helpers) => {
  if (value.length < 8) {
    return helpers.message("{{#label}} must be at least 8 characters");
  }
  if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
    return helpers.message(
      "{{#label}} must contain at least 1 letter and 1 number"
    );
  }
  return value;
};

const phoneNumber = (value, helpers) => {
  const phoneRegex = /^(\+91)\d{10}$/;
  if (!value.match(phoneRegex)) {
    return helpers.message(
      "{{#label}} number must be of 10 digits with country code +91"
    );
  }
  return value;
};

const email = (value, helpers) => {
  const emailRegex = /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/;
  if (!value.match(emailRegex)) {
    return helpers.message("{{#label}} is not valid");
  }
  return value;
};

const pin = (value, helpers) => {
  const pinRegex = /^[1-9][0-9]{5}$/;
  if (!value.match(pinRegex)) {
    return helpers.message("{{#label}} is not valid pin");
  }

  return parseInt(value);
};

module.exports = {
  objectId,
  password,
  phoneNumber,
  pin,
  email,
};
