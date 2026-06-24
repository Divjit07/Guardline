const cron = require('node-cron');
const { processDueEscalations } = require('../services/escalation');
const logger = require('../utils/logger');

const CRON = process.env.ESCALATION_POLL_CRON || '*/2 * * * *';

function startEscalationPoller() {
  cron.schedule(CRON, async () => {
    try {
      await processDueEscalations();
    } catch (err) {
      logger.error('Escalation poller error', { error: err.message });
    }
  });
  logger.info('Escalation poller started', { cron: CRON });
}

module.exports = { startEscalationPoller };
