module.exports = {
  username: {
    in: ['body'],
    isLength: {
      errorMessage: 'Username is required',
      options: {min: 1}
    },
  },
  password: {
    in: ['body'],
    isLength: {
      errorMessage: 'Password is required',
      options: {min: 1}
    },
  },
};
