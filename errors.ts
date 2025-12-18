/**
 * Base class for custom, traceable application errors.
 */
export class AppError extends Error {
  public readonly context?: Record<string, any>;

  constructor(message: string, context?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
    this.context = context;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Represents an error originating from an API call.
 */
export class ApiError extends AppError {
  public readonly statusCode?: number;

  constructor(message: string, statusCode?: number, context?: Record<string, any>) {
    super(message, context);
    this.statusCode = statusCode;
  }
}