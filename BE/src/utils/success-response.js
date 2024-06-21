const { STATUS_CODES } = require("./app-errors");

class SuccessResponse {
  constructor(data, message, paging) {
    this.statusCode = STATUS_CODES.OK;
    this.data = data;
    this.message = message;

    if (paging) {
      this.paging = paging;
    }
  }
}

const SetResponse = (res, statusCode, data, message, paging) => {
  res.status(statusCode).send(new SuccessResponse(data, message, paging));
};

module.exports = { SetResponse };
