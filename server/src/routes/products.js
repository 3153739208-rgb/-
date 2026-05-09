const router = require('express').Router();
const { Op } = require('sequelize');
const { Product, User, Favorite, BrowseHistory, PriceAlert } = require('../models');
const { auth, verifiedOnly } = require('../middleware/auth');
const { checkPriceDrop } = require('../services/priceAlert');

// 搜索商品
router.get('/search', async (req, res) => {
  try {
    const { campus, category, sort, verified_only, keyword, page = 1, limit = 12 } = req.query;
    const where = { status: 'active' };

    if (campus) where.campus = campus;
    if (category) where.category = category;
    if (keyword) where.title = { [Op.like]: `%${keyword}%` };

    const order = [];
    if (sort === 'price_asc') order.push(['price', 'ASC']);
    else if (sort === 'price_desc') order.push(['price', 'DESC']);
    else order.push(['created_at', 'DESC']);

    const include = [
      {
        model: User, as: 'seller',
        attributes: ['id', 'nickname', 'avatar', 'is_verified', 'credit_score'],
        ...(verified_only === 'true' ? { where: { is_verified: true } } : {}),
      },
      { model: Favorite, attributes: ['id', 'user_id'], separate: true },
    ];

    const { count, rows } = await Product.findAndCountAll({
      where,
      include,
      order,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      distinct: true,
    });

    const products = rows.map((p) => {
      const plain = p.toJSON();
      plain.favorite_count = plain.Favorites?.length || 0;
      delete plain.Favorites;
      return plain;
    });

    res.json({ products, total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ message: '搜索失败', error: err.message });
  }
});

// 获取我的商品
router.get('/mine', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const where = { seller_id: req.user.id };
    if (status) where.status = status;

    const products = await Product.findAll({
      where,
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'seller', attributes: ['id', 'nickname', 'is_verified'] }],
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: '获取失败', error: err.message });
  }
});

// 获取商品详情
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: User, as: 'seller', attributes: ['id', 'nickname', 'avatar', 'is_verified', 'credit_score', 'campus'] },
      ],
    });
    if (!product) return res.status(404).json({ message: '商品不存在' });

    // 记录浏览历史
    if (req.headers.authorization) {
      try {
        const jwt = require('jsonwebtoken');
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'campus_trade_jwt_secret_2024');
        await BrowseHistory.destroy({ where: { user_id: decoded.id, type: 'product', target_id: product.id } });
        await BrowseHistory.create({ user_id: decoded.id, type: 'product', target_id: product.id });
        // 保持最多10条
        const count = await BrowseHistory.count({ where: { user_id: decoded.id, type: 'product' } });
        if (count > 10) {
          const oldest = await BrowseHistory.findAll({
            where: { user_id: decoded.id, type: 'product' },
            order: [['created_at', 'ASC']],
            limit: count - 10,
          });
          await BrowseHistory.destroy({ where: { id: oldest.map((h) => h.id) } });
        }
      } catch {}
    }

    // 检查是否已收藏
    let is_favorited = false;
    if (req.headers.authorization) {
      try {
        const jwt = require('jsonwebtoken');
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'campus_trade_jwt_secret_2024');
        const fav = await Favorite.findOne({ where: { user_id: decoded.id, product_id: product.id } });
        is_favorited = !!fav;
      } catch {}
    }

    res.json({ product, is_favorited });
  } catch (err) {
    res.status(500).json({ message: '获取失败', error: err.message });
  }
});

// 发布商品
router.post('/', auth, verifiedOnly, async (req, res) => {
  try {
    const { title, description, price, original_price, category, condition, images, delivery_method, auto_offline_days } = req.body;
    if (!title || !price || !category) {
      return res.status(400).json({ message: '请填写必填字段' });
    }

    const auto_offline_at = auto_offline_days > 0
      ? new Date(Date.now() + auto_offline_days * 24 * 3600 * 1000)
      : null;

    const product = await Product.create({
      seller_id: req.user.id,
      title,
      description,
      price,
      original_price,
      category,
      condition: condition || '有使用痕迹',
      campus: req.user.campus,
      images: images || [],
      delivery_method: delivery_method || ['线下交付'],
      auto_offline_days: auto_offline_days || 0,
      auto_offline_at,
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: '发布失败', error: err.message });
  }
});

// 编辑商品
router.put('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: '商品不存在' });
    if (product.seller_id !== req.user.id) return res.status(403).json({ message: '无权操作' });

    const oldPrice = parseFloat(product.price);
    const { title, description, price, original_price, category, condition, images, delivery_method } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (original_price !== undefined) updateData.original_price = original_price;
    if (category !== undefined) updateData.category = category;
    if (condition !== undefined) updateData.condition = condition;
    if (images !== undefined) updateData.images = images;
    if (delivery_method !== undefined) updateData.delivery_method = delivery_method;

    await product.update(updateData);

    // 降价检测
    if (price !== undefined && parseFloat(price) < oldPrice) {
      await checkPriceDrop(product.id, oldPrice, parseFloat(price));
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: '编辑失败', error: err.message });
  }
});

// 删除商品
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: '商品不存在' });
    if (product.seller_id !== req.user.id) return res.status(403).json({ message: '无权操作' });
    await product.destroy();
    res.json({ message: '删除成功' });
  } catch (err) {
    res.status(500).json({ message: '删除失败', error: err.message });
  }
});

// 标记已售出
router.put('/:id/sold', auth, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: '商品不存在' });
    if (product.seller_id !== req.user.id) return res.status(403).json({ message: '无权操作' });
    await product.update({ status: 'sold' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: '操作失败', error: err.message });
  }
});

// 下架商品
router.put('/:id/offline', auth, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: '商品不存在' });
    if (product.seller_id !== req.user.id) return res.status(403).json({ message: '无权操作' });
    await product.update({ status: 'offline' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: '操作失败', error: err.message });
  }
});

module.exports = router;
