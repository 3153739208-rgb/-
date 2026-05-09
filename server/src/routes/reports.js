const router = require('express').Router();
const { Report, User } = require('../models');
const { auth } = require('../middleware/auth');

// 提交举报
router.post('/', auth, async (req, res) => {
  try {
    const { target_type, target_id, reason } = req.body;
    if (!target_type || !target_id || !reason) {
      return res.status(400).json({ message: '请填写举报信息' });
    }
    const report = await Report.create({
      reporter_id: req.user.id,
      target_type,
      target_id,
      reason,
    });
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ message: '举报失败', error: err.message });
  }
});

module.exports = router;
