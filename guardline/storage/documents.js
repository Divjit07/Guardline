const supabase = require('./supabase');

const BUCKET = 'Documents-IGI';

// Exact filenames in Supabase Storage (including leading spaces where present)
const KEY_TO_FILE = {
  payroll: 'Payroll Calendar 2026.pdf',
  incident_report: ' Incident Reports & Engagement With Store Staff.pdf',
  report_template: 'Report Template.docx',
  trespass_notice: 'Lates and No-Shows.pdf',
  site_contacts: ' Book Offs, Appointments, and Emergency Absences.pdf',
  uniform_policy: 'Inbox - Reminder - Break Policy.pdf',
  timesheet: 'IGI - Timesheet.pdf',
};

async function getDocument(key) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('key', key)
    .eq('active', true)
    .maybeSingle();
  if (error) console.error('[documents] get error:', error.message);
  return data;
}

async function getDocumentMediaUrl(key) {
  const doc = await getDocument(key);
  if (!doc) return null;

  const filePath = KEY_TO_FILE[key];
  if (!filePath) return doc;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(filePath, 3600);

  if (error || !data?.signedUrl) {
    console.error('[documents] signed URL failed:', error?.message, key);
    return doc;
  }

  return { ...doc, url: data.signedUrl };
}

module.exports = { getDocument, getDocumentMediaUrl };
