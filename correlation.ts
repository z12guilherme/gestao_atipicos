import { logger } from "@/utils/logger";

/**
 * Simple UUID v4 generator for correlation IDs.
 */
function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// A single ID for the entire user session to correlate frontend logs.
const sessionCorrelationId = uuidv4();

// Create a child logger that includes the correlationId in every log message.
export const correlationLogger = logger.child({ correlationId: sessionCorrelationId });