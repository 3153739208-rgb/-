const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Message = sequelize.define('Message', {
  sender_id: { type: DataTypes.INTEGER, allowNull: false },
  receiver_id: { type: DataTypes.INTEGER, allowNull: false },
  product_id: { type: DataTypes.INTEGER },
  content: { type: DataTypes.TEXT },
  image: { type: DataTypes.STRING(255) },
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'messages',
});

module.exports = Message;
