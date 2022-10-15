const express = require('express');
const router = express.Router();
const {table} = require('../database');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const favoriteSchema = require('../validations/favorites.schema');
const {INTERACTION_TYPE} = require('../constants');

router.post('/favorites', auth(), validate(favoriteSchema), async function (req, res, next) {
  try {
    const data = {
      room_id: req.query.room_id,
      type: INTERACTION_TYPE.FAVORITE,
      user_id: res.locals.userId,
    };
    const item = await table('interactions').findOne(data);
    if (!item) {
      await table('interactions').create(data);
    }
    res.json({
      code: 200,
      data: true,
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/favorites', auth(), validate(favoriteSchema), async function (req, res, next) {
  try {
    const where = {
      room_id: req.query.room_id,
      type: INTERACTION_TYPE.FAVORITE,
      user_id: res.locals.userId,
    };
    const item = await table('interactions').findOne(where);
    if (item) {
      await table('interactions').destroy(where);
    }
    res.json({
      code: 200,
      data: true,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/favorites', auth(), validate(favoriteSchema), async function (req, res, next) {
  try {
    const where = {
      room_id: req.query.room_id,
      type: INTERACTION_TYPE.FAVORITE,
      user_id: res.locals.userId,
    };
    const item = await table('interactions').findOne(where);
    res.json({
      code: 200,
      data: !!item,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
