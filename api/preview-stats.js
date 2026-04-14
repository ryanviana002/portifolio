const SUPABASE_URL = 'https://zivrekynlmznlyoyyrvg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppdnJla3lubG16bmx5b3l5cnZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MzE5ODgsImV4cCI6MjA5MTQwNzk4OH0.S05mkQ4iKZHFZT4HuTmDKOUwcYx1wJlL1hSELnschVE';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const ids = req.query.ids;
  if (!ids) return res.status(400).json({ error: 'IDs obrigatórios' });

  const idList = ids.split(',').filter(Boolean).slice(0, 50);
  const filter = idList.map(id => `"${id}"`).join(',');

  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/previews?id=in.(${filter})&select=id,views,expires_at`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    }
  );

  const data = await r.json();
  return res.status(200).json(data || []);
}
