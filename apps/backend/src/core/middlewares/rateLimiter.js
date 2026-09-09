// In-Memory Rate Limiter Middleware
const requestCounts = new Map();

/**
 * Creates a rate limiter middleware
 * @param {number} windowMs - Time window in milliseconds
 * @param {number} maxRequests - Max requests allowed per IP within windowMs
 * @param {string} message - Custom error message when limit exceeded
 */
export const createRateLimiter = ({
  windowMs = 15 * 60 * 1000,
  maxRequests = 100,
  message = "Too many requests from this IP, please try again later."
}) => {
  // Periodically clean up expired IP entries every minute
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of requestCounts.entries()) {
      if (now > record.resetTime) {
        requestCounts.delete(ip);
      }
    }
  }, 60000);

  return (req, res, next) => {
    const clientIp =
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      "unknown-ip";

    const key = `${req.baseUrl}_${clientIp}`;
    const now = Date.now();

    let record = requestCounts.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs
      };
      requestCounts.set(key, record);
    } else {
      record.count += 1;
    }

    // Set standard RateLimit headers
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader(
      "X-RateLimit-Remaining",
      Math.max(0, maxRequests - record.count)
    );
    res.setHeader(
      "X-RateLimit-Reset",
      Math.ceil(record.resetTime / 1000)
    );

    if (record.count > maxRequests) {
      return res.status(429).json({
        success: false,
        message
      });
    }

    next();
  };
};

// Strict rate limiter for Authentication routes (Login, Signup, Reset Password)
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 20, // max 20 login/signup attempts per 15 mins
  message: "Too many authentication attempts. Please try again after 15 minutes."
});

// Standard rate limiter for API endpoints
export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 500, // max 500 requests per 15 mins per IP
  message: "API rate limit exceeded. Please slow down your requests."
});

