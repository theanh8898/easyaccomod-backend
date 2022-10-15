const authRouter = require('./auth');
const attributesRouter = require('./attributes');
const invoicesRouter = require('./invoices');
const imagesRouter = require('./images');
const interactionsRouter = require('./interactions');
const locationsRouter = require('./locations');
const roomsRouter = require('./rooms');
const usersRouter = require('./users');
const ratingsRouter = require('./ratings');
const notificationsRouter = require('./notifications');

module.exports = function (app) {
  app.use('/auth', authRouter);
  app.use('/attributes', attributesRouter);
  app.use('/invoices', invoicesRouter);
  app.use('/images', imagesRouter);
  app.use('/interactions', interactionsRouter);
  app.use('/locations', locationsRouter);
  app.use('/rooms', roomsRouter);
  app.use('/ratings', ratingsRouter);
  app.use('/users', usersRouter);
  app.use('/notifications', notificationsRouter);
};
