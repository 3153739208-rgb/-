const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { auth } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'campus_trade_jwt_secret_2024';

// 注册
router.post('/register', async (req, res) => {
  try {
    const { email, password, nickname, campus } = req.body;
    if (!email || !password || !nickname || !campus) {
      return res.status(400).json({ message: '请填写所有必填字段' });
    }
    const exist = await User.findOne({ where: { email } });
    if (exist) {
      return res.status(400).json({ message: '邮箱已被注册' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed, nickname, campus });
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, nickname: user.nickname, campus: user.campus, avatar: user.avatar, is_verified: user.is_verified, credit_score: user.credit_score, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: '注册失败', error: err.message });
  }
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: '邮箱或密码错误' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ message: '邮箱或密码错误' });
    }
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, nickname: user.nickname, campus: user.campus, avatar: user.avatar, is_verified: user.is_verified, credit_score: user.credit_score, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: '登录失败', error: err.message });
  }
});

// 获取当前用户
router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
