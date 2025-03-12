const { StatusCodes } = require("http-status-codes");

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  let message = err.message || "Something went wrong";

  res.status(statusCode).json({ success: false, message });
};

module.exports = errorHandler;
