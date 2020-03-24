const express = require('express');

const tourController = require('../controllers/tourController');

const router = express.Router();

// router.param('id', (req, res, next, val) => {
//   console.log(`Tour id is : ${val}`);
//   next();
// });
// router.param('id', tourController.checkId);

// //V-2
// app
//   .route('/api/v1/tours')
//   .get(getAllTours)
//   .post(createTour);
// app
//   .route('/api/v1/tours/:id')
//   .get(getTour)
//   .patch(updateTour)
//   .delete(deleteTour);
// //User Routes
// app
//   .route('/api/v1/users')
//   .get(getAllUsers)
//   .post(createUser);
// app
//   .route('/api/v1/users/:id')
//   .get(getUser)
//   .patch(updateUser)
//   .delete(deleteUser);
//V-3
router
  .route('/top-5-cheap')
  .get(tourController.topToursAlias, tourController.getAllTours);
//Aggregation
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
