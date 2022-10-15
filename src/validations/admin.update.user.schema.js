const {USER_STATUS} = require('../constants');
module.exports = {
  status: {
    in: ['body'],
    isIn: {
      errorMessage: 'Invalid status',
      options: [Object.values(USER_STATUS)],
    },
  },
};
