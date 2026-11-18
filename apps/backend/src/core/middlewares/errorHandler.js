// Centralized Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isProd = process.env.NODE_ENV === "production";

  // Prevent information leakage in production mode
  const responsePayload = {
    success: false,
    message: err.message || "Internal server error",
  };

  if (!isProd && err.stack) {
    responsePayload.stack = err.stack;
  }

  res.status(statusCode).json(responsePayload);
};

export default errorHandler;
