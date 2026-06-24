require('dotenv').config();

const base = `${process.env.SUPABASE_URL}/storage/v1/object/public/Documents-IGI/`;

function url(name) {
  return base + encodeURIComponent(name);
}

const updates = [
  { key: 'payroll', label: 'Payroll Calendar 2026', file: 'Payroll Calendar 2026.pdf' },
  { key: 'incident_report', label: 'Incident Reports & Engagement', file: ' Incident Reports & Engagement With Store Staff.pdf' },
  { key: 'trespass_notice', label: 'Lates and No-Shows Policy', file: 'Lates and No-Shows.pdf' },
  { key: 'site_contacts', label: 'Book Offs, Appointments & Emergency Absences', file: ' Book Offs, Appointments, and Emergency Absences.pdf' },
  { key: 'uniform_policy', label: 'Break Policy', file: 'Inbox - Reminder - Break Policy.pdf' },
];

const extras = [
  { key: 'timesheet', label: 'IGI Timesheet', file: 'IGI - Timesheet.pdf' },
  { key: 'report_template', label: 'Report Template', file: 'Document 8.docx' },
];

console.log('-- GuardLine document URLs for Documents-IGI bucket\n');

for (const { key, label, file } of updates) {
  console.log(`update documents set label = '${label.replace(/'/g, "''")}', url = '${url(file)}' where key = '${key}';`);
}

console.log('\n-- Optional: add extra documents');
for (const { key, label, file } of extras) {
  console.log(`insert into documents (key, label, url) values ('${key}', '${label.replace(/'/g, "''")}', '${url(file)}') on conflict (key) do update set label = excluded.label, url = excluded.url;`);
}
