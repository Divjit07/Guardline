const cron = require('node-cron');
const { sendDailySummary } = require('../services/summary');
const logger = require('../utils/logger');

const CRON = process.env.SUMMARY_CRON || '0 7 * * *';

function startDailySummary() {
  cron.schedule(CRON, async () => {
    try {
      await sendDailySummary();
    } catch (err) {
      logger.error('Daily summary error', { error: err.message });
    }
  });
  logger.info('Daily summary job started', { cron: CRON });
}

module.exports = { startDailySummary };
