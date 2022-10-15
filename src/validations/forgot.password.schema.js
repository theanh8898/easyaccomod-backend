module.exports = {
  email: {
    in: ['body'],
    isLength: {
      errorMessage: 'Email is required',
      options: {min: 1}
    },
  },
};
