const {checkSchema, validationResult} = require('express-validator');

/**
 * https://github.com/validatorjs/validator.js
 */

function handleResult(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  res.status(400).json({
    code: 400,
    message: 'Bad input',
    errors: errors.array(),
  });
}

module.exports = function (schema) {
  return [checkSchema(schema), handleResult];
};
