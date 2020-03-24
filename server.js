const dotenv = require('dotenv');
const mongoose = require('mongoose');

//catch all global err exceptions programming errs: e.x. not defined vars etc...
process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  console.log('uncaughtException!!! Shutting down');
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

//DB
const dbUri = process.env.DB_URI.replace('<PASSWORD>', process.env.DB_PASSWORD);
mongoose
  .connect(dbUri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connected successfully'));

// console.log(process.env);
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log('server started at port ' + port);
});

//catch all global async rejections
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('unhandledRejection!!! Shutting down');
  server.close(() => {
    process.exit(1);
  });
});
