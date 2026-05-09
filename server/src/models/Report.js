const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Report = sequelize.define('Report', {
  reporter_id: { type: DataTypes.INTEGER, allowNull: false },
  target_type: { type: DataTypes.ENUM('product', 'user'), allowNull: false },
  target_id: { type: DataTypes.INTEGER, allowNull: false },
  reason: { type: DataTypes.STRING(500), allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'resolved', 'dismissed'), defaultValue: 'pending' },
  handler_id: { type: DataTypes.INTEGER },
}, {
  tableName: 'reports',
});

module.exports = Report;
