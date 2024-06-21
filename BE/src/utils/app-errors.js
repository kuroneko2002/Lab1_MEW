const STATUS_CODES = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  FORBIDDEN_ERROR: 403,
};

class AppErr extends Error {
  constructor(name, statusCode, description, isOperational, errorStack, logingErrorResponse) {
    super(description);
    Object.setPrototypeOf(this, new.target.prototype);
    this.description = description;
    this.name = name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorStack = errorStack;
    this.logs = logingErrorResponse;
    Error.captureStackTrace(this);
  }
}

// api specific error handling
class APICustomError extends AppErr {
  constructor(name, statusCode, description, message, isOperational) {
    super(name, statusCode, description, isOperational, null, message);
  }
}

class InternalServerError extends APICustomError {
  constructor(description, message) {
    super('Internal Server Error', STATUS_CODES.INTERNAL_SERVER_ERROR, description, message, true);
  }
}

// 400
class BadRequestError extends APICustomError {
  constructor(description, message) {
    super('Bad Request', STATUS_CODES.BAD_REQUEST, description, message, true);
  }
}

// 401
class UnauthorizeError extends AppErr {
  constructor(description, message) {
    super('Unauthorize', STATUS_CODES.UNAUTHORIZED, description, message, true);
  }
}

class ForbiddenError extends AppErr {
  constructor(description, message) {
    super('Forbidden', STATUS_CODES.FORBIDDEN_ERROR, description, message, true);
  }
}

class DBError extends APICustomError {
  constructor(description, message) {
    super('Error Database', STATUS_CODES.BAD_REQUEST, description, message, true);
  }
}

module.exports = {
  AppErr,
  InternalServerError,
  APICustomError,
  BadRequestError,
  UnauthorizeError,
  DBError,
  STATUS_CODES,
  ForbiddenError,
};
