const createError = require('http-errors');

const notFound = (req, res, next) => {
  next(createError(404, `Route ${req.originalUrl} not found`));
};


const errorHandler = (err, req, res, next) => {
  res.status(err.status || 500).json({
    error: {
      status: err.status || 500,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
};

module.exports = { notFound, errorHandler };