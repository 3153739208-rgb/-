const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  nickname: { type: DataTypes.STRING(50), allowNull: false },
  real_name: { type: DataTypes.STRING(50) },
  student_id: { type: DataTypes.STRING(50) },
  avatar: { type: DataTypes.STRING(255) },
  campus: { type: DataTypes.STRING(50), allowNull: false, defaultValue: '诚毅学院' },
  is_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  student_card_img: { type: DataTypes.STRING(255) },
  credit_score: { type: DataTypes.DECIMAL(3, 1), defaultValue: 5.0 },
  role: { type: DataTypes.ENUM('user', 'admin', 'verifier'), defaultValue: 'user' },
}, {
  tableName: 'users',
});

module.exports = User;
