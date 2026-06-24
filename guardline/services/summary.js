const incidentsDb = require('../storage/incidents');
const twilioService = require('./twilio');
const { buildMorningSummary } = require('../utils/reportBuilder');
const logger = require('../utils/logger');

async function sendDailySummary() {
  const incidents = await incidentsDb.getOvernightIncidents();
  const publicIncidents = incidents.filter((inc) => !inc.confidential);
  const message = buildMorningSummary(publicIncidents);
  await twilioService.sendSupervisorSMS({ message });
  logger.info('Daily summary sent', { count: publicIncidents.length });
}

module.exports = { sendDailySummary };
