const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'campus_trade_jwt_secret_2024';

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: '请先登录' });
    }
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: '用户不存在' });
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: '登录已过期，请重新登录' });
  }
};

const verifiedOnly = (req, res, next) => {
  if (!req.user.is_verified) {
    return res.status(403).json({ message: '请先完成实名认证' });
  }
  next();
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: '无管理员权限' });
  }
  next();
};

module.exports = { auth, verifiedOnly, adminOnly };
