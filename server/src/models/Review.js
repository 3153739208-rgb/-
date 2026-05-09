const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Review = sequelize.define('Review', {
  reviewer_id: { type: DataTypes.INTEGER, allowNull: false },
  reviewee_id: { type: DataTypes.INTEGER, allowNull: false },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  rating: { type: DataTypes.TINYINT, allowNull: false, validate: { min: 1, max: 5 } },
  comment: { type: DataTypes.STRING(500) },
}, {
  tableName: 'reviews',
});

module.exports = Review;
