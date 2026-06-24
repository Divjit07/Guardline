const express = require('express');
const router = express.Router();

const { guardByPhone } = require('../storage/roster');
const { getConversation, saveConversation } = require('../storage/conversations');
const { saveIncident } = require('../storage/incidents');
const { getDocumentMediaUrl } = require('../storage/documents');
const { getAIResponse } = require('../services/ai');
const twilioService = require('../services/twilio');
const escalation = require('../services/escalation');
const { triggerShiftFill } = require('../services/coverageService');
const systemPrompt = require('../prompts/systemPrompt');
const { checkKeywordOverride } = require('../utils/keywordOverride');
const { checkDocumentRequest } = require('../utils/documentMatcher');
const { checkRateLimit } = require('../utils/rateLimiter');
const { normalizePhone } = require('../utils/phoneUtils');
const { generateIncidentId, buildEscalationMessage } = require('../utils/reportBuilder');
const logger = require('../utils/logger');

router.post('/whatsapp', twilioService.validateTwilioRequest, async (req, res) => {
  try {
    const guardPhone = normalizePhone(req.body.From);
    const userMessage = (req.body.Body || '').trim();

    if (!userMessage) {
      return res.status(200).send('<Response></Response>');
    }

    logger.info('Incoming WhatsApp message', { guardPhone, preview: userMessage.slice(0, 80) });

    const rateCheck = checkRateLimit(guardPhone);
    if (!rateCheck.allowed) {
      await twilioService.sendReply(guardPhone, 'You have reached the message limit. Please wait before sending more messages.');
      return res.status(200).send('<Response></Response>');
    }

    const guard = await guardByPhone(guardPhone);
    const conversation = await getConversation(guardPhone);
    const history = conversation.history || [];
    const site = conversation.site || guard.default_site || guard.site || null;

    // Document requests — keyword match, no AI needed
    const docRequest = checkDocumentRequest(userMessage);
    if (docRequest) {
      const keys = docRequest.document_keys || [docRequest.document_key].filter(Boolean);
      let sent = 0;
      for (const key of keys) {
        const doc = await getDocumentMediaUrl(key);
        if (doc?.url) {
          await twilioService.sendDocument(guardPhone, doc.url, `Here is your ${doc.label}.`);
          sent++;
        }
      }
      if (!sent) {
        await twilioService.sendReply(guardPhone, 'I do not have that document. Ask your supervisor to add it.');
      }
      return res.status(200).send('<Response></Response>');
    }

    // Keyword override runs BEFORE AI
    const override = checkKeywordOverride(userMessage);
    let aiResponse = null;

    if (override) {
      aiResponse = {
        ...override,
        confidence: 'high',
        site,
        document_key: null,
        reply: 'Your supervisor has been alerted. Stay in a safe location. Do not engage. Are you injured? What is your exact location?',
        details: { summary: userMessage.slice(0, 200), suspect_description: null, location_in_store: null, cctv_available: 'unknown', police_called: 'unknown', evidence_notes: null },
      };
    } else {
      aiResponse = await getAIResponse(systemPrompt, history, userMessage);
    }

    if (!aiResponse) {
      const docFallback = checkDocumentRequest(userMessage);
      if (docFallback) {
        const keys = docFallback.document_keys || [];
        let sent = 0;
        for (const key of keys) {
          const doc = await getDocument(key);
          if (doc) {
            await twilioService.sendDocument(guardPhone, doc.url, `Here is your ${doc.label}.`);
            sent++;
          }
        }
        if (!sent) {
          await twilioService.sendReply(guardPhone, 'I do not have that document. Ask your supervisor to add it.');
        }
        return res.status(200).send('<Response></Response>');
      }

      const fallback = checkKeywordOverride(userMessage);
      if (fallback) {
        aiResponse = {
          ...fallback,
          confidence: 'high',
          site,
          document_key: null,
          reply: 'Your supervisor has been alerted. Stay safe and do not engage.',
          details: { summary: userMessage.slice(0, 200) },
        };
      } else {
        await twilioService.sendReply(guardPhone, 'I received your message. Can you tell me what is happening and which site you are at?');
        return res.status(200).send('<Response></Response>');
      }
    }

    // Document request from AI — supports single or multiple keys
    if (aiResponse.intent === 'DOCUMENT_REQUEST') {
      const keys = aiResponse.document_keys
        || (aiResponse.document_key ? [aiResponse.document_key] : []);
      let sent = 0;
      for (const key of keys) {
        const doc = await getDocumentMediaUrl(key);
        if (doc?.url) {
          await twilioService.sendDocument(guardPhone, doc.url, `Here is your ${doc.label}.`);
          sent++;
        }
      }
      if (!sent) {
        await twilioService.sendReply(guardPhone, 'I do not have that document. Ask your supervisor to add it.');
      }
      return res.status(200).send('<Response></Response>');
    }

    const incidentId = generateIncidentId();
    const resolvedSite = aiResponse.site || site;
    const severity = aiResponse.severity || 'operational';
    const isConfidential = aiResponse.intent === 'EMPLOYEE_THEFT';

    const incident = {
      id: incidentId,
      guard_phone: guardPhone,
      guard_name: guard.name,
      guard_known: guard.isKnown,
      site_name: resolvedSite,
      intent: aiResponse.intent,
      severity,
      confidential: isConfidential,
      summary: aiResponse.details?.summary || userMessage.slice(0, 200),
      suspect_description: aiResponse.details?.suspect_description || null,
      cctv_zone: aiResponse.details?.location_in_store || null,
      police_called: aiResponse.details?.police_called === 'yes',
      full_conversation: [...history, { role: 'user', content: userMessage }, { role: 'assistant', content: aiResponse.reply }],
      escalated: false,
    };

    const escalationMessage = buildEscalationMessage({
      guardName: guard.name,
      site: resolvedSite,
      intent: aiResponse.intent,
      summary: incident.summary,
      incidentId,
    });

    if (severity === 'critical' && !isConfidential) {
      await escalation.escalateCritical(escalationMessage);
      incident.escalated = true;
      incident.escalated_at = new Date().toISOString();
      incident.escalation_source = override ? 'keyword_override' : 'ai_critical';
    } else if (severity === 'urgent' && !isConfidential) {
      await escalation.scheduleUrgentEscalation({
        incidentId,
        guardPhone,
        site: resolvedSite,
        message: escalationMessage,
      });
    }

    if (aiResponse.intent === 'CANT_MAKE_SHIFT') {
      const triggered = await triggerShiftFill({
        guardPhone,
        guardName: guard.name,
        site: resolvedSite,
        reason: incident.summary,
      });
      incident.shiftfill_triggered = triggered;
    }

    await saveIncident(incident);

    const updatedHistory = [
      ...history,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: aiResponse.reply },
    ];

    await saveConversation(guardPhone, {
      site: resolvedSite,
      history: updatedHistory,
      active_incident_id: incidentId,
    });

    await twilioService.sendReply(guardPhone, aiResponse.reply);
    logger.info('Message handled', { guardPhone, intent: aiResponse.intent, severity, incidentId });

    return res.status(200).send('<Response></Response>');
  } catch (err) {
    logger.error('Webhook error', { error: err.message, stack: err.stack });
    return res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
