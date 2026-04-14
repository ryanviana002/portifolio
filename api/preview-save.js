const SUPABASE_URL = 'https://zivrekynlmznlyoyyrvg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppdnJla3lubG16bmx5b3l5cnZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MzE5ODgsImV4cCI6MjA5MTQwNzk4OH0.S05mkQ4iKZHFZT4HuTmDKOUwcYx1wJlL1hSELnschVE';

function gerarId() {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

function injetarMarcaDagua(html) {
  const badge = `
<style>
#rdc-badge {
  position: fixed;
  bottom: 16px;
  left: 16px;
  background: rgba(10,10,18,0.85);
  border: 1px solid rgba(255,0,127,0.3);
  border-radius: 8px;
  padding: 6px 12px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 11px;
  color: rgba(255,255,255,0.5);
  z-index: 99998;
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  transition: border-color 0.2s;
}
#rdc-badge:hover { border-color: #ff007f; color: #fff; }
#rdc-badge span { color: #ff007f; font-weight: 700; }
</style>
<a id="rdc-badge" href="https://ryancreator.dev" target="_blank" rel="noreferrer">
  Criado por <span>RDCreator</span>
</a>`;

  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, `${badge}\n</body>`);
  }
  return html + badge;
}

async function notificarWA(nome, categoria, link) {
  const key = process.env.CALLMEBOT_KEY;
  if (!key) return;
  const msg = encodeURIComponent(`🚀 Preview gerado!\n*${nome}* (${categoria})\n${link}`);
  fetch(`https://api.callmebot.com/whatsapp.php?phone=5519992525515&text=${msg}&apikey=${key}`)
    .catch(() => {});
}

async function notificarSheets(nome, categoria, link) {
  const webhookUrl = process.env.SHEETS_WEBHOOK;
  if (!webhookUrl) return;
  fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, categoria, link, data: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) }),
  }).catch(() => {});
}


export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { html, nome, categoria, origem } = req.body;
  if (!html) return res.status(400).json({ error: 'HTML obrigatório' });

  const id = gerarId();
  const url = `https://ryancreator.dev/r/${id}`;
  const htmlFinal = injetarMarcaDagua(html);

  const r = await fetch(`${SUPABASE_URL}/rest/v1/previews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ id, html: htmlFinal, nome, categoria, views: 0 }),
  });

  if (!r.ok) {
    const err = await r.text();
    return res.status(500).json({ error: 'Erro ao salvar prévia: ' + err });
  }

  // Fire-and-forget: Sheets + WA (só se não for admin)
  notificarSheets(nome, categoria, url);
  if (origem !== 'admin') notificarWA(nome, categoria, url);

  return res.status(200).json({ id, url });
}
