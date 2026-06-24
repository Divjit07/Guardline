const twilio = require('twilio');
const logger = require('../utils/logger');
const { toSmsPhone } = require('../utils/phoneUtils');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.TWILIO_WHATSAPP_NUMBER;
const smsFrom = process.env.TWILIO_SMS_FROM;

const twilioClient = accountSid && authToken ? twilio(accountSid, authToken) : null;

async function sendReply(toPhone, body) {
  if (!twilioClient) {
    logger.warn('Twilio not configured — would reply', { toPhone, body });
    return;
  }
  try {
    await twilioClient.messages.create({
      from: whatsappFrom,
      to: toPhone,
      body,
    });
  } catch (err) {
    logger.error('sendReply failed', { error: err.message, toPhone });
  }
}

async function sendDocument(toPhone, mediaUrl, caption) {
  if (!twilioClient) {
    logger.warn('Twilio not configured — would send document', { toPhone, mediaUrl });
    return;
  }
  try {
    await twilioClient.messages.create({
      from: whatsappFrom,
      to: toPhone,
      mediaUrl: [mediaUrl],
      body: caption,
    });
  } catch (err) {
    logger.error('sendDocument failed', { error: err.message, toPhone });
  }
}

async function sendSupervisorSMS({ message }) {
  const supervisorPhone = process.env.ON_CALL_SUPERVISOR_PHONE;
  if (!supervisorPhone) {
    logger.warn('ON_CALL_SUPERVISOR_PHONE not set — escalation SMS skipped');
    return;
  }
  if (!twilioClient) {
    logger.warn('Twilio not configured — would SMS supervisor', { message });
    return;
  }
  try {
    await twilioClient.messages.create({
      from: smsFrom,
      to: toSmsPhone(supervisorPhone),
      body: message,
    });
    logger.info('Supervisor SMS sent');
  } catch (err) {
    logger.error('sendSupervisorSMS failed', { error: err.message });
  }
}

function validateTwilioRequest(req, res, next) {
  if (!authToken || !process.env.WEBHOOK_BASE_URL) {
    logger.warn('Skipping Twilio signature validation — auth token or WEBHOOK_BASE_URL not set');
    return next();
  }

  const isValid = twilio.validateRequest(
    authToken,
    req.headers['x-twilio-signature'],
    `${process.env.WEBHOOK_BASE_URL}/webhook/whatsapp`,
    req.body
  );

  if (!isValid) {
    logger.warn('Invalid Twilio signature');
    return res.status(403).send('Forbidden');
  }
  next();
}

module.exports = { sendReply, sendDocument, sendSupervisorSMS, validateTwilioRequest };
