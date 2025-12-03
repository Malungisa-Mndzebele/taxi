const rateLimit = require('express-rate-limit');

// Rate limiter for authentication endpoints
// 5 requests per 15-minute window per IP address
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    message: 'Too many requests, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true, // Enable standard RateLimit-* headers
  legacyHeaders: true, // Enable X-RateLimit-* headers (required by spec)
  handler: (req, res) => {
    res.status(429).json({
      message: 'Too many requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  },
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  // In test environment, use a unique key per test to isolate rate limits
  keyGenerator: (req) => {
    if (process.env.NODE_ENV === 'test') {
      // Use test ID header to isolate rate limits per test
      return `test-${req.headers['x-test-id'] || Date.now()}`;
    }
    return req.ip;
  }
});

module.exports = { authLimiter };
