export class ApiError extends Error {
  statusCode: number;
  context?: any;

  constructor(message: string, statusCode: number = 500, options?: { context?: any }) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.context = options?.context;
  }
}