const {OBJECT_TYPE, IMAGE_USED_TYPE} = require('../constants');
const {table} = require('../database');
module.exports = {
  object_type: {
    in: ['query'],
    isIn: {
      errorMessage: 'Invalid object type',
      options: [Object.values(OBJECT_TYPE)],
    }
  },
  object_id: {
    in: ['query'],
    custom: {
      options: async (value, {req}) => {
        if (!value) {
          throw new Error('Object id is required');
        }
        if (!req.query.object_type) {
          throw new Error('Object type is required');
        }
        const objectType = req.query.object_type * 1;
        let item = null;
        if (objectType === OBJECT_TYPE.USER) {
          item = await table('users').findOne({
            id: value,
          });
        }
        if (objectType === OBJECT_TYPE.ROOM) {
          item = await table('rooms').findOne({
            id: value,
          });
        }
        if (!item) {
          throw new Error('Object not found');
        }
      }
    }
  },
  used_type: {
    in: ['query'],
    isIn: {
      errorMessage: 'Invalid used type',
      options: [Object.values(IMAGE_USED_TYPE)],
    }
  },
};
