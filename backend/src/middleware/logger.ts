/**
 * Request Logging Middleware
 *
 * Uses Pino for fast, structured logging.
 * Logs all requests with timing information.
 */

import pino from 'pino';
import pinoHttp from 'pino-http';

// Create base logger
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  // Redact sensitive fields
  redact: {
    paths: [
      'req.headers.authorization',
      'req.body.password',
      'req.body.refreshToken',
      'res.headers["set-cookie"]',
    ],
    censor: '[REDACTED]',
  },
});

// HTTP request logger middleware
export const httpLogger = pinoHttp({
  logger,
  // Custom log level based on response status
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  // Custom success message
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} completed`;
  },
  // Custom error message
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} failed: ${err.message}`;
  },
  // Serialize request (exclude body to avoid logging sensitive data)
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      query: req.query,
      params: req.params,
      // Don't log full headers, just relevant ones
      headers: {
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type'],
      },
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
  // Don't log health check endpoints (noisy)
  autoLogging: {
    ignore: (req) => req.url === '/health',
  },
});

// Export convenience methods
export const log = {
  info: (msg: string, data?: object) => logger.info(data, msg),
  warn: (msg: string, data?: object) => logger.warn(data, msg),
  error: (msg: string, data?: object) => logger.error(data, msg),
  debug: (msg: string, data?: object) => logger.debug(data, msg),
};
