const {ATTRIBUTE_VALUE_TYPE} = require('../constants');
module.exports = {
  name: {
    in: ['body'],
    isLength: {
      errorMessage: 'Name is required',
      options: {min: 1}
    },
  },
  value_type: {
    in: ['body'],
    isIn: {
      errorMessage: 'Invalid value type',
      options: [Object.values(ATTRIBUTE_VALUE_TYPE)],
    },
  },
};
