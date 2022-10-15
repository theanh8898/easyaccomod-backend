const {table} = require('../database');

module.exports = {
  room_id: {
    in: ['query'],
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
};
