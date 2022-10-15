const express = require('express');
const router = express.Router();
const {table} = require('../database');
const {getPagination} = require('../utils/common');
const auth = require('../middlewares/auth');
const {NOTIFICATION_STATUS} = require('../constants');

router.get('/', auth(), async function (req, res, next) {
  try {
    const paging = getPagination(req.query);
    const notifications = await table('notifications').as('n').join('notification_user', 'nu', 'n.id=nu.notification_id').order('n.id', 'DESC').paging(paging).findAll(`nu.user_id='${res.locals.userId}'`);
    const totalItems = await table('notifications').as('n').join('notification_user', 'nu', 'n.id=nu.notification_id').count(`nu.user_id='${res.locals.userId}'`);
    if (notifications && notifications.length) {
      notifications.forEach(function (notification) {
        if (notification.params) {
          notification.params = JSON.parse(notification.params);
        }
      });
    }
    res.json({
      code: 200,
      data: {
        pageData: notifications,
        pageInfo: {
          ...paging,
          totalItems,
        }
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/unread', auth(), async function (req, res, next) {
  try {
    const totalItems = await table('notifications').as('n')
      .join('notification_user', 'nu', 'n.id=nu.notification_id')
      .count(`nu.user_id='${res.locals.userId}' AND nu.status='${NOTIFICATION_STATUS.UNREAD}'`);
    res.json({
      code: 200,
      data: {
        totalItems,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/status', auth(), async function (req, res, next) {
  try {
    const item = await table('notification_user').findOne({
      id: req.params.id,
    });
    if (item && req.body.status) {
      await table('notification_user').update({
        status: req.body.status,
      }, {
        id: req.params.id,
      });
    }
    res.json({
      code: 200,
      data: true,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
