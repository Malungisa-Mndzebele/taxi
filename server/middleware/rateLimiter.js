const rateLimit = require('express-rate-limit');

// Rate limiter for authentication endpoints
// 5 requests per 15-minute window per IP address
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Maximum 5 requests per window
  message: {
    message: 'Too many requests, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: false, // Disable standard headers
  legacyHeaders: true, // Enable X-RateLimit-* headers (required by spec)
  handler: (req, res) => {
    res.status(429).json({
      message: 'Too many requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  },
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  skip: () => process.env.NODE_ENV === 'test' // Skip rate limiting in test environment
});

module.exports = { authLimiter };
