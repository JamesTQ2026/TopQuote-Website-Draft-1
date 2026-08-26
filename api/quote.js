// Vercel serverless function — receives a completed "Get a Quote" submission and
// writes it to the Airtable "Quote Requests" table.
//
// Setup (once, in Vercel → Project → Settings → Environment Variables):
//   AIRTABLE_TOKEN    = your Airtable Personal Access Token (scope: data.records:write)
//   AIRTABLE_BASE_ID  = appGpMbR2gOfx1VtN
// Never put the token in the code or in GitHub — it lives only in Vercel.

const TABLE = 'Quote Requests';
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const label = (v, m) => m[v] || '';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!token || !baseId) { res.status(500).json({ error: 'Server not configured' }); return; }

  try {
    const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

    // Day + month-name + year  ->  YYYY-MM-DD for the Airtable date field.
    let dob = '';
    const mi = MONTHS.indexOf(b.dobM);
    if (b.dobD && mi >= 0 && b.dobY) {
      dob = `${b.dobY}-${String(mi + 1).padStart(2, '0')}-${String(parseInt(b.dobD, 10)).padStart(2, '0')}`;
    }

    const fields = {
      'Full name': [b.first, b.last].filter(Boolean).join(' '),
      'Title': b.title || '',
      'Email': b.email || '',
      'Phone': b.phone || '',
      'Quotes for': label(b.quotesFor, { single: 'Just me', couple: 'Me and my partner' }),
      'What to cover': label(b.cover, { family: 'My family', mortgage: 'My mortgage', both: 'Both' }),
      'Has children': label(b.children, { 'kids-yes': 'Yes', 'kids-no': 'No' }),
      'Smoked / used nicotine in last 12 months': label(b.smoker, { yes: 'Yes', no: 'No' }),
      'Diagnosed heart condition': label(b.heart, { 'heart-yes': 'Yes', 'heart-no': 'No' }),
      'Cover amount': b.amount || '',
      'Cover term': b.term || '',
      'Marketing opt-in': !!b.marketingOptIn,
      'Privacy consent given': !!b.privacyConsent,
      'Terms consent given': !!b.termsConsent
    };
    if (dob) fields['Date of birth'] = dob;

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
    console.error('Quote function error:', e);
    res.status(500).json({ error: 'Server error' });
  }
};
