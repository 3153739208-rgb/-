const router = require('express').Router();
const { Op } = require('sequelize');
const { User, VerificationRequest, Report, Product } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');

// 所有管理后台路由需要管理员权限
router.use(auth, adminOnly);

// 获取认证申请列表
router.get('/verifications', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;

    const { count, rows } = await VerificationRequest.findAndCountAll({
      where,
      include: [{ model: User, attributes: ['id', 'nickname', 'email'] }],
      order: [['created_at', 'ASC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({ requests: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ message: '获取认证列表失败', error: err.message });
  }
});

// 处理认证申请
router.put('/verifications/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: '状态值无效' });
    }

    const vr = await VerificationRequest.findByPk(req.params.id);
    if (!vr) return res.status(404).json({ message: '申请不存在' });

    await vr.update({ status, reviewed_by: req.user.id });

    if (status === 'approved') {
      await User.update(
        { is_verified: true, real_name: vr.real_name, student_id: vr.student_id },
        { where: { id: vr.user_id } }
      );
    }

    res.json({ message: `已${status === 'approved' ? '通过' : '驳回'}认证申请` });
  } catch (err) {
    res.status(500).json({ message: '处理失败', error: err.message });
  }
});

// 获取举报列表
router.get('/reports', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;

    const { count, rows } = await Report.findAndCountAll({
      where,
      include: [
        { model: User, as: 'reporter', attributes: ['id', 'nickname'] },
        { model: User, as: 'handler', attributes: ['id', 'nickname'] },
      ],
      order: [['created_at', 'ASC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({ reports: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ message: '获取举报列表失败', error: err.message });
  }
});

// 处理举报
router.put('/reports/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ message: '状态值无效' });
    }

    const report = await Report.findByPk(req.params.id);
    if (!report) return res.status(404).json({ message: '举报不存在' });

    await report.update({ status, handler_id: req.user.id });

    // 如果是处理商品举报，可选择下架商品
    if (status === 'resolved' && report.target_type === 'product') {
      await Product.update({ status: 'offline' }, { where: { id: report.target_id } });
    }

    res.json({ message: `举报已${status === 'resolved' ? '处理' : '驳回'}` });
  } catch (err) {
    res.status(500).json({ message: '处理失败', error: err.message });
  }
});

// 用户管理
router.get('/users', async (req, res) => {
  try {
    const { keyword, page = 1, limit = 20 } = req.query;
    const where = {};
    if (keyword) {
      where[Op.or] = [
        { nickname: { [Op.like]: `%${keyword}%` } },
        { email: { [Op.like]: `%${keyword}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({ users: rows, total: count, page: parseInt(page) });
  } catch (err) {
    res.status(500).json({ message: '获取用户列表失败', error: err.message });
  }
});

module.exports = router;
