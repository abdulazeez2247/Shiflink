const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(createError(403, 'Admin access required'));
  } else {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
};

module.exports = isAdmin;
