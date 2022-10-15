const express = require("express");
const router = express.Router();
const { table } = require("../database");
const auth = require("../middlewares/auth");
const {getPagination} = require("../utils/common");
const getConnection = require('../database/connect');

router.post("/", auth(), async function (req, res, next) {
  try {
    const rating = await table("ratings").create({
      user_id: res.locals.userId,
      room_id: req.body.room_id,
      rate: req.body.rate,
      comment: req.body.comment,
    });
    res.json({
      code: 200,
      data: rating,
    });
  } catch (e) {
    next(e);
  }
});

router.get("/rooms/:room_id/stats", async function (req, res, next) {
  try {
    const connection = await getConnection();
    const sql = `SELECT rate,COUNT(*) as count 
                  FROM ratings 
                  WHERE room_id = ? 
                  GROUP BY rate 
                  ORDER BY count DESC;`;
    const [rows] = await connection.query(sql, [req.params.room_id]);
    res.json({
      code: 200,
      data: rows,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/rooms/:room_id", async function (req, res, next) {
  try {
    const paging = getPagination(req.query);
    const where = {
      room_id: req.params.room_id,
    };
    if (req.query.rate) {
      where.rate = req.query.rate;
    }
    const items = await table("ratings").paging(paging).findAll(where);
    const totalItems = await table("ratings").paging(paging).count(where);
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
module.exports = router;
