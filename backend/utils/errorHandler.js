exports.handleError = (res, error, defaultMessage = "Erro interno") => {
  const status = error.statusCode || 500;
  console.error(defaultMessage, error);
  res.status(status).json({
    message: error.message || defaultMessage,
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
}
