module.exports = {
  reset_token: {
    in: ['body'],
    isLength: {
      errorMessage: 'Token is required',
      options: {min: 1}
    },
  },
  new_password: {
    in: ['body'],
    isLength: {
      errorMessage: 'Password should be at least 6 chars long',
      options: {min: 6}
    },
  },
};
