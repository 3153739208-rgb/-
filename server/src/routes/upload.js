const router = require('express').Router();
const upload = require('../middleware/upload');

// 上传单张图片
router.post('/image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: '请选择图片' });
  }
  res.json({ url: `/uploads/${req.file.filename}` });
});

// 上传多张图片
router.post('/images', upload.array('images', 9), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: '请选择图片' });
  }
  const urls = req.files.map((f) => `/uploads/${f.filename}`);
  res.json({ urls });
});

module.exports = router;
