const fs = require('fs');
const path = require('path');
const Tour = require('../models/tourModel');

const file = fs.readFileSync(
  path.resolve(__dirname, './..//dev-data/data/tours-simple.json'),
  'utf-8'
);

const tours = JSON.parse(file);

const arr = tours.map(i => {
  delete i.id;
  return i;
});

const addArrToDb = array => {
  array.forEach(element => {
    try {
      Tour.create(element);
      console.log(`${element.name} created`);
    } catch (error) {
      console.log(err);
    }
  });
};

module.exports = addArrToDb(arr);
