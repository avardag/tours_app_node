/**
 * catches async errors. No need to write try-catch blocks
 * @param {Function} fn -> async function, e.x. route controller
 * @returns anonymous function to be assigned -> ex. route handler,
 */
const catchAsyncErr = fn => {
  return function(req, res, next) {
    // fn(req, res, next).catch(err => next(err)); // or:
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsyncErr;
