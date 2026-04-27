// Dispara jobs do worker manualmente — repassa para o worker Railway
// POST /api/wa-trigger { senha, job: 'buscar' | 'disparar' }

const WORKER_URL = process.env.WORKER_URL;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { senha, job } = req.body;
  if (senha !== 'familia1@') return res.status(401).json({ error: 'Não autorizado' });
  if (!WORKER_URL) return res.status(500).json({ error: 'WORKER_URL não configurada' });

  const jobReal = job === 'disparar' ? 'disparar1' : job;

  try {
    const r = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'familia1@', job: jobReal }),
    });
    const data = await r.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
