const {
  APICustomError,
  BadRequestError,
  InternalServerError,
  DBError,
  UnauthorizeError,
} = require("./app-errors");

const ErrorResponse = (error, res) => {
  if (
    error instanceof DBError ||
    error instanceof APICustomError ||
    error instanceof UnauthorizeError ||
    error instanceof BadRequestError ||
    error instanceof InternalServerError
  ) {
    return res.status(error.statusCode).send(error);
  } else {
    res
      .status(500)
      .send(
        new InternalServerError("Internal User Server Error", error.message)
      );
  }
};

module.exports = { ErrorResponse };
