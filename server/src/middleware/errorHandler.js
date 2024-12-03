export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  if (err.response) {
    // External API error
    return res.status(err.response.status).json({
      error: "External API Error",
      message: err.response.data
    });
  }

  if (err.code === "ECONNREFUSED") {
    return res.status(503).json({
      error: "Service Unavailable",
      message: "Unable to connect to external service"
    });
  }

  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong"
  });
};
