const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

app.use(logger('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use('/upload', express.static(path.join(__dirname, 'upload')));

require('./src/routes')(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  if (err.status !== 404) {
    console.error(err);
  }
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.end();
});

module.exports = app;
