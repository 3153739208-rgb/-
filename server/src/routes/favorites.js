const router = require('express').Router();
const { Favorite, Product, User } = require('../models');
const { auth } = require('../middleware/auth');

// 收藏/取消收藏
router.post('/:productId', auth, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.productId);
    if (!product) return res.status(404).json({ message: '商品不存在' });

    const exist = await Favorite.findOne({
      where: { user_id: req.user.id, product_id: req.params.productId },
    });

    if (exist) {
      await exist.destroy();
      res.json({ favorited: false });
    } else {
      await Favorite.create({ user_id: req.user.id, product_id: req.params.productId });
      res.json({ favorited: true });
    }
  } catch (err) {
    res.status(500).json({ message: '操作失败', error: err.message });
  }
});

// 取消收藏
router.delete('/:productId', auth, async (req, res) => {
  try {
    await Favorite.destroy({
      where: { user_id: req.user.id, product_id: req.params.productId },
    });
    res.json({ message: '已取消收藏' });
  } catch (err) {
    res.status(500).json({ message: '操作失败', error: err.message });
  }
});

// 我的收藏
router.get('/mine', auth, async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { user_id: req.user.id },
      include: [{
        model: Product,
        include: [{ model: User, as: 'seller', attributes: ['id', 'nickname', 'avatar', 'is_verified'] }],
      }],
      order: [['created_at', 'DESC']],
    });
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ message: '获取收藏失败', error: err.message });
  }
});

module.exports = router;
