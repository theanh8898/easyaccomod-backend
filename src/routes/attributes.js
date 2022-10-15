const express = require('express');
const router = express.Router();
const {table} = require('../database');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {USER_ROLE} = require('../constants');
const adminCreateAttributeSchema = require('../validations/admin.create.attribute');

router.post('/', auth(USER_ROLE.ADMIN), validate(adminCreateAttributeSchema), async function (req, res, next) {
  try {
    const data = req.body;
    if (data.predefined_values) {
      if (Array.isArray(data.predefined_values)) {
        data.predefined_values = JSON.stringify(data.predefined_values);
      } else {
        data.predefined_values = null;
      }
    } else {
      data.predefined_values = null;
    }
    const attr = await table('attributes').create(data, false);
    res.json({
      code: 200,
      data: attr,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', auth([USER_ROLE.ADMIN, USER_ROLE.HOUSE_OWNER]), async function (req, res, next) {
  try {
    const items = await table('attributes').order('name', 'ASC').findAll();
    items.forEach(function (item) {
      if (item.predefined_values) {
        item.predefined_values = JSON.parse(item.predefined_values);
      }
    });
    res.json({
      code: 200,
      data: items,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', auth(USER_ROLE.ADMIN), async function (req, res, next) {
  try {
    const item = await table('attributes').findOne({
      id: req.params.id,
    });
    if (!item) {
      res.json({
        data: false,
        code: 404,
        message: 'Attribute not found',
      });
      return;
    }
    if (item.predefined_values) {
      item.predefined_values = JSON.parse(item.predefined_values);
    }
    res.json({
      code: 200,
      data: item,
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', auth(USER_ROLE.ADMIN), async function (req, res, next) {
  try {
    const id = req.params.id;
    const item = await table('attributes').findOne({id});
    if (!item) {
      res.json({
        data: false,
        code: 404,
        message: 'Attribute not found',
      });
      return;
    }
    const data = req.body;
    if (data.predefined_values) {
      if (Array.isArray(data.predefined_values)) {
        data.predefined_values = JSON.stringify(data.predefined_values);
      } else {
        data.predefined_values = null;
      }
    } else {
      data.predefined_values = null;
    }
    await table('attributes').update(data, {id});
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
    const item = await table('attributes').findOne({id});
    if (!item) {
      res.json({
        data: false,
        code: 404,
        message: 'Attribute not found',
      });
      return;
    }
    await table('attributes').destroy({id});
    res.json({
      code: 200,
      data: true,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
