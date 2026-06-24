const pendingDb = require('../storage/pendingEscalations');
const twilioService = require('./twilio');
const logger = require('../utils/logger');

const URGENT_DELAY_MINUTES = parseInt(process.env.URGENT_DELAY_MINUTES || '15', 10);

async function escalateCritical(escalationMessage) {
  await twilioService.sendSupervisorSMS({ message: escalationMessage });
}

async function scheduleUrgentEscalation({ incidentId, guardPhone, site, message }) {
  const fireAt = new Date(Date.now() + URGENT_DELAY_MINUTES * 60 * 1000).toISOString();
  await pendingDb.savePendingEscalation({
    incident_id: incidentId,
    guard_phone: guardPhone,
    site,
    message,
    fire_at: fireAt,
    fired: false,
  });
  logger.info('Urgent escalation scheduled', { incidentId, fireAt });
}

async function processDueEscalations() {
  const due = await pendingDb.getDuePendingEscalations();
  for (const esc of due) {
    await twilioService.sendSupervisorSMS({ message: esc.message });
    await pendingDb.markEscalationFired(esc.id);
    logger.info('Urgent escalation fired', { incidentId: esc.incident_id });
  }
}

module.exports = { escalateCritical, scheduleUrgentEscalation, processDueEscalations };
