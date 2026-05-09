const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Want = sequelize.define('Want', {
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT },
  category: { type: DataTypes.ENUM('教材', '数码', '生活', '体育', '其他'), allowNull: false },
  budget_min: { type: DataTypes.DECIMAL(10, 2) },
  budget_max: { type: DataTypes.DECIMAL(10, 2) },
  is_negotiable: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'wants',
});

module.exports = Want;
