export class ApplicationError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string = "Validation failed") {
    super(400, message);
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(message: string = "Unauthorized") {
    super(401, message);
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message: string = "Resource not found") {
    super(404, message);
  }
}

export class InternalServerError extends ApplicationError {
  constructor(message: string = "Internal server error") {
    super(500, message);
  }
}

export class BadGatewayError extends ApplicationError {
  constructor(message: string = "Bad gateway") {
    super(502, message);
  }
}

export class ServiceUnavailableError extends ApplicationError {
  constructor(message: string = "Service unavailable") {
    super(503, message);
  }
}

export class GatewayTimeoutError extends ApplicationError {
  constructor(message: string = "Gateway timeout") {
    super(504, message);
  }
}
