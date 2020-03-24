const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');

const app = express();
app.use(express.json()); //for parsing body args

//MW
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//MW
// app.use((req, res, next) => {
//   console.log('Hello from MiddleWare');
//   next();
// });

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//Mounting router
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
//Catch all route. Should come below all routes

app.all('*', (req, res, next) => {
  // const err = new Error(`Ooops! Cant find ${req.originalUrl}`);
  // err.status = 'fail';
  // err.statusCode = 404;
  // next(err);
  //using AppError util fn
  next(new AppError(`Ooops! Cant find ${req.originalUrl}`, 404));
});

//Error handler
app.use(globalErrorHandler);
module.exports = app;
