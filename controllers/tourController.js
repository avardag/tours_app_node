const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsyncErr = require('./../utils/catchAsyncErr');
const AppError = require('./../utils/appError');

// catchAsyncErr(W
/**
 * /api/v1/tours/top-5-cheap
 */
exports.topToursAlias = (req, res, next) => {
  //prefill query obj
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

//ROUTE handlers

//Route handlers
exports.getAllTours = catchAsyncErr(async (req, res, next) => {
  /* 
    /api/v1/tours?difficulty=easy&duration[lte]=5&page=2&limit=5&price[lt]=500
  */

  //Build Query
  const queryWithFeatures = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  ///////////////
  //EXECUTE QUERY
  const tours = await queryWithFeatures.mongQuery;
  //SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours }
  });
});

exports.createTour = catchAsyncErr(async (req, res, next) => {
  // const newTour = new Tour({});
  // newTour.save().then(() => {});
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });
});
// exports.createTour = async (req, res) => {
//   try {
//     // const newTour = new Tour({});
//     // newTour.save().then(() => {});
//     const newTour = await Tour.create(req.body);
//     res.status(201).json({
//       status: 'success',
//       data: {
//         tour: newTour
//       }
//     });
//   } catch (error) {
//     res.status(400).json({
//       status: 'fail',
//       message: error
//     });
//   }
// };

exports.getTour = catchAsyncErr(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new AppError('Tour with that ID is not found', 404));
  }

  res.status(201).json({
    status: 'success',
    data: {
      tour
    }
  });
});

exports.updateTour = catchAsyncErr(async (req, res, next) => {
  const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
    // context: 'query'
  });

  if (!updatedTour) {
    return next(new AppError('Tour with that ID is not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: updatedTour
    }
  });
});

exports.deleteTour = catchAsyncErr(async (req, res, next) => {
  // await Tour.findByIdAndDelete(req.params.id);
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError('Tour with that ID is not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

//AGGREGATION - stats
exports.getTourStats = catchAsyncErr(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        // _id: null, //groupBy . <_id: null> for get all, ungrouped
        // _id: '$difficulty', // group by difficulty
        _id: { $toUpper: '$difficulty' }, // group by difficulty. difficulty value uppercased
        numTours: { $sum: 1 }, //increment, and get total nums
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 } //1 for ascending
    }
    // {
    //   $match: { _id: { $ne: 'EASY' } } //all but not EASY. $ne-> NOT EQUAL
    // }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.getMonthlyPlan = catchAsyncErr(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates' //$unwind for decostructing startDates Array. will make separate dpcs for each el in arr
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' }, //goup by month in startDates field of a doc
        numToursInAMonth: { $sum: 1 }
      }
    },
    {
      $addFields: { month: '$_id' } // add a fields named month with value of id(e.x. 1, 2, 3)
    },
    {
      $project: { _id: 0 } // removve _id feild from return
    },
    {
      $sort: { numToursInAMonth: -1 }
    }
    // {
    //   $limit: 6
    // }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
});
