const createError = require('http-errors');

const roleCheck = (...allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user?.role)) {
    return next(createError(403, `Roles allowed: ${allowedRoles.join(', ')}`));
  }
  next();
};

module.exports = roleCheck;