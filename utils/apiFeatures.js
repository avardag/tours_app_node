/**
 * @param mongQuery -> Tour.find()
 * @param queryStringObj:Object -> req.query
 * @returns Mongo Query with query methods implemeted on itmethods
 */
class APIFeatures {
  constructor(mongQuery, queryStringObj) {
    this.mongQuery = mongQuery;
    this.queryStringObj = queryStringObj;
  }

  filter() {
    //1-A - filtering
    const queryObj = { ...this.queryStringObj };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    excludedFields.forEach(el => delete queryObj[el]);

    //1-B - Advanced filtering
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lt|lte)\b/g,
      matched => `$${matched}`
    );
    // console.log(queryString); //-> {"difficulty":"easy","duration":{"$lte":"5"},"price":{"$lt":"500"}}

    const querObjAdvanced = JSON.parse(queryString);
    this.mongQuery = this.mongQuery.find(querObjAdvanced);
    return this;
  }

  sort() {
    //2 - Sorting
    // request to '/api/v1/tours?sort=price,ratingsAvegare'
    if (this.queryStringObj.sort) {
      const sortBy = this.queryStringObj.sort.split(',').join(' ');
      this.mongQuery = this.mongQuery.sort(sortBy);
    } else {
      //default sorted by createdAt(desc)
      this.mongQuery = this.mongQuery.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    //3 - Limit fields
    // request to '/api/v1/tours?fields=name,price,duration'
    if (this.queryStringObj.fields) {
      const fields = this.queryStringObj.fields.split(',').join(' '); //{'name price duration'}
      this.mongQuery = this.mongQuery.select(fields); // query "projection"
    } else {
      //send al fields, but exclude '__v' field of mongo
      this.mongQuery = this.mongQuery.select('-__v');
    }
    return this;
  }

  paginate() {
    //4 - Pagination
    // request to '/api/v1/tours?limit=10' -> 1-10(page1), 11-20(page2)
    const page = this.queryStringObj.page * 1 || 1;
    const limit = this.queryStringObj.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.mongQuery = this.mongQuery.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
