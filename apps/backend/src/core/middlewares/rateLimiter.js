// In-Memory Rate Limiter Middleware
const requestCounts = new Map();

/**
 * Creates a rate limiter middleware.
 * @param {number}   windowMs   - Time window in milliseconds
 * @param {number}   maxRequests - Max requests allowed within windowMs
 * @param {string}   message    - Error message when limit exceeded
 * @param {Function} keyFn      - Optional fn(req) → string to derive bucket key.
 *                                Defaults to IP-based key.
 */
export const createRateLimiter = ({
  windowMs = 15 * 60 * 1000,
  maxRequests = 100,
  message = "Too many requests, please try again later.",
  keyFn = null,
}) => {
  // Periodically clean up expired entries every minute
  setInterval(() => {
    const now = Date.now();
    for (const [k, record] of requestCounts.entries()) {
      if (now > record.resetTime) requestCounts.delete(k);
    }
  }, 60000);

  return (req, res, next) => {
    const clientIp =
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      "unknown-ip";

    const key = keyFn ? keyFn(req, clientIp) : `${req.baseUrl}${req.path}_${clientIp}`;
    const now = Date.now();

    let record = requestCounts.get(key);

    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      requestCounts.set(key, record);
    } else {
      record.count += 1;
    }

    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - record.count));
    res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetTime / 1000));

    if (record.count > maxRequests) {
      return res.status(429).json({ success: false, message });
    }

    next();
  };
};

// Broad auth guard: 20 requests / 15 min per IP across all /auth/* routes
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 20,
  message: "Too many authentication attempts. Please try again after 15 minutes.",
});

// Login-specific: 10 attempts / 15 min per IP
export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  message: "Too many login attempts. Please try again after 15 minutes.",
});

// Forgot-password: 3 requests / hour per email address (falls back to IP)
export const forgotPasswordRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 3,
  message: "Too many password reset requests. Please try again after 1 hour.",
  keyFn: (req, clientIp) => {
    const email = (req.body?.email || "").trim().toLowerCase();
    return email ? `forgot-password_${email}` : `forgot-password_ip_${clientIp}`;
  },
});

// Standard rate limiter for API endpoints
export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 500,
  message: "API rate limit exceeded. Please slow down your requests.",
});

