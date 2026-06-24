const logger = require('../utils/logger');

async function triggerShiftFill({ guardPhone, guardName, site, reason }) {
  const url = process.env.SHIFTFILL_API_URL;
  if (!url) {
    logger.warn('SHIFTFILL_API_URL not set — skipping ShiftFill trigger');
    return false;
  }

  try {
    const res = await fetch(`${url}/api/shift/cant-make`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guardPhone, guardName, site, reason }),
    });
    if (!res.ok) {
      logger.warn('ShiftFill API returned error', { status: res.status });
      return false;
    }
    logger.info('ShiftFill triggered', { guardPhone, site });
    return true;
  } catch (err) {
    logger.warn('ShiftFill unavailable', { error: err.message });
    return false;
  }
}

module.exports = { triggerShiftFill };
