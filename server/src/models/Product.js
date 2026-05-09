const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('Product', {
  seller_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  original_price: { type: DataTypes.DECIMAL(10, 2) },
  category: { type: DataTypes.ENUM('教材', '数码', '生活', '体育', '其他'), allowNull: false },
  condition: { type: DataTypes.ENUM('全新', '几乎全新', '有使用痕迹', '较旧'), defaultValue: '有使用痕迹' },
  campus: { type: DataTypes.STRING(50), allowNull: false },
  images: { type: DataTypes.JSON },
  delivery_method: { type: DataTypes.JSON },
  status: { type: DataTypes.ENUM('active', 'sold', 'offline'), defaultValue: 'active' },
  auto_offline_days: { type: DataTypes.INTEGER },
  auto_offline_at: { type: DataTypes.DATE },
}, {
  tableName: 'products',
});

module.exports = Product;
