const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    version: '3.1.1',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
