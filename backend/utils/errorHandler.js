module.exports = (res, error, defaultMessage = "Erro interno") => {
  const status = error.statusCode || 500
  res.status(status).json({ message: error.message || defaultMessage })
}

exports.handleError = (res, error, defaultMessage = "Erro interno") => {
  console.error(defaultMessage, error)
  res.status(500).json({
    message: defaultMessage,
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  })
}
