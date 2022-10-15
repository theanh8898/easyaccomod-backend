const express = require('express');
const router = express.Router();
const {table} = require('../database');

router.get('/provinces', async function (req, res, next) {
  try {
    const items = await table('provinces').findAll();
    res.json({
      code: 200,
      data: items,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/provinces/:province_id', async function (req, res, next) {
  try {
    const item = await table('provinces').findOne({
      id: req.params.province_id,
    });
    if (!item) {
      res.json({
        data: false,
        code: 404,
        message: 'Province not found',
      });
      return;
    }
    res.json({
      code: 200,
      data: item,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/provinces/:province_id/districts', async function (req, res, next) {
  try {
    const items = await table('districts').findAll({
      province_id: req.params.province_id,
    });
    res.json({
      code: 200,
      data: items,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/districts/:district_id', async function (req, res, next) {
  try {
    const item = await table('districts').findOne({
      id: req.params.district_id,
    });
    if (!item) {
      res.json({
        data: false,
        code: 404,
        message: 'District not found',
      });
      return;
    }
    res.json({
      code: 200,
      data: item,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/districts/:district_id/wards', async function (req, res, next) {
  try {
    const items = await table('wards').findAll({
      district_id: req.params.district_id,
    });
    res.json({
      code: 200,
      data: items,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/wards/:ward_id', async function (req, res, next) {
  try {
    const item = await table('wards').findOne({
      id: req.params.ward_id,
    });
    if (!item) {
      res.json({
        data: false,
        code: 404,
        message: 'Ward not found',
      });
      return;
    }
    res.json({
      code: 200,
      data: item,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
