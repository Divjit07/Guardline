-- GuardLine document URLs — bucket: Documents-IGI
-- Run in Supabase SQL Editor after uploading files

update documents set label = 'Payroll Calendar 2026', url = 'https://qhskibcubylauegomfyj.supabase.co/storage/v1/object/public/Documents-IGI/Payroll%20Calendar%202026.pdf' where key = 'payroll';

update documents set label = 'Incident Reports & Engagement', url = 'https://qhskibcubylauegomfyj.supabase.co/storage/v1/object/public/Documents-IGI/%20Incident%20Reports%20%26%20Engagement%20With%20Store%20Staff.pdf' where key = 'incident_report';

update documents set label = 'Lates and No-Shows Policy', url = 'https://qhskibcubylauegomfyj.supabase.co/storage/v1/object/public/Documents-IGI/Lates%20and%20No-Shows.pdf' where key = 'trespass_notice';

update documents set label = 'Book Offs, Appointments & Emergency Absences', url = 'https://qhskibcubylauegomfyj.supabase.co/storage/v1/object/public/Documents-IGI/%20Book%20Offs%2C%20Appointments%2C%20and%20Emergency%20Absences.pdf' where key = 'site_contacts';

update documents set label = 'Break Policy', url = 'https://qhskibcubylauegomfyj.supabase.co/storage/v1/object/public/Documents-IGI/Inbox%20-%20Reminder%20-%20Break%20Policy.pdf' where key = 'uniform_policy';

-- Extra documents (optional — enables timesheet + docx requests)
insert into documents (key, label, url) values
  ('timesheet', 'IGI Timesheet', 'https://qhskibcubylauegomfyj.supabase.co/storage/v1/object/public/Documents-IGI/IGI%20-%20Timesheet.pdf'),
  ('report_template', 'Report Template', 'https://qhskibcubylauegomfyj.supabase.co/storage/v1/object/public/Documents-IGI/Report%20Template.docx')
on conflict (key) do update set label = excluded.label, url = excluded.url;
