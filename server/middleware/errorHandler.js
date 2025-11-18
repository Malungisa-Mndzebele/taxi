const logger = require('../utils/logger');

/**
 * Custom error class for application errors
 */
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error response formatter
 * Ensures consistent error response format across all endpoints
 */
const formatErrorResponse = (error, statusCode, code = null) => {
  const response = {
    message: error.message || 'An error occurred'
  };

  if (code) {
    response.code = code;
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development' && error.stack) {
    response.stack = error.stack;
  }

  return response;
};

/**
 * Handle JWT verification errors
 */
const handleJWTError = (error) => {
  if (error.name === 'TokenExpiredError') {
    logger.warn(`Token Expired: ${error.message}`);
    return {
      statusCode: 401,
      code: 'AUTH_EXPIRED',
      message: 'Token is not valid'
    };
  }

  if (error.name === 'JsonWebTokenError') {
    logger.warn(`JWT Error: ${error.message}`);
    return {
      statusCode: 401,
      code: 'AUTH_INVALID',
      message: 'Token is not valid'
    };
  }

  return null;
};

/**
 * Handle Mongoose validation errors
 */
const handleValidationError = (error) => {
  logger.warn(`Validation Error: ${error.message}`);
  
  const errors = Object.values(error.errors || {}).map(err => ({
    field: err.path,
    message: err.message
  }));

  return {
    statusCode: 400,
    message: 'Validation failed',
    errors
  };
};

/**
 * Handle MongoDB duplicate key errors
 */
const handleDuplicateKeyError = (error) => {
  const field = Object.keys(error.keyPattern || {})[0];
  const value = error.keyValue ? error.keyValue[field] : 'unknown';
  
  logger.warn(`Duplicate Key Error: ${field} = ${value}`);
  
  let message = 'Duplicate value error';
  if (field === 'email') {
    message = 'Email already registered';
  } else if (field === 'phone') {
    message = 'Phone number already registered';
  } else if (field) {
    message = `${field} already exists`;
  }

  return {
    statusCode: 400,
    message,
    field
  };
};

/**
 * Handle MongoDB cast errors
 */
const handleCastError = (error) => {
  logger.warn(`Cast Error: ${error.message}`);
  
  return {
    statusCode: 400,
    message: `Invalid ${error.path}: ${error.value}`
  };
};

/**
 * Comprehensive error handling middleware
 * Handles all types of errors with consistent response format
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Log error details
  logger.error('Error occurred:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Handle JWT errors
  const jwtError = handleJWTError(err);
  if (jwtError) {
    return res.status(jwtError.statusCode).json(
      formatErrorResponse(
        { message: jwtError.message },
        jwtError.statusCode,
        jwtError.code
      )
    );
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const validationError = handleValidationError(err);
    return res.status(validationError.statusCode).json({
      message: validationError.message,
      errors: validationError.errors
    });
  }

  // Handle MongoDB duplicate key errors
  if (err.code === 11000) {
    const duplicateError = handleDuplicateKeyError(err);
    return res.status(duplicateError.statusCode).json({
      message: duplicateError.message
    });
  }

  // Handle Mongoose cast errors
  if (err.name === 'CastError') {
    const castError = handleCastError(err);
    return res.status(castError.statusCode).json({
      message: castError.message
    });
  }

  // Handle rate limit errors
  if (err.status === 429 || err.statusCode === 429) {
    return res.status(429).json(
      formatErrorResponse(
        { message: 'Too many requests, please try again later' },
        429,
        'RATE_LIMIT_EXCEEDED'
      )
    );
  }

  // Handle 404 errors
  if (err.status === 404 || err.statusCode === 404) {
    return res.status(404).json(
      formatErrorResponse(
        { message: err.message || 'Resource not found' },
        404
      )
    );
  }

  // Handle 403 errors
  if (err.status === 403 || err.statusCode === 403) {
    return res.status(403).json(
      formatErrorResponse(
        { message: err.message || 'Forbidden' },
        403
      )
    );
  }

  // Handle 401 errors
  if (err.status === 401 || err.statusCode === 401) {
    return res.status(401).json(
      formatErrorResponse(
        { message: err.message || 'Unauthorized' },
        401
      )
    );
  }

  // Handle custom AppError
  if (err.isOperational) {
    return res.status(err.statusCode || 500).json(
      formatErrorResponse(err, err.statusCode, err.code)
    );
  }

  // Default error response (500)
  const statusCode = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'development' 
    ? err.message 
    : 'Internal server error';

  res.status(statusCode).json(
    formatErrorResponse({ message, stack: err.stack }, statusCode)
  );
};

/**
 * 404 handler for undefined routes
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Route not found: ${req.method} ${req.originalUrl}`,
    404
  );
  next(error);
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  AppError,
  errorHandler,
  notFoundHandler,
  asyncHandler
};
