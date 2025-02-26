const httpStatus = require("http-status");
const ApiError = require("../../utils/ApiError");

function convertToWords(inputString) {
  return inputString.replace(
    /([a-z])?([A-Z])/g,
    (match, previousChar, uppercaseChar) => {
      return previousChar ? previousChar + " " + uppercaseChar : uppercaseChar;
    }
  );
}

const mongooseErrorPlugin = function (schema) {
  //  'post' middleware for error handling
  schema.post(
    [
      "save",
      "create",
      "insertMany",
      "updateMany",
      "findByIdAndUpdate",
      "findOneAndUpdate",
    ],
    (error, doc, next) => {
      const errorStrings = [];

      if (!error) next();

      if (error.name === "ValidationError") {
        errorStrings.push(
          ...Object.values(error.errors).map((error) => error.message)
        );
      }

      if (
        (error.name === "MongoError" || error.name === "MongoServerError") &&
        error.code === 11000
      ) {
        const duplicateKey = error.message.match(/dup key: { (\w+): .* }/);

        const [_, keyName, value] = duplicateKey;

        if (duplicateKey.length) {
          // console.log(JSON.stringify(error), duplicateKey, duplicateKey.length);
          errorStrings.push(
            `${convertToWords(
              keyName.charAt(0).toUpperCase() + keyName.slice(1)
            )} already exists`
          );
        }
      }

      const newError = new ApiError(
        400,
        errorStrings.length
          ? errorStrings[0].toString() || errorStrings[1].toString()
          : "Something went wrong. Please try again later"
      );

      throw newError;
    }
  );

  schema.post(["find", "findOne"], (error, doc, next) => {
    let newError;

    if (error.name === "ValidationError" && error.codeName === "BadValue") {
      newError = new Error("Invalid requests");
      newError.code = httpStatus.BAD_REQUEST;
    }

    if (!newError) {
      newError = new Error("Something went wrong!");
      newError.code = httpStatus.NOT_FOUND;
    }

    throw newError;
  });
};

module.exports = mongooseErrorPlugin;
