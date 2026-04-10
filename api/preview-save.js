const SUPABASE_URL = 'https://zivrekynlmznlyoyyrvg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppdnJla3lubG16bmx5b3l5cnZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MzE5ODgsImV4cCI6MjA5MTQwNzk4OH0.S05mkQ4iKZHFZT4HuTmDKOUwcYx1wJlL1hSELnschVE';

function gerarId() {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { html, nome, categoria } = req.body;
  if (!html) return res.status(400).json({ error: 'HTML obrigatório' });

  const id = gerarId();

  const r = await fetch(`${SUPABASE_URL}/rest/v1/previews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ id, html, nome, categoria }),
  });

  if (!r.ok) {
    const err = await r.text();
    return res.status(500).json({ error: 'Erro ao salvar prévia: ' + err });
  }

  return res.status(200).json({ id, url: `https://ryancreator.dev/r/${id}` });
}
