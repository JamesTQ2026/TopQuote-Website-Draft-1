// Vercel serverless function — receives a "Contact us" submission and writes it
// to the Airtable "Contact Enquiries" table.
//
// Setup (once, in Vercel → Project → Settings → Environment Variables):
//   AIRTABLE_TOKEN    = your Airtable Personal Access Token (scope: data.records:write)
//   AIRTABLE_BASE_ID  = appGpMbR2gOfx1VtN
// Never put the token in the code or in GitHub — it lives only in Vercel.

const TABLE = 'Contact Enquiries';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!token || !baseId) { res.status(500).json({ error: 'Server not configured' }); return; }

  try {
    const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

    // Honeypot: bots fill this hidden field. Accept silently, store nothing.
    if (b.company_website) { res.status(200).json({ ok: true }); return; }

    const toArray = (v) => Array.isArray(v) ? v : (v ? [v] : []);

    const fields = {
      'First name': b.firstName || '',
      'Last name': b.lastName || '',
      'Email': b.email || '',
      'Phone': b.phone || '',
      'Best time to call': toArray(b.bestTime),
      'Preferred contact method': toArray(b.contactMethod),
      'Message': b.message || '',
      'Privacy consent given': !!b.privacyConsent,
      'Marketing consent': !!b.marketingConsent,
      'Source form / page': b.source || 'Contact page'
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
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Contact function error:', e);
    res.status(500).json({ error: 'Server error' });
  }
};
