const router = require('express').Router();
const { Want, User } = require('../models');
const { auth, verifiedOnly } = require('../middleware/auth');

// 求购列表
router.get('/list', async (req, res) => {
  try {
    const { category, page = 1, limit = 12 } = req.query;
    const where = {};
    if (category) where.category = category;

    const { count, rows } = await Want.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'nickname', 'avatar', 'is_verified', 'credit_score'] }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({ wants: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ message: '获取求购列表失败', error: err.message });
  }
});

// 我的求购
router.get('/mine', auth, async (req, res) => {
  try {
    const wants = await Want.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
    });
    res.json(wants);
  } catch (err) {
    res.status(500).json({ message: '获取失败', error: err.message });
  }
});

// 发布求购
router.post('/', auth, verifiedOnly, async (req, res) => {
  try {
    const { title, description, category, budget_min, budget_max, is_negotiable } = req.body;
    if (!title || !category) {
      return res.status(400).json({ message: '请填写标题和分类' });
    }
    const want = await Want.create({
      user_id: req.user.id,
      title,
      description,
      category,
      budget_min,
      budget_max,
      is_negotiable: is_negotiable !== undefined ? is_negotiable : true,
    });
    res.status(201).json(want);
  } catch (err) {
    res.status(500).json({ message: '发布失败', error: err.message });
  }
});

// 编辑求购
router.put('/:id', auth, async (req, res) => {
  try {
    const want = await Want.findByPk(req.params.id);
    if (!want) return res.status(404).json({ message: '求购信息不存在' });
    if (want.user_id !== req.user.id) return res.status(403).json({ message: '无权操作' });

    const { title, description, category, budget_min, budget_max, is_negotiable } = req.body;
    await want.update({ title, description, category, budget_min, budget_max, is_negotiable });
    res.json(want);
  } catch (err) {
    res.status(500).json({ message: '编辑失败', error: err.message });
  }
});

// 删除求购
router.delete('/:id', auth, async (req, res) => {
  try {
    const want = await Want.findByPk(req.params.id);
    if (!want) return res.status(404).json({ message: '求购信息不存在' });
    if (want.user_id !== req.user.id) return res.status(403).json({ message: '无权操作' });
    await want.destroy();
    res.json({ message: '删除成功' });
  } catch (err) {
    res.status(500).json({ message: '删除失败', error: err.message });
  }
});

module.exports = router;
