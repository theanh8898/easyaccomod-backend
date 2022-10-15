const jwt = require('jsonwebtoken');

function getAuthenticateInfo(req) {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    return false;
  }
  const arr = `${authHeader}`.split(' ');
  if (arr.length < 2 || !arr[1] || `${arr[0]}`.toLowerCase() !== 'bearer') {
    return false;
  }
  const token = arr[1];
  try {
    return jwt.verify(token, process.env.APP_SECRET);
  } catch (error) {
    return false;
  }
}

function auth(roleIds) {
  return function (req, res, next) {
    const decoded = getAuthenticateInfo(req);

    if (!decoded) {
      res.status(401).end();
      return;
    }

    if (roleIds !== undefined) {
      if (Array.isArray(roleIds)) {
        if (!roleIds.includes(decoded.userRole)) {
          res.status(403).end();
          return;
        }
      } else if (roleIds !== decoded.userRole) {
        res.status(403).end();
        return;
      }
    }

    res.locals.isAuthenticated = true;
    res.locals.userId = decoded.userId;
    res.locals.userRole = decoded.userRole;
    res.locals.tokenId = decoded.tokenId;
    next();
  };
}

module.exports = auth;
module.exports.getAuthenticateInfo = getAuthenticateInfo;
