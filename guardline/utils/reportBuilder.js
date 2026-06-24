function generateIncidentId() {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 6);
  return `INC-${ts}-${rand}`.toUpperCase();
}

function buildEscalationMessage({ guardName, site, intent, summary, incidentId }) {
  return [
    `GUARDLINE ALERT [${intent}]`,
    `Guard: ${guardName}`,
    site ? `Site: ${site}` : null,
    summary ? `Summary: ${summary}` : null,
    `Incident: ${incidentId}`,
  ]
    .filter(Boolean)
    .join('\n');
}

function buildMorningSummary(incidents) {
  if (!incidents.length) return 'GuardLine overnight summary: No incidents in the last 12 hours.';

  const lines = incidents.map((inc, i) => {
    const time = new Date(inc.timestamp).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' });
    return `${i + 1}. [${time}] ${inc.intent} — ${inc.guard_name} @ ${inc.site_name || 'unknown site'}: ${inc.summary || 'No summary'}`;
  });

  return `GuardLine overnight summary (${incidents.length} incident${incidents.length === 1 ? '' : 's'}):\n\n${lines.join('\n')}`;
}

module.exports = { generateIncidentId, buildEscalationMessage, buildMorningSummary };
