const AppError = require('./../utils/appError');

/**
 *
 * @param {Object} err - MongoDB Error response object
 */
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;

  return new AppError(message, 400);
};

/**
 * handles mongoDB duplicate values error
 * @param {Object} err - MongoDB Error response object
 */
const handleDuplicateFieldsErrDB = err => {
  const enteredValue = err.errmsg.match(/"([^"]+)"/)[0];
  const message = `Duplicate Field Value: ${enteredValue}. Please use another value`;

  return new AppError(message, 400);
};

/**
 * Handles Mongoose validation Errors
 * @param {Object} err - MongoDB Error response object
 */
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;

  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  //Operational, trusted error. Send message to client
  if (err.isOperationalError) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
    //Programming or other unknown errors. No error details for client
  } else {
    //1) Log the error
    console.error('ERROR');
    //2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  //send different types of errors in dev or prod
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    //handle MongoDB errors
    //Wrong _id error
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsErrDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);

    sendErrorProd(error, res);
  }
};
