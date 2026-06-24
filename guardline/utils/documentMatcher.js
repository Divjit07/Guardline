const DOCUMENT_TRIGGERS = [
  { key: 'payroll', patterns: ['payroll', 'pay calendar', 'pay schedule'] },
  { key: 'incident_report', patterns: ['incident report', 'engagement with store', 'store staff report'] },
  { key: 'report_template', patterns: ['report template', 'document 8', 'incident template', 'loss prevention report'] },
  { key: 'trespass_notice', patterns: ['trespass notice', 'ban notice', 'lates and no-shows', 'no-shows', 'late policy'] },
  { key: 'site_contacts', patterns: ['site contact', 'book off', 'appointment', 'emergency absence', 'time off'] },
  { key: 'uniform_policy', patterns: ['uniform policy', 'dress code', 'break policy'] },
  { key: 'timesheet', patterns: ['timesheet', 'time sheet'] },
];

function checkDocumentRequest(message) {
  const msg = message.toLowerCase();
  const sendIntent = /send me|send the|need the|get me|can you send|share the|want the|give me/.test(msg)
    || msg.includes('pdf')
    || msg.includes('.docx')
    || msg.includes('template');

  if (!sendIntent) return null;

  const keys = [];
  for (const { key, patterns } of DOCUMENT_TRIGGERS) {
    if (patterns.some((p) => msg.includes(p))) keys.push(key);
  }

  if (!keys.length) return null;
  return { intent: 'DOCUMENT_REQUEST', document_keys: keys, source: 'document_matcher' };
}

module.exports = { checkDocumentRequest };
