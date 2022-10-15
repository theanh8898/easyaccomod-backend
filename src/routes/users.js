const express = require('express');
const router = express.Router();
const {table} = require('../database');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {OBJECT_TYPE, USER_ROLE} = require('../constants');
const {getAuthenticateInfo} = auth;
const adminUpdateUserSchema = require('../validations/admin.update.user.schema');
const {getPagination} = require('../utils/common');
const {mapImages} = require('../utils/common');

router.get('/me', auth(), async function (req, res, next) {
  try {
    const id = res.locals.userId; // Current user id
    let user = await table('users').findOne({id});
    if (!user) {
      res.json({
        data: false,
        code: 404,
        message: 'User not found',
      });
      return;
    }
    const images = await table('images').findAll({object_type: OBJECT_TYPE.USER, object_id: user.id});
    user = mapImages(user, images);
    delete user.password;
    res.json({
      code: 200,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

router.put('/me', auth(), async function (req, res, next) {
  try {
    const id = res.locals.userId; // Current user id
    const user = await table('users').findOne({id});
    if (!user) {
      res.json({
        data: false,
        code: 404,
        message: 'User not found',
      });
      return;
    }
    const data = {...req.body};
    delete data.status; // Prevent user update his status by himself
    delete data.password;
    await table('users').update(data, {id});
    res.json({
      code: 200,
      data: true,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', auth(USER_ROLE.ADMIN), async function (req, res, next) {
  try {
    const where = {};
    if (req.query.q) {
      where.full_name = {
        op: 'LIKE',
        value: req.query.q,
      };
    }
    if (req.query.email) {
      where.email = req.query.email;
    }
    if (req.query.role) {
      where.role = req.query.role;
    }
    const paging = getPagination(req.query);
    let users = await table('users').order('id', 'DESC').paging(paging).findAll(where);
    const totalItems = await table('users').count(where);
    if (users && users.length) {
      const ids = [];
      users.forEach(function (user) {
        ids.push(user.id);
        delete user.password;
      });
      const images = await table('images').findAll({object_type: OBJECT_TYPE.ROOM, object_id: ids});
      users = mapImages(users, images);
    }
    res.json({
      code: 200,
      data: {
        pageData: users,
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
    const id = req.params.id;
    let user = await table('users').findOne({id});
    if (user) {
      delete user.password;
    }
    if (!user) {
      res.json({
        data: false,
        code: 404,
        message: 'User not found',
      });
      return;
    }
    const images = await table('images').findAll({object_type: OBJECT_TYPE.USER, object_id: user.id});
    user = mapImages(user, images);
    const authInfo = getAuthenticateInfo(req);
    if (!authInfo || authInfo.userRole !== USER_ROLE.ADMIN) {
      Object.keys(user).forEach(function (key) {
        if (!['id', 'full_name', 'role', 'created_at'].includes(key)) {
          delete user[key];
        }
      });
    }
    res.json({
      code: 200,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', auth(USER_ROLE.ADMIN), validate(adminUpdateUserSchema), async function (req, res, next) {
  try {
    const id = req.params.id;
    if (id === res.locals.userId) {
      res.json({
        code: 400,
        data: false,
        message: 'Could not update by yourself'
      });
      return;
    }
    const user = await table('users').findOne({id});
    if (!user) {
      res.json({
        data: false,
        code: 404,
        message: 'User not found',
      });
      return;
    }
    const data = {
      status: req.body.status,
    };
    await table('users').update(data, {id});
    res.json({
      code: 200,
      data: true,
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', auth(USER_ROLE.ADMIN), async function (req, res, next) {
  try {
    const id = req.params.id;
    if (id === res.locals.userId) {
      res.json({
        code: 400,
        data: false,
        message: 'Could not delete by yourself'
      });
      return;
    }
    const user = await table('users').findOne({id});
    if (!user) {
      res.json({
        data: false,
        code: 404,
        message: 'User not found',
      });
      return;
    }
    await table('users').destroy({id});
    res.json({
      code: 200,
      data: true,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
