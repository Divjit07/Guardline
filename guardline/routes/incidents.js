const express = require('express');
const { listIncidents, getIncident, updateIncident } = require('../storage/incidents');

const router = express.Router();

router.get('/', async (req, res) => {
  const limit = parseInt(req.query.limit || '50', 10);
  const offset = parseInt(req.query.offset || '0', 10);
  const incidents = await listIncidents({ limit, offset });
  res.json({ incidents });
});

router.get('/:id', async (req, res) => {
  const incident = await getIncident(req.params.id);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });
  res.json({ incident });
});

router.patch('/:id', async (req, res) => {
  const { resolved, notes, incident_report } = req.body;
  const updates = {};
  if (resolved !== undefined) updates.resolved = resolved;
  if (notes !== undefined) updates.notes = notes;
  if (incident_report !== undefined) updates.incident_report = incident_report;

  const ok = await updateIncident(req.params.id, updates);
  if (!ok) return res.status(500).json({ error: 'Update failed' });
  const incident = await getIncident(req.params.id);
  res.json({ incident });
});

module.exports = router;
