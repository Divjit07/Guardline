const express = require('express');
const router = express.Router();

let onCall = {
  name: process.env.ON_CALL_SUPERVISOR_NAME || 'Supervisor',
  phone: process.env.ON_CALL_SUPERVISOR_PHONE || null,
};

router.get('/', (req, res) => {
  res.json({ onCall });
});

router.put('/', (req, res) => {
  const { name, phone } = req.body;
  if (name) onCall.name = name;
  if (phone) onCall.phone = phone;
  res.json({ onCall });
});

module.exports = router;
