// Vercel serverless function — receives a "Careers" application and writes it
// to the Airtable "Career Enquires" table. Same setup as contact.js, uses the
// same AIRTABLE_TOKEN and AIRTABLE_BASE_ID already in Vercel.

const TABLE = 'Career Enquires';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!token || !baseId) { res.status(500).json({ error: 'Server not configured' }); return; }

  try {
    const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

    if (b.company_website) { res.status(200).json({ ok: true }); return; }

    const toArray = (v) => Array.isArray(v) ? v : (v ? [v] : []);

    const fields = {
      'Message: Tell us a little about yourself': b.coverMessage || '',
      'First Name': b.firstName || '',
      'Last Name': b.lastName || '',
      'Phone Number': b.phone || '',
      'Email address': b.email || '',
      'Best time to contact': toArray(b.bestTime),
      'Preferred contact method': toArray(b.contactMethod),
      'Extra Information': b.message || '',
      'Privacy Policy': !!b.privacyConsent,
      'Marketing': !!b.marketingConsent
    };

    const r = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(TABLE)}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields, typecast: true })
    });

    if (!r.ok) {
      const detail = await r.text();
      console.error('Airtable error', r.status, detail);
      res.status(502).json({ error: 'Airtable rejected the record', detail });
      return;
    }

    const created = await r.json();
    if (created.id && b.cv && b.cv.data) {
      const up = await fetch(`https://content.airtable.com/v0/${baseId}/${created.id}/${encodeURIComponent('Upload your CV')}/uploadAttachment`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: b.cv.type || 'application/octet-stream', filename: b.cv.name || 'cv', file: b.cv.data })
      });
      if (!up.ok) console.error('CV upload error', up.status, await up.text());
    }
    if (created.id) {
      await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(TABLE)}/${created.id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: { 'Ready': true } })
      });
    }
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Careers function error:', e);
    res.status(500).json({ error: 'Server error' });
  }
};