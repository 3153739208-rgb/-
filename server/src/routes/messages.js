const router = require('express').Router();
const { Op } = require('sequelize');
const { Message, User } = require('../models');
const { auth, verifiedOnly } = require('../middleware/auth');

// 获取会话列表
router.get('/conversations', auth, async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: {
        [Op.or]: [{ sender_id: req.user.id }, { receiver_id: req.user.id }],
      },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'nickname', 'avatar'] },
        { model: User, as: 'receiver', attributes: ['id', 'nickname', 'avatar'] },
      ],
      order: [['created_at', 'DESC']],
    });

    // 按对话分组，取最新消息
    const conversations = new Map();
    for (const msg of messages) {
      const partner = msg.sender_id === req.user.id ? msg.receiver : msg.sender;
      const key = partner.id;
      if (!conversations.has(key)) {
        const unreadCount = await Message.count({
          where: { sender_id: partner.id, receiver_id: req.user.id, is_read: false },
        });
        conversations.set(key, {
          user: partner,
          lastMessage: { content: msg.content, image: msg.image, created_at: msg.created_at },
          unreadCount,
          productId: msg.product_id,
        });
      }
    }

    res.json(Array.from(conversations.values()));
  } catch (err) {
    res.status(500).json({ message: '获取会话失败', error: err.message });
  }
});

// 获取与某用户的聊天记录
router.get('/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: req.user.id, receiver_id: req.params.userId },
          { sender_id: req.params.userId, receiver_id: req.user.id },
        ],
      },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'nickname', 'avatar'] },
      ],
      order: [['created_at', 'ASC']],
      limit: 100,
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: '获取消息失败', error: err.message });
  }
});

// 发送消息
router.post('/send', auth, verifiedOnly, async (req, res) => {
  try {
    const { receiver_id, content, image, product_id } = req.body;
    if (!receiver_id || (!content && !image)) {
      return res.status(400).json({ message: '消息内容不能为空' });
    }
    const message = await Message.create({
      sender_id: req.user.id,
      receiver_id,
      content,
      image,
      product_id,
    });

    const full = await Message.findByPk(message.id, {
      include: [{ model: User, as: 'sender', attributes: ['id', 'nickname', 'avatar'] }],
    });

    // Socket.io 实时推送由 socket/chat.js 处理
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${receiver_id}`).emit('new_message', full);
    }

    res.status(201).json(full);
  } catch (err) {
    res.status(500).json({ message: '发送失败', error: err.message });
  }
});

// 标记已读
router.put('/read/:userId', auth, async (req, res) => {
  try {
    await Message.update(
      { is_read: true },
      { where: { sender_id: req.params.userId, receiver_id: req.user.id, is_read: false } }
    );
    res.json({ message: '已标记已读' });
  } catch (err) {
    res.status(500).json({ message: '操作失败', error: err.message });
  }
});

module.exports = router;
