const router = require('express').Router();
const { User, Review, VerificationRequest } = require('../models');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// 获取个人信息
router.get('/profile', auth, async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] },
  });
  res.json(user);
});

// 更新个人信息
router.put('/profile', auth, async (req, res) => {
  const { nickname, avatar } = req.body;
  await req.user.update({ nickname, avatar });
  res.json(req.user);
});

// 提交实名认证
router.post('/verify', auth, upload.single('student_card'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '请上传学生证照片' });
    }
    const { real_name, student_id } = req.body;
    const student_card_img = `/uploads/${req.file.filename}`;

    await VerificationRequest.create({
      user_id: req.user.id,
      student_card_img,
      real_name,
      student_id,
      status: 'pending',
    });

    await req.user.update({ student_card_img, real_name, student_id });

    res.json({ message: '认证申请已提交，请等待审核' });
  } catch (err) {
    res.status(500).json({ message: '提交认证失败', error: err.message });
  }
});

// 获取用户信用分
router.get('/:id/credit', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'nickname', 'credit_score', 'is_verified'],
    });
    if (!user) return res.status(404).json({ message: '用户不存在' });

    const reviews = await Review.findAll({
      where: { reviewee_id: req.params.id },
      attributes: ['rating', 'comment', 'created_at'],
      include: [
        { model: User, as: 'reviewer', attributes: ['id', 'nickname', 'avatar'] },
      ],
      order: [['created_at', 'DESC']],
      limit: 20,
    });

    res.json({ user, reviews });
  } catch (err) {
    res.status(500).json({ message: '获取信用分失败', error: err.message });
  }
});

module.exports = router;
