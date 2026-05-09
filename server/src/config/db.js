const { Sequelize } = require('sequelize');
const path = require('path');

const dialect = process.env.DB_DIALECT || 'sqlite';

const sequelize = dialect === 'mysql'
  ? new Sequelize(
      process.env.DB_NAME || 'campus_trade',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD || 'root123',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false,
        pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
        define: { timestamps: true, underscored: true },
      }
    )
  : new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '../../data/campus_trade.db'),
      logging: false,
      define: { timestamps: true, underscored: true },
    });

module.exports = sequelize;
