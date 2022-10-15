const multer = require('multer');
const {PATHS} = require('../constants');
const path = require('path');
const fs = require('fs');
const {v4: uuidv4} = require('uuid');

const ALLOWED_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'gif',
];

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(PATHS.UPLOAD_FOLDER)) {
      fs.mkdir(PATHS.UPLOAD_FOLDER, {recursive: true}, function (error) {
        if (error) {
          cb(error);
        } else {
          cb(null, PATHS.UPLOAD_FOLDER);
        }
      });
    } else {
      cb(null, PATHS.UPLOAD_FOLDER);
    }
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + path.extname(file.originalname).toLowerCase());
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_SIZE,
  },
  fileFilter: function (req, file, cb) {
    if (!file || !file.originalname) {
      return cb(new Error('No file found'));
    }
    const ext = file.originalname.split('.').pop().toLocaleLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(new Error('Invalid file type'));
    }
    cb(null, true);
  }
}).single('file');

function uploadHandler(req, res, next) {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      res.status(400).json({
        code: 400,
        message: err.message,
      });
      return;
    } else if (err) {
      res.status(400).json({
        code: 400,
        message: 'Could not upload file',
      });
      return;
    }
    next();
  });
}

module.exports = uploadHandler;
