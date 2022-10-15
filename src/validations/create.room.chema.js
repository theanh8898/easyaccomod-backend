const {ROOM_TYPE, ROOM_TERM} = require('../constants');
const {locationsSchema, attributesSchema} = require('./common.schema');
module.exports = {
  title: {
    in: ['body'],
    isLength: {
      errorMessage: 'Title should be at least 10 chars long',
      options: {min: 10}
    },
  },
  address: {
    in: ['body'],
    isLength: {
      errorMessage: 'Address is required',
      options: {min: 1}
    },
  },
  description: {
    in: ['body'],
    isLength: {
      errorMessage: 'Description should be at least 10 chars long',
      options: {min: 10}
    },
  },
  type: {
    in: ['body'],
    isIn: {
      errorMessage: 'Invalid room type',
      options: [Object.values(ROOM_TYPE)],
    },
  },
  ...locationsSchema,
  ...attributesSchema,
  term: {
    in: ['body'],
    isIn: {
      errorMessage: 'Invalid term',
      options: [Object.values(ROOM_TERM)],
    },
  },
  term_qty: {
    in: ['body'],
    isInt: {
      errorMessage: 'Invalid term quantity',
      options: {
        min: 1,
      },
    },
  },
};
