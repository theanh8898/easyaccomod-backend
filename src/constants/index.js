const path = require('path');

const PATHS = {
  UPLOAD_FOLDER: path.join(__dirname, '../../upload/'),
};

const OBJECT_TYPE = {
  USER: 1,
  ROOM: 2,
};

const USER_ROLE = {
  NORMAL_USER: 1,
  HOUSE_OWNER: 2,
  ADMIN: 10,
};

const USER_STATUS = {
  INACTIVE: 0,
  ACTIVE: 1,
  BLOCKED: 10,
};

const ATTRIBUTE_VALUE_TYPE = {
  TEXT: 1,
  INTEGER: 2,
};

const ROOM_TYPE = {
  BOARDING_HOUSE: 1,
  FULL_HOUSE: 2,
  FULL_APARTMENT: 3,
  MINI_APARTMENT: 4,
};

const ROOM_STATUS = {
  AVAILABLE: 0,
  NOT_AVAILABLE: 1,
};

const ROOM_APPROVED_STATUS = {
  NOT_APPROVED: 0,
  APPROVED: 1,
};

const ROOM_TERM = {
  WEEK: 1,
  MONTH: 2,
  QUARTER: 3,
  YEAR: 4,
};

const PRICES = [
  {
    term: ROOM_TERM.WEEK,
    price: 300000,
  },
  {
    term: ROOM_TERM.MONTH,
    price: 1000000,
  },
  {
    term: ROOM_TERM.QUARTER,
    price: 2800000,
  },
  {
    term: ROOM_TERM.YEAR,
    price: 10000000,
  },
];

const INVOICE_STATUS = {
  WAIT_FOR_APPROVE: 1,
  WAIT_FOR_PAY: 2,
  PAID: 3,
  CANCELLED: 4,
};

const IMAGE_USED_TYPE = {
  AVATAR: 'avatar',
  COVER: 'cover',
  SLIDE: 'slide',
  OTHERS: 'others',
};

const INTERACTION_TYPE = {
  FAVORITE: 1,
  VIEW: 2,
};

const NOTIFICATION_TYPE = {
  ROOM_CREATED: 1,
  ROOM_APPROVED: 2,
  ROOM_DISPLAYED: 3,
};

const NOTIFICATION_STATUS = {
  UNREAD: 0,
  READ: 1,
};

module.exports = {
  PATHS,
  OBJECT_TYPE,
  USER_ROLE,
  USER_STATUS,
  ATTRIBUTE_VALUE_TYPE,
  ROOM_TYPE,
  ROOM_STATUS,
  ROOM_APPROVED_STATUS,
  ROOM_TERM,
  PRICES,
  INVOICE_STATUS,
  IMAGE_USED_TYPE,
  INTERACTION_TYPE,
  NOTIFICATION_TYPE,
  NOTIFICATION_STATUS,
};
