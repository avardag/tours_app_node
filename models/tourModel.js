const mongoose = require('mongoose');
const slugify = require('slugify');

/* 
    "id": 2,
    "name": "The Snow Adventurer",
    "duration": 4,
    "maxGroupSize": 10,
    "difficulty": "difficult",
    "ratingsAverage": 4.5,
    "ratingsQuantity": 13,
    "price": 997,
    "summary": "Exciting adventure in the snow with snowboarding and skiing",
    "description": "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum!\nDolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur, exercitation ullamco laboris nisi ut aliquip. Lorem ipsum dolor sit amet, consectetur adipisicing elit!",
    "imageCover": "tour-3-cover.jpg",
    "images": ["tour-3-1.jpg", "tour-3-2.jpg", "tour-3-3.jpg"],
    "startDates"
*/
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less than 40 chars'],
      minlength: [4, 'A tour name must have more than 4 chars']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'Tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Tour must have group size']
    },
    difficulty: {
      type: String,
      required: [true, 'Tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Use easy, medium or difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be more than 1'],
      max: [5, 'Rating must not be more than 5']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'Tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(value) {
          // // this only points to current doc on NEW document creation
          //doesnt work on update
          return value < this.price;
        },
        message: 'Discount price ({VALUE}) should be less that price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'Tour must have a summary']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'Tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false //dont send to client(exclude from query projection)
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

//virtual fileds
tourSchema.virtual('duratinWeeks').get(function() {
  return this.duration / 7;
});

//Document MW, runs before .save() and .create()
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true }); // this == doc
  next();
});

// tourSchema.post('save', function(doc, next){
//   console.log(doc);
// })

//QUERY MW
// tourSchema.pre('find', function(next) {
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } }); //this == query
  // this.startTime = Date.now();
  next();
});
// tourSchema.post(/^find/, function(docs, next) {
//   console.log(`Query took ${Date.now() - this.startTime} milliseconds`);
//   // console.log(docs);
//   next();
// });

//Aggregation MW
tourSchema.pre('aggregate', function(next) {
  // console.log(this.pipeline());
  this.pipeline().unshift({
    // this == aggregate Obj
    $match: { secretTour: { $ne: true } }
  });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
// const testTour = new Tour({
//   name: 'The park Camper',
//   rating: 4.2,
//   price: 997
// });

// testTour
//   .save()
//   .then(doc => {
//     console.log(doc);
//   })
//   .catch(err => console.log(err));
