const {USER_ROLE} = require('../constants');
const {table} = require('../database');
const {locationsSchema} = require('./common.schema');

module.exports = {
  username: {
    in: ['body'],
    isLength: {
      errorMessage: 'Username should be at least 3 chars long',
      options: {min: 3}
    },
    custom: {
      options: async (value) => {
        if (!value) {
          throw new Error('Username is required');
        }
        const user = await table('users').findOne({
          username: value,
        });
        if (user) {
          throw new Error('Username existed');
        }
      }
    }
  },
  password: {
    in: ['body'],
    isLength: {
      errorMessage: 'Password should be at least 6 chars long',
      options: {min: 6}
    },
  },
  full_name: {
    in: ['body'],
    isLength: {
      errorMessage: 'Full name should be at least 6 chars long',
      options: {min: 6}
    },
  },
  email: {
    in: ['body'],
    isEmail: {
      errorMessage: 'Invalid email address',
    },
  },
  role: {
    in: ['body'],
    isIn: {
      options: [[USER_ROLE.NORMAL_USER, USER_ROLE.HOUSE_OWNER]],
    },
  },
  ...locationsSchema,
};
