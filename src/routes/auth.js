const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const   router = express.Router();
const {table} = require('../database');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const userRegisterSchema = require('../validations/user.register.schema');
const userLoginSchema = require('../validations/user.login.schema');
const refreshTokenSchema = require('../validations/refresh.token.schema');
const {USER_ROLE, USER_STATUS} = require('../constants');

router.post('/register', validate(userRegisterSchema), async function (req, res, next) {
  try {
    const data = req.body;
    if (data.role !== USER_ROLE.NORMAL_USER) {
      data.status = USER_STATUS.INACTIVE;
    }
    data.password = bcrypt.hashSync(data.password, 10);
    const user = await table('users').create(data, true);
    res.json({
      code: 200,
      data: {
        id: user.id,
        created_at: user.created_at,
        status: data.status,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', validate(userLoginSchema), async function (req, res, next) {
  try {
    const user = await table('users').findOne({
      username: req.body.username,
    });
    if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
      res.json({
        code: 401,
        message: 'Invalid username or password',
        data: false,
      });
    }
    if (user.status === USER_STATUS.INACTIVE) {
      res.json({
        code: 400,
        message: 'Tài khoản chưa được kích hoạt',
        data: false,
      });
    }
    if (user.status === USER_STATUS.BLOCKED) {
      res.json({
        code: 400,
        message: 'Tài khoản đã bị khóa',
        data: false,
      });
    }
    const tokenId = new Date().getTime();
    const accessToken = jwt.sign({
        userId: user.id,
        userRole: user.role,
        tokenId,
      },
      process.env.APP_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN * 1
      });
    const refreshToken = jwt.sign({
        tokenId,
      },
      process.env.APP_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN * 30
      });
    res.json({
      code: 200,
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: process.env.ACCESS_TOKEN_EXPIRES_IN * 1,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh-token', auth(), validate(refreshTokenSchema), async function (req, res, next) {
  try {
    const decoded = jwt.verify(req.body.refresh_token, process.env.APP_SECRET);
    if (!decoded || decoded.tokenId !== res.locals.tokenId) {
      res.json({
        code: 400,
        data: false,
      });
      return;
    }
    const tokenId = new Date().getTime();
    const accessToken = jwt.sign({
        userId: decoded.userId,
        userRole: decoded.userRole,
        tokenId,
      },
      process.env.APP_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN * 1
      });
    const refreshToken = jwt.sign({
        tokenId,
      },
      process.env.APP_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN * 30
      });
    res.json({
      code: 200,
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: process.env.ACCESS_TOKEN_EXPIRES_IN * 1,
      },
    });
  } catch (error) {
    res.json({
      code: 400,
      data: false,
    });
  }
});

module.exports = router;
