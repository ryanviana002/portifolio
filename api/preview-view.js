const SUPABASE_URL = 'https://zivrekynlmznlyoyyrvg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppdnJla3lubG16bmx5b3l5cnZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MzE5ODgsImV4cCI6MjA5MTQwNzk4OH0.S05mkQ4iKZHFZT4HuTmDKOUwcYx1wJlL1hSELnschVE';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { id, skip } = req.query;
  if (!id) return res.status(400).json({ error: 'ID obrigatório' });

  const r = await fetch(`${SUPABASE_URL}/rest/v1/previews?id=eq.${id}&select=html,nome,categoria,expires_at,views`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });

  const data = await r.json();
  if (!data?.length) return res.status(404).json({ error: 'Prévia não encontrada' });

  const preview = data[0];
  if (preview.expires_at && new Date(preview.expires_at) < new Date()) {
    return res.status(410).json({ error: 'Prévia expirada. Gere uma nova em ryancreator.dev/preview' });
  }

  const novasViews = (preview.views || 0) + 1;

  // Incrementa views (silencioso se coluna não existir)
  fetch(`${SUPABASE_URL}/rest/v1/previews?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ views: novasViews }),
  }).catch(() => {});

  // Notifica Ryan no WA (não notifica se for o admin via ?skip=1)
  if (!skip) {
    const key = process.env.CALLMEBOT_KEY;
    console.log('[preview-view] CALLMEBOT_KEY:', key ? `${key.slice(0,3)}***` : 'AUSENTE');
    if (key) {
      const emoji = novasViews === 1 ? '👀' : '🔁';
      const msg = encodeURIComponent(`${emoji} Preview aberto! (${novasViews}x)\n*${preview.nome || 'Negócio'}*\nhttps://ryancreator.dev/r/${id}`);
      const waUrl = `https://api.callmebot.com/whatsapp.php?phone=5519994175385&text=${msg}&apikey=${key}`;
      console.log('[preview-view] WA URL:', waUrl.slice(0, 80));
      fetch(waUrl)
        .then(r => r.text())
        .then(t => console.log('[preview-view] CallMeBot response:', t.slice(0, 100)))
        .catch(e => console.log('[preview-view] CallMeBot error:', e.message));
    }
  }

  return res.status(200).json(preview);
}
