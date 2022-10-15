const express = require('express');
const router = express.Router();
const moment = require('moment');
const {table} = require('../database');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {USER_ROLE, INVOICE_STATUS, PRICES, ROOM_TERM, NOTIFICATION_TYPE, NOTIFICATION_STATUS} = require('../constants');
const createInvoiceSchema = require('../validations/create.invoice.chema');
const {getPagination} = require('../utils/common');
const {getConnection} = require('../database');

router.get('/', auth([USER_ROLE.HOUSE_OWNER, USER_ROLE.ADMIN]), async function (req, res, next) {
  try {
    const where = {};
    if (res.locals.userRole !== USER_ROLE.ADMIN) {
      where['i.status'] = Object.values(INVOICE_STATUS).filter(function (item) {
        return item !== INVOICE_STATUS.WAIT_FOR_APPROVE;
      });
      where['r.created_by'] = res.locals.userId;
    } else {
      if (req.query.created_by) {
        where['r.created_by'] = req.query.created_by;
      }
    }
    const paging = getPagination(req.query);
    const invoices = await table('invoices').as('i').join('rooms', 'r', 'i.room_id=r.id').order('id', 'DESC').paging(paging).findAll(where, 'i.*, r.title AS room_title');
    const totalItems = await table('invoices').as('i').join('rooms', 'r', 'i.room_id=r.id').count(where);
    res.json({
      code: 200,
      data: {
        pageData: invoices,
        pageInfo: {
          ...paging,
          totalItems,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', auth([USER_ROLE.HOUSE_OWNER, USER_ROLE.ADMIN]), async function (req, res, next) {
  try {
    const where = {
      ['i.id']: req.params.id,
    };
    if (res.locals.userRole !== USER_ROLE.ADMIN) {
      where['i.status'] = Object.values(INVOICE_STATUS).filter(function (item) {
        return item !== INVOICE_STATUS.WAIT_FOR_APPROVE;
      });
      where['r.created_by'] = res.locals.userId;
    }
    const invoice = await table('invoices').as('i').join('rooms', 'r', 'i.room_id=r.id').findOne(where, 'i.*, r.title AS room_title');
    res.json({
      code: 200,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', auth([USER_ROLE.ADMIN]), validate(createInvoiceSchema), async function (req, res, next) {
  try {
    const price = PRICES.find(function (item) {
      return item.term === req.body.term * 1;
    });
    const data = {
      ...req.body,
      amount: price.price * req.body.qty,
      status: INVOICE_STATUS.WAIT_FOR_PAY,
      paid_at: null,
    };
    const invoice = await table('invoices').create(data);
    res.json({
      code: 200,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', auth([USER_ROLE.ADMIN]), async function (req, res, next) {
  try {
    const where = {
      id: req.params.id,
    };
    const invoice = await table('invoices').findOne(where);
    if (!invoice) {
      res.json({
        data: false,
        code: 404,
        message: 'Invoice not found',
      });
      return;
    }
    if (invoice.status === INVOICE_STATUS.PAID || invoice.status === INVOICE_STATUS.CANCELLED) {
      res.json({
        data: false,
        code: 400,
        message: 'Invalid status',
      });
      return;
    }
    const data = {
      status: req.body.status,
    };
    const {term, qty} = invoice;
    if (data.status === INVOICE_STATUS.PAID && invoice.status !== INVOICE_STATUS.PAID) {
      data.paid_at = moment().format('YYYY-MM-DD HH:mm:ss');
      const room = await table('rooms').findOne({id: invoice.room_id});
      const roomData = {};
      if (!room.expires_at) {
        roomData.expires_at = moment();
      } else {
        roomData.expires_at = moment(room.expires_at);
      }
      if (term === ROOM_TERM.WEEK) {
        roomData.expires_at = roomData.expires_at.add(qty, 'w');
      }
      if (term === ROOM_TERM.MONTH) {
        roomData.expires_at = roomData.expires_at.add(qty, 'M');
      }
      if (term === ROOM_TERM.QUARTER) {
        roomData.expires_at = roomData.expires_at.add(qty * 3, 'M');
      }
      if (term === ROOM_TERM.YEAR) {
        roomData.expires_at = roomData.expires_at.add(qty, 'y');
      }
      roomData.expires_at = roomData.expires_at.format('YYYY-MM-DD HH:mm:ss');
      const pool = await getConnection();
      const connection = await pool.getConnection();
      try {
        await table('invoices', connection).update(data, where);
        await table('rooms', connection).update(roomData, {
          id: invoice.room_id,
        });

        const notification = await table('notifications', connection).create({
          type: NOTIFICATION_TYPE.ROOM_DISPLAYED,
          params: JSON.stringify({
            room: {
              id: room.id,
              title: room.title,
            },
          }),
        });
        if (notification) {
          await table('notification_user', connection).create({
            user_id: room.created_by,
            notification_id: notification.id,
            status: NOTIFICATION_STATUS.UNREAD,
          });
        }

        await connection.commit();
        await connection.release();
      } catch (error) {
        await connection.rollback();
        await connection.release();
        next(error);
        return;
      }
    } else {
      await table('invoices').update(data, where);
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
