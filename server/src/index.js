const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const cron = require('node-cron');
const { Server } = require('socket.io');
const { sequelize } = require('./models');
const { initChat } = require('./socket/chat');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.set('io', io);
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/wants', require('./routes/wants'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/upload', require('./routes/upload'));

// 微信支付预留接口
app.post('/api/payment/wechat/create', (req, res) => {
  res.status(501).json({ message: '微信支付暂未接入' });
});

// Socket.io 初始化
initChat(io);

// 定时任务：自动下架到期商品（每小时检查一次）
cron.schedule('0 * * * *', async () => {
  try {
    const { Product } = require('./models');
    await Product.update(
      { status: 'offline' },
      { where: { status: 'active', auto_offline_at: { [require('sequelize').Op.lte]: new Date() } } }
    );
  } catch (err) {
    console.error('自动下架任务失败:', err.message);
  }
});

const PORT = process.env.PORT || 3001;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
    await sequelize.sync({ alter: true });
    console.log('模型同步完成');

    server.listen(PORT, () => {
      console.log(`服务运行在 http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('启动失败:', err.message);
    process.exit(1);
  }
}

start();
