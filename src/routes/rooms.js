const express = require('express');
const router = express.Router();
const {table} = require('../database');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  OBJECT_TYPE,
  USER_ROLE,
  ROOM_STATUS,
  ROOM_APPROVED_STATUS,
  PRICES,
  INVOICE_STATUS,
  INTERACTION_TYPE,
  NOTIFICATION_TYPE,
  NOTIFICATION_STATUS,
} = require('../constants');
const createRoomSchema = require('../validations/create.room.chema');
const {mapImages} = require('../utils/common');
const {getConnection} = require('../database');
const moment = require('moment');
const {getPagination} = require('../utils/common');
const {mapResources} = require('../utils/common');

const {getAuthenticateInfo} = auth;

router.post('/', auth([USER_ROLE.HOUSE_OWNER, USER_ROLE.ADMIN]), validate(createRoomSchema), async function (req, res, next) {
  try {
    const pool = await getConnection();
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const data = {
        ...req.body,
        created_by: res.locals.userId,
        expires_at: null,
      };
      const room = await table('rooms', connection).create(data);
      const {attributes} = req.body;
      if (attributes && attributes.length) {
        await updateRoomAttributes(connection, room.id, attributes);
      }
      const price = PRICES.find(function (item) {
        return item.term === req.body.term * 1;
      });
      await table('invoices', connection).create({
        room_id: room.id,
        term: req.body.term,
        qty: req.body.term_qty,
        amount: price.price * req.body.term_qty,
        status: INVOICE_STATUS.WAIT_FOR_APPROVE,
        paid_at: null,
      });
      const notification = await table('notifications', connection).create({
        type: NOTIFICATION_TYPE.ROOM_CREATED,
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
      res.json({
        code: 200,
        data: room,
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

router.get('/', auth([USER_ROLE.HOUSE_OWNER, USER_ROLE.ADMIN]), async function (req, res, next) {
  try {
    let where = {};
    if (res.locals.userRole === USER_ROLE.HOUSE_OWNER) {
      where.created_by = res.locals.userId;
    }
    const paging = getPagination(req.query);
    let items = await table('rooms').order('id', 'DESC').paging(paging).findAll(where);
    items = await loadOtherRoomProperties(items);
    const totalItems = await table('rooms').count(where);
    res.json({
      code: 200,
      data: {
        pageData: items,
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

router.get('/available', async function (req, res, next) {
  try {
    const where = {
      approved_status: ROOM_APPROVED_STATUS.APPROVED,
      status: ROOM_STATUS.AVAILABLE,
      expires_at: {
        op: '>=',
        value: moment().format('YYYY-MM-DD HH:mm:ss'),
      },
    };
    if (req.query.q) {
      where.title = {
        op: 'LIKE',
        value: req.query.q,
      };
    }
    if (req.query.type) {
      where.type = req.query.type;
    }
    if (req.query.province_id) {
      where.province_id = req.query.province_id;
    }
    if (req.query.district_id) {
      where.district_id = req.query.district_id;
    }
    if (req.query.min_price !== undefined && req.query.max_price) {
      where.price = {
        op: '<>',
        value: [req.query.min_price, req.query.max_price],
      };
    }
    if (req.query.is_favorite) {
      const authInfo = getAuthenticateInfo(req);
      if (authInfo && authInfo.userId) {
        const favorites = await table('interactions').order('id', 'DESC').findAll({
          type: INTERACTION_TYPE.FAVORITE,
          user_id: authInfo.userId,
        });
        if (favorites.length) {
          const ids = favorites.map(function (item) {
            return item.room_id;
          }).filter(function (id) {
            return id;
          });
          if (ids.length) {
            where.id = ids;
          }
        }
      }
    }
    const paging = getPagination(req.query);
    let items = await table('rooms').order('id', 'DESC').paging(paging).findAll(where);
    items = await loadOtherRoomProperties(items);
    const totalItems = await table('rooms').count(where);

    res.json({
      code: 200,
      data: {
        pageData: items,
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

router.get('/:id', async function (req, res, next) {
  try {
    let item = await table('rooms').findOne({
      id: req.params.id,
    });
    if (!item) {
      res.json({
        data: false,
        code: 404,
        message: 'Room not found',
      });
      return;
    }
    let items = [item];
    items = await loadOtherRoomProperties(items);
    item = items[0];
    item.attributes = await table('room_attribute').as('ra').join('attributes', 'a', 'ra.attribute_id=a.id').findAll({
      room_id: item.id,
    }, 'ra.*, a.name as attribute_name, a.value_type as attribute_value_type');
    // Only admin or owner can view hidden rooms
    const authInfo = getAuthenticateInfo(req);
    if (!authInfo || (authInfo.userRole !== USER_ROLE.ADMIN && authInfo.userId !== item.created_by)) {
      if (!item.expires_at || item.approved_status !== ROOM_APPROVED_STATUS.APPROVED) {
        res.json({
          data: false,
          code: 404,
          message: 'Room not found',
        });
        return;
      }
    }
    res.json({
      code: 200,
      data: item,
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', auth([USER_ROLE.HOUSE_OWNER, USER_ROLE.ADMIN]), async function (req, res, next) {
  try {
    const id = req.params.id;
    const item = await table('rooms').findOne({id});
    // Only allow update by admin or owner
    if (!item || (item.created_by !== res.locals.userId && res.locals.userRole !== USER_ROLE.ADMIN)) {
      res.json({
        data: false,
        code: 404,
        message: 'Room not found',
      });
      return;
    }
    let data = req.body;
    // Not allow edit after approved
    if (item.approved_status === ROOM_APPROVED_STATUS.APPROVED && res.locals.userRole === USER_ROLE.HOUSE_OWNER) {
      if (data.status === undefined || data.status === item.status) {
        res.json({
          code: 200,
          data: true,
        });
        return;
      }
      data = {
        status: data.status,
      };
    }
    const pool = await getConnection();
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await table('rooms').update(data, {id});
      const {attributes} = req.body;
      if (attributes && attributes.length) {
        await updateRoomAttributes(connection, id, attributes);
      }
      // Update invoice status
      if (item.approved_status === ROOM_APPROVED_STATUS.NOT_APPROVED && data.approved_status === ROOM_APPROVED_STATUS.APPROVED) {
        const invoice = await table('invoices').findOne({
          room_id: item.id,
          status: INVOICE_STATUS.WAIT_FOR_APPROVE,
        });
        if (invoice) {
          await table('invoices', connection).update({
            status: INVOICE_STATUS.WAIT_FOR_PAY,
          }, {
            id: invoice.id,
          });
        }
        const notification = await table('notifications', connection).create({
          type: NOTIFICATION_TYPE.ROOM_APPROVED,
          params: JSON.stringify({
            room: {
              id: item.id,
              title: item.title,
            },
            approved_status: data.approved_status,
          }),
        });
        if (notification) {
          await table('notification_user', connection).create({
            user_id: item.created_by,
            notification_id: notification.id,
            status: NOTIFICATION_STATUS.UNREAD,
          });
        }
      }
      await connection.commit();
      connection.release();
      res.json({
        code: 200,
        data: true,
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', auth(USER_ROLE.ADMIN), async function (req, res, next) {
  try {
    const id = req.params.id;
    const item = await table('rooms').findOne({id});
    // Only allow delete by admin or owner
    if (!item || (item.created_by !== res.locals.userId && res.locals.userRole !== USER_ROLE.ADMIN)) {
      res.json({
        data: false,
        code: 404,
        message: 'Room not found',
      });
      return;
    }
    // Not allow edit after approved
    if (item.approved_status === ROOM_APPROVED_STATUS.APPROVED && res.locals.userRole === USER_ROLE.HOUSE_OWNER) {
      res.json({
        data: false,
        code: 403,
        message: 'Not allowed',
      });
      return;
    }
    await table('rooms').destroy({id});
    res.json({
      code: 200,
      data: true,
    });
  } catch (error) {
    next(error);
  }
});

async function updateRoomAttributes(connection, room_id, attributes) {
  const tbl = table('room_attribute', connection);
  const currentAttributes = await tbl.findAll({
    room_id,
  });
  const newAttributes = [], existedAttributes = [], deletedAttribute = [];
  attributes.forEach(function (item) {
    const isExisted = currentAttributes.find(function (att) {
      return att.attribute_id === item.attribute_id;
    });
    if (!isExisted) {
      newAttributes.push(item);
    } else {
      existedAttributes.push(item);
    }
  });
  currentAttributes.forEach(function (item) {
    const isExisted = attributes.find(function (att) {
      return att.attribute_id === item.attribute_id;
    });
    if (!isExisted) {
      deletedAttribute.push(item);
    }
  });
  if (deletedAttribute.length) {
    const attributeIds = deletedAttribute.map(function (item) {
      return item.attribute_id;
    });
    await tbl.destroy({
      room_id,
      attribute_id: attributeIds,
    });
  }
  if (newAttributes.length) {
    const values = [];
    newAttributes.forEach(function (item) {
      if (item.int_value !== undefined) {
        values.push([room_id, item.attribute_id, null, item.int_value]);
      } else if (item.text_value !== undefined) {
        values.push([room_id, item.attribute_id, item.text_value, null]);
      }
    });
    await connection.query('INSERT INTO room_attribute (room_id, attribute_id, text_value, int_value) VALUES ?', [values]);
  }
  if (existedAttributes.length) {
    const values = [];
    existedAttributes.forEach(function (item) {
      if (item.int_value !== undefined) {
        values.push({
          int_value: item.int_value,
          attribute_id: item.attribute_id,
        });
      } else if (item.text_value !== undefined) {
        values.push({
          text_value: item.text_value,
          attribute_id: item.attribute_id,
        });
      }
    });
    for (let i = 0; i < values.length; i++) {
      await tbl.update(values[i], {
        room_id,
        attribute_id: values[i].attribute_id,
      });
    }
  }
}

async function loadOtherRoomProperties(items) {
  let ids = [], provinceIds = {}, districtIds = {}, wardIds = {};
  items.forEach(function (item) {
    ids.push(item.id);
    if (item.province_id) {
      provinceIds[item.province_id] = item.province_id;
    }
    if (item.district_id) {
      districtIds[item.district_id] = item.district_id;
    }
    if (item.ward_id) {
      wardIds[item.ward_id] = item.ward_id;
    }
  });
  provinceIds = Object.values(provinceIds);
  districtIds = Object.values(districtIds);
  wardIds = Object.values(wardIds);
  if (provinceIds.length) {
    const provinces = await table('provinces').findAll({id: provinceIds});
    items = mapResources(items, provinces, 'province_id', 'province');
  }
  if (districtIds.length) {
    const districts = await table('districts').findAll({id: districtIds});
    items = mapResources(items, districts, 'district_id', 'district');
  }
  if (wardIds.length) {
    const wards = await table('wards').findAll({id: wardIds});
    items = mapResources(items, wards, 'ward_id', 'ward');
  }
  if (ids.length) {
    const images = await table('images').findAll({object_type: OBJECT_TYPE.ROOM, object_id: ids});
    items = mapImages(items, images);
  }
  return items;
}

module.exports = router;
