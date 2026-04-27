// Dispara jobs do worker manualmente
// POST /api/wa-trigger { senha, job: 'buscar' | 'disparar' }

const WORKER_URL = process.env.WORKER_URL;
const SUPABASE_URL = 'https://zivrekynlmznlyoyyrvg.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const PLACES_KEY = process.env.GOOGLE_PLACES_API_KEY;
const EVOLUTION_URL = process.env.EVOLUTION_URL;
const EVOLUTION_KEY = process.env.EVOLUTION_KEY;
const EVOLUTION_INST = process.env.EVOLUTION_INSTANCE || 'rdcreator';

const LIMITE = 25;
const DELAY_MIN_MS = 60_000;
const DELAY_MAX_MS = 300_000;

const CATEGORIAS = [
  'mecânica automotiva', 'oficina mecânica', 'salão de beleza', 'barbearia',
  'restaurante', 'lanchonete', 'pizzaria', 'padaria', 'pet shop',
  'academia', 'clínica médica', 'dentista', 'farmácia', 'mercado',
  'advocacia', 'imobiliária', 'escola', 'curso profissionalizante',
  'borracharia', 'elétrica automotiva', 'funilaria', 'vidraçaria',
  'serralheria', 'marcenaria', 'encanador', 'eletricista', 'pintura residencial',
];

const GRID_CAMPINAS = [
  [-22.8600,-47.1000],[-22.8600,-47.0600],[-22.8600,-47.0200],
  [-22.9000,-47.1000],[-22.9000,-47.0600],[-22.9000,-47.0200],
  [-22.9400,-47.1000],[-22.9400,-47.0600],[-22.9400,-47.0200],
];

const NAO_E_SITE = ['instagram.com','facebook.com','fb.com','wa.me','whatsapp.com','linktr.ee','linktree.com','beacons.ai','bio.link','ifood.com.br','rappi.com','uber.com','booking.com','tripadvisor','twitter.com','x.com','tiktok.com','youtube.com','google.com/maps','maps.google.com','waze.com'];
const CAMPO_MASK = 'places.id,places.displayName,places.primaryTypeDisplayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.businessStatus,places.googleMapsUri,places.photos';

function temSiteProprio(uri) {
  if (!uri) return false;
  return !NAO_E_SITE.some(d => uri.toLowerCase().includes(d));
}
function temWA(phone) {
  if (!phone) return false;
  const d = phone.replace(/\D/g,'');
  return d.length === 11 && d.slice(2).startsWith('9');
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function delayAleatorio() { return DELAY_MIN_MS + Math.floor(Math.random() * (DELAY_MAX_MS - DELAY_MIN_MS)); }

async function sbFetch(path, method = 'GET', body) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': method === 'POST' ? 'resolution=merge-duplicates,return=minimal' : 'return=minimal',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  if (!r.ok) throw new Error(text);
  try { return JSON.parse(text); } catch { return text; }
}

async function buscarProspects(categoria) {
  const chamadas = GRID_CAMPINAS.map(([lat, lng]) =>
    fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': PLACES_KEY, 'X-Goog-FieldMask': CAMPO_MASK },
      body: JSON.stringify({ textQuery: `${categoria} Campinas SP`, languageCode: 'pt-BR', maxResultCount: 20, locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius: 700 } } }),
    }).then(r => r.json()).then(d => d.places || []).catch(() => [])
  );
  const todos = (await Promise.all(chamadas)).flat();
  const filtrados = todos.filter(p => !temSiteProprio(p.websiteUri) && p.businessStatus === 'OPERATIONAL' && temWA(p.nationalPhoneNumber));
  const vistos = new Set();
  return filtrados.filter(p => { const id = p.id?.replace(/^places\//,''); if (vistos.has(id)) return false; vistos.add(id); return true; }).map(p => {
    const digits = p.nationalPhoneNumber.replace(/\D/g,'');
    const id = p.id?.replace(/^places\//,'') || p.id;
    return { id, nome: p.displayName?.text || '', categoria: p.primaryTypeDisplayName?.text || categoria, telefone: p.nationalPhoneNumber || '', waNum: `55${digits}`, mapsUrl: p.googleMapsUri || `https://www.google.com/maps/place/?q=place_id:${id}`, foto: p.photos?.[0]?.name ? `https://places.googleapis.com/v1/${p.photos[0].name}/media?maxWidthPx=200&key=${PLACES_KEY}` : null };
  });
}

async function prospectNovo(placeId, waNum) {
  const [byId, byNum] = await Promise.all([
    sbFetch(`/wa_prospects?id=eq.${placeId}&select=id`).catch(() => []),
    sbFetch(`/wa_prospects?wa_num=eq.${waNum}&select=id`).catch(() => []),
  ]);
  return (!byId || byId.length === 0) && (!byNum || byNum.length === 0);
}

const MSG_1 = (nome) => `Olá! Aqui é o Ryan, desenvolvedor web da RDCreator. Vi a *${nome}* no Google Maps e estou montando algo pra vocês. Pode ser que goste — posso mandar?`;

async function enviarWA(numero, mensagem) {
  const r = await fetch(`${EVOLUTION_URL}/message/sendText/${EVOLUTION_INST}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': EVOLUTION_KEY },
    body: JSON.stringify({ number: numero, text: mensagem, delay: 2000 }),
  });
  if (!r.ok) throw new Error(await r.text());
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { senha, job } = req.body;
  if (senha !== 'familia1@') return res.status(401).json({ error: 'Não autorizado' });

  // Responde imediatamente e processa em background
  res.status(200).json({ ok: true, job, iniciado: true });

  if (job === 'buscar') {
    const categoria = CATEGORIAS[Math.floor(Math.random() * CATEGORIAS.length)];
    const prospects = await buscarProspects(categoria).catch(() => []);
    let novos = 0;
    for (const p of prospects) {
      if (novos >= LIMITE * 2) break;
      if (!await prospectNovo(p.id, p.waNum)) continue;
      await sbFetch('/wa_prospects', 'POST', {
        id: p.id, nome: p.nome, categoria: p.categoria, wa_num: p.waNum,
        telefone: p.telefone, maps_url: p.mapsUrl, foto: p.foto,
        status: 'pending', updated_at: new Date().toISOString(),
      }).catch(() => {});
      novos++;
    }
  }

  if (job === 'disparar') {
    const pendentes = await sbFetch(`/wa_prospects?status=eq.pending&select=*&limit=${LIMITE}`).catch(() => []);
    for (const p of pendentes) {
      try {
        await enviarWA(p.wa_num, MSG_1(p.nome));
        await sbFetch(`/wa_prospects?id=eq.${p.id}`, 'PATCH', { status: 'sent1', sent1_at: new Date().toISOString(), updated_at: new Date().toISOString() });
      } catch {}
      await sleep(delayAleatorio());
    }
  }
}
