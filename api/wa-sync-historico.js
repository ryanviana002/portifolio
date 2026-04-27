// Sincroniza histórico do localStorage para wa_prospects (status: done)
// POST /api/wa-sync-historico { itens: [{previewId, nome, categoria, waNum, createdAt}] }

const SUPABASE_URL = 'https://zivrekynlmznlyoyyrvg.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { itens } = req.body;
  if (!Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ error: 'itens obrigatório' });
  }

  let salvos = 0;
  let ignorados = 0;

  for (const h of itens) {
    if (!h.waNum) { ignorados++; continue; }

    const r = await fetch(`${SUPABASE_URL}/rest/v1/wa_prospects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'resolution=ignore-duplicates,return=minimal',
      },
      body: JSON.stringify({
        id: `hist-${h.previewId}`,
        nome: h.nome || 'Desconhecido',
        categoria: h.categoria || '',
        wa_num: h.waNum,
        status: 'done',
        preview_id: h.previewId,
        preview_url: h.link || null,
        created_at: h.createdAt ? new Date(h.createdAt).toISOString() : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    });

    if (r.ok) salvos++;
    else ignorados++;
  }

  return res.status(200).json({ salvos, ignorados });
}
