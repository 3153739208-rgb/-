const sequelize = require('../config/db');
const User = require('./User');
const Product = require('./Product');
const Favorite = require('./Favorite');
const Message = require('./Message');
const Want = require('./Want');
const Report = require('./Report');
const Review = require('./Review');

// 辅助模型：浏览历史、降价提醒、认证申请
const { DataTypes } = require('sequelize');

const BrowseHistory = sequelize.define('BrowseHistory', {
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.ENUM('campus', 'product'), allowNull: false },
  target_id: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'browse_history' });

const PriceAlert = sequelize.define('PriceAlert', {
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  old_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  new_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  is_notified: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'price_alerts' });

const VerificationRequest = sequelize.define('VerificationRequest', {
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  student_card_img: { type: DataTypes.STRING(255), allowNull: false },
  real_name: { type: DataTypes.STRING(50) },
  student_id: { type: DataTypes.STRING(50) },
  status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
  reviewed_by: { type: DataTypes.INTEGER },
}, { tableName: 'verification_requests' });

// === 模型关联 ===

// 用户 - 商品
User.hasMany(Product, { foreignKey: 'seller_id', as: 'products' });
Product.belongsTo(User, { foreignKey: 'seller_id', as: 'seller' });

// 用户 - 收藏
User.hasMany(Favorite, { foreignKey: 'user_id' });
Favorite.belongsTo(User, { foreignKey: 'user_id' });
Product.hasMany(Favorite, { foreignKey: 'product_id' });
Favorite.belongsTo(Product, { foreignKey: 'product_id' });

// 用户 - 私信
User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiver_id', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });
Message.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// 用户 - 求购
User.hasMany(Want, { foreignKey: 'user_id' });
Want.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 用户 - 举报
User.hasMany(Report, { foreignKey: 'reporter_id', as: 'reports' });
Report.belongsTo(User, { foreignKey: 'reporter_id', as: 'reporter' });
Report.belongsTo(User, { foreignKey: 'handler_id', as: 'handler' });

// 用户 - 评价
User.hasMany(Review, { foreignKey: 'reviewer_id', as: 'givenReviews' });
User.hasMany(Review, { foreignKey: 'reviewee_id', as: 'receivedReviews' });
Review.belongsTo(User, { foreignKey: 'reviewer_id', as: 'reviewer' });
Review.belongsTo(User, { foreignKey: 'reviewee_id', as: 'reviewee' });
Review.belongsTo(Product, { foreignKey: 'product_id' });

// 用户 - 浏览历史
User.hasMany(BrowseHistory, { foreignKey: 'user_id' });
BrowseHistory.belongsTo(User, { foreignKey: 'user_id' });

// 用户 - 降价提醒
User.hasMany(PriceAlert, { foreignKey: 'user_id' });
PriceAlert.belongsTo(User, { foreignKey: 'user_id' });
Product.hasMany(PriceAlert, { foreignKey: 'product_id' });
PriceAlert.belongsTo(Product, { foreignKey: 'product_id' });

// 用户 - 认证申请
User.hasMany(VerificationRequest, { foreignKey: 'user_id' });
VerificationRequest.belongsTo(User, { foreignKey: 'user_id' });
VerificationRequest.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewer' });

module.exports = {
  sequelize,
  User,
  Product,
  Favorite,
  Message,
  Want,
  Report,
  Review,
  BrowseHistory,
  PriceAlert,
  VerificationRequest,
};
