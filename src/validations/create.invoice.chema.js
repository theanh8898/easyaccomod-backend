const {ROOM_TERM} = require('../constants');
const {table} = require('../database');
module.exports = {
  room_id: {
    in: ['body'],
    custom: {
      options: async (value) => {
        if (!value) {
          throw new Error('Room id is required');
        }
        const room = await table('rooms').findOne({
          id: value,
        });
        if (!room) {
          throw new Error('Room not found');
        }
      }
    }
  },
  term: {
    in: ['body'],
    isIn: {
      errorMessage: 'Invalid term',
      options: [Object.values(ROOM_TERM)],
    },
  },
  qty: {
    in: ['body'],
    isInt: {
      errorMessage: 'Invalid term quantity',
      options: {
        min: 1,
      },
    },
  },
};
