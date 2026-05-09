const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Favorite = sequelize.define('Favorite', {
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'favorites',
  indexes: [{ unique: true, fields: ['user_id', 'product_id'] }],
});

module.exports = Favorite;
