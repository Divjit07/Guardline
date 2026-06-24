require('dotenv').config();

const express = require('express');
const webhookRoutes = require('./routes/webhook');
const healthRoutes = require('./routes/health');
const incidentsRoutes = require('./routes/incidents');
const oncallRoutes = require('./routes/oncall');
const { startEscalationPoller } = require('./jobs/escalationPoller');
const { startDailySummary } = require('./jobs/dailySummary');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/webhook', webhookRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/incidents', incidentsRoutes);
app.use('/api/oncall', oncallRoutes);

app.get('/', (req, res) => {
  res.json({ service: 'GuardLine', version: '3.1.0', status: 'running' });
});

startEscalationPoller();
startDailySummary();

app.listen(PORT, () => {
  logger.info(`GuardLine listening on port ${PORT}`);
});
