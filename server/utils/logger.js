/**
 * Logger utility for consistent logging across the application using Winston
 */

const winston = require('winston');

const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (stack) {
      log += `\n${stack}`;
    }
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    return log;
  })
);

// Create Winston logger
const winstonLogger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: logFormat,
  transports: [
    // Console transport
    new winston.transports.Console({
      format: consoleFormat,
      silent: isTest // Silence logs during tests
    }),
    // File transport for errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      silent: isTest
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      silent: isTest
    })
  ]
});

// Wrapper class to maintain existing API
class Logger {
  /**
   * Log info messages
   */
  info(message, ...args) {
    winstonLogger.info(message, ...args);
  }

  /**
   * Log warning messages
   */
  warn(message, ...args) {
    winstonLogger.warn(message, ...args);
  }

  /**
   * Log error messages
   */
  error(message, error = null) {
    if (error) {
      winstonLogger.error(message, { error: error.message, stack: error.stack });
    } else {
      winstonLogger.error(message);
    }
  }

  /**
   * Log debug messages
   */
  debug(message, ...args) {
    winstonLogger.debug(message, ...args);
  }
}

module.exports = new Logger();

