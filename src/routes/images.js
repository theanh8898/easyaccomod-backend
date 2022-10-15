const express = require('express');
const router = express.Router();
const {table} = require('../database');
const path = require('path');
const fs = require('fs');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const uploadHandler = require('../utils/upload.handler');
const uploadImageSchema = require('../validations/upload.image.schema');
const {USER_ROLE} = require('../constants');
const {PATHS} = require('../constants');
const {uploadUrl} = require('../utils/common');

router.post('/', auth(), validate(uploadImageSchema), uploadHandler, async function (req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: 'No files uploaded',
        data: null,
      });
    }
    const data = {
      ...req.query,
      filename: req.file.originalname,
      path: req.file.filename,
      created_by: res.locals.userId,
    };
    const image = await table('images').create(data);
    if (image) {
      image.url = uploadUrl(image.path);
      delete image.path;
    }
    res.json({
      code: 200,
      data: image,
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', auth(), async function (req, res, next) {
  try {
    const image = await table('images').findOne({id: req.params.id});
    if (!image) {
      res.json({
        code: 404,
        message: 'Image not found',
      });
      return;
    }
    if (res.locals.userRole !== USER_ROLE.ADMIN && image.created_by !== res.locals.userId) {
      res.status(403).json({
        code: 403,
        message: 'Access denied',
      });
      return;
    }
    const filepath = path.join(PATHS.UPLOAD_FOLDER, image.path);
    if (fs.existsSync(filepath)) {
      await fs.promises.unlink(filepath);
    }
    await table('images').destroy({id: req.params.id});
    res.json({
      code: 200,
      data: true,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
