// Placeholder implementation for the logger.
// TODO: Install 'pino' and replace this with a structured logger if required.

export const correlationLogger = {
  info: (meta: any, message: string) => console.info(`[INFO] ${message}`, meta),
  error: (meta: any, message: string) => console.error(`[ERROR] ${message}`, meta),
  warn: (meta: any, message: string) => console.warn(`[WARN] ${message}`, meta),
};