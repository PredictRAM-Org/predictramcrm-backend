const response = (data, message = "") => ({
  success: true,
  message,
  data,
});

module.exports = response;
