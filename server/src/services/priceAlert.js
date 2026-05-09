const { Favorite, PriceAlert, User } = require('../models');

async function checkPriceDrop(productId, oldPrice, newPrice) {
  try {
    // 获取所有收藏该商品的用户
    const favorites = await Favorite.findAll({
      where: { product_id: productId },
      include: [{ model: User }],
    });

    for (const fav of favorites) {
      await PriceAlert.create({
        product_id: productId,
        user_id: fav.user_id,
        old_price: oldPrice,
        new_price: newPrice,
        is_notified: false,
      });
    }
  } catch (err) {
    console.error('降价检测失败:', err.message);
  }
}

module.exports = { checkPriceDrop };
