const WSResponse = (id, message = "", data = {}) => ({
  id,
  message,
  data,
});

module.exports = WSResponse;
