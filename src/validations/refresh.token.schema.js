module.exports = {
  refresh_token: {
    in: ['body'],
    isLength: {
      errorMessage: 'Refresh token is required',
      options: {min: 1}
    },
  },
};
