import cron from 'node-cron';
import http from 'http';

// ─── Configuração ────────────────────────────────────────────────────────────
const SUPABASE_URL   = process.env.SUPABASE_URL   || 'https://zivrekynlmznlyoyyrvg.supabase.co';
const SUPABASE_KEY   = process.env.SUPABASE_SERVICE_KEY;
const EVOLUTION_URL  = process.env.EVOLUTION_URL;
const EVOLUTION_KEY  = process.env.EVOLUTION_KEY;
const EVOLUTION_INST = process.env.EVOLUTION_INSTANCE || 'rdcreator';
const PLACES_KEY     = process.env.GOOGLE_PLACES_API_KEY;
const ALERT_NUM      = '5519992525515';

const CATEGORIAS = [
  'mecânica automotiva', 'oficina mecânica', 'salão de beleza', 'barbearia',
  'restaurante', 'lanchonete', 'pizzaria', 'padaria', 'pet shop',
  'academia', 'clínica médica', 'dentista', 'farmácia', 'mercado',
  'advocacia', 'imobiliária', 'escola', 'curso profissionalizante',
  'borracharia', 'elétrica automotiva', 'funilaria', 'vidraçaria',
  'serralheria', 'marcenaria', 'encanador', 'eletricista', 'pintura residencial',
];

const LIMITE_DIA   = 50;
const LIMITE_MANHA = 25;
const LIMITE_TARDE = 25;
const DELAY_MIN_MS = 60_000;
const DELAY_MAX_MS = 300_000;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function delayAleatorio() { return DELAY_MIN_MS + Math.floor(Math.random() * (DELAY_MAX_MS - DELAY_MIN_MS)); }
async function proximaCategoria() {
  // Busca qual índice foi usado por último no Supabase
  const rows = await sbFetch('/wa_config?select=valor&id=eq.categoria_idx').catch(() => []);
  const idx = rows?.[0]?.valor ? (parseInt(rows[0].valor) + 1) % CATEGORIAS.length : 0;
  await sbFetch('/wa_config?id=eq.categoria_idx', 'PATCH', { valor: String(idx), updated_at: new Date().toISOString() }).catch(async () => {
    await sbFetch('/wa_config', 'POST', { id: 'categoria_idx', valor: String(idx), updated_at: new Date().toISOString() }).catch(() => {});
  });
  return CATEGORIAS[idx];
}

async function sbFetch(path, method = 'GET', body) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': method === 'POST' ? 'resolution=merge-duplicates,return=representation' : 'return=minimal',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  if (!r.ok) throw new Error(text);
  try { return JSON.parse(text); } catch { return text; }
}

async function alertar(msg) {
  if (!EVOLUTION_URL || !EVOLUTION_KEY) return;
  fetch(`${EVOLUTION_URL}/message/sendText/${EVOLUTION_INST}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': EVOLUTION_KEY },
    body: JSON.stringify({ number: ALERT_NUM, text: `⚠️ RDCreator Worker\n${msg}`, delay: 1000 }),
  }).catch(() => {});
}

// ─── Google Places ───────────────────────────────────────────────────────────
const CAMPO_MASK = 'places.id,places.displayName,places.primaryTypeDisplayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.businessStatus,places.googleMapsUri,places.photos';
const NAO_E_SITE = ['instagram.com','facebook.com','fb.com','wa.me','whatsapp.com','linktr.ee','linktree.com','beacons.ai','bio.link','ifood.com.br','rappi.com','uber.com','booking.com','tripadvisor','twitter.com','x.com','tiktok.com','youtube.com','google.com/maps','maps.google.com','waze.com'];

const GRID_CAMPINAS = [
  [-22.8600,-47.1000],[-22.8600,-47.0600],[-22.8600,-47.0200],
  [-22.9000,-47.1000],[-22.9000,-47.0600],[-22.9000,-47.0200],
  [-22.9400,-47.1000],[-22.9400,-47.0600],[-22.9400,-47.0200],
];

function temSiteProprio(uri) {
  if (!uri) return false;
  return !NAO_E_SITE.some(d => uri.toLowerCase().includes(d));
}
function temWA(phone) {
  if (!phone) return false;
  const d = phone.replace(/\D/g,'');
  return d.length === 11 && d.slice(2).startsWith('9');
}

async function buscarProspects(categoria) {
  const chamadas = GRID_CAMPINAS.map(([lat, lng]) =>
    fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': PLACES_KEY,
        'X-Goog-FieldMask': CAMPO_MASK,
      },
      body: JSON.stringify({
        textQuery: `${categoria} Campinas SP`,
        languageCode: 'pt-BR',
        maxResultCount: 20,
        locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius: 700 } },
      }),
    }).then(r => r.json()).then(d => d.places || []).catch(() => [])
  );
  const todos = (await Promise.all(chamadas)).flat();
  const filtrados = todos.filter(p =>
    !temSiteProprio(p.websiteUri) &&
    p.businessStatus === 'OPERATIONAL' &&
    temWA(p.nationalPhoneNumber)
  );
  const vistos = new Set();
  return filtrados.filter(p => {
    const id = p.id?.replace(/^places\//, '') || p.id;
    if (vistos.has(id)) return false;
    vistos.add(id);
    return true;
  }).map(p => {
    const digits = p.nationalPhoneNumber.replace(/\D/g,'');
    const id = p.id?.replace(/^places\//, '') || p.id;
    return {
      id,
      nome: p.displayName?.text || '',
      categoria: p.primaryTypeDisplayName?.text || categoria,
      endereco: p.formattedAddress || '',
      telefone: p.nationalPhoneNumber || '',
      waNum: `55${digits}`,
      mapsUrl: p.googleMapsUri || `https://www.google.com/maps/place/?q=place_id:${id}`,
      foto: p.photos?.[0]?.name
        ? `https://places.googleapis.com/v1/${p.photos[0].name}/media?maxWidthPx=200&key=${PLACES_KEY}`
        : null,
    };
  });
}

async function prospectNovo(placeId, waNum) {
  const [byId, byNum] = await Promise.all([
    sbFetch(`/wa_prospects?id=eq.${placeId}&select=id`).catch(() => []),
    sbFetch(`/wa_prospects?wa_num=eq.${waNum}&select=id`).catch(() => []),
  ]);
  return (!byId || byId.length === 0) && (!byNum || byNum.length === 0);
}

// ─── Evolution API ───────────────────────────────────────────────────────────
const MSG_1 = (nome) =>
  `Olá! Aqui é o Ryan, desenvolvedor web da RDCreator. Vi a *${nome}* no Google Maps e estou montando algo pra vocês. Pode ser que goste — posso mandar?`;

async function enviarWA(numero, mensagem) {
  const r = await fetch(`${EVOLUTION_URL}/message/sendText/${EVOLUTION_INST}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': EVOLUTION_KEY },
    body: JSON.stringify({ number: numero, text: mensagem, delay: 2000 }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// ─── Contagem de disparos hoje ───────────────────────────────────────────────
async function contarDisparosHoje() {
  const hoje = new Date();
  hoje.setHours(0,0,0,0);
  const rows = await sbFetch(`/wa_prospects?sent1_at=gte.${hoje.toISOString()}&select=id`).catch(() => []);
  return Array.isArray(rows) ? rows.length : 0;
}

// ─── Job: busca prospects e enfileira (sem gerar site) ───────────────────────
async function jobBuscar() {
  console.log(`[${new Date().toLocaleString('pt-BR')}] Buscando prospects...`);

  const dispararHoje = await contarDisparosHoje();
  const vagas = LIMITE_DIA - dispararHoje;
  if (vagas <= 0) { console.log('Limite diário atingido.'); return; }

  const categoria = await proximaCategoria();
  console.log(`Categoria: ${categoria}`);

  let prospects;
  try {
    prospects = await buscarProspects(categoria);
  } catch (err) {
    console.error('Erro Places:', err.message);
    await alertar(`Erro Google Places API:\n${err.message}`);
    return;
  }

  console.log(`${prospects.length} encontrados`);

  let novos = 0;
  for (const p of prospects) {
    if (novos >= vagas * 2) break; // buffer 2x para ter fila suficiente
    if (!await prospectNovo(p.id, p.waNum)) continue;

    // Salva na fila SEM gerar site (preview_url = null)
    await sbFetch('/wa_prospects', 'POST', {
      id: p.id,
      nome: p.nome,
      categoria: p.categoria,
      wa_num: p.waNum,
      telefone: p.telefone,
      maps_url: p.mapsUrl,
      foto: p.foto,
      status: 'pending',
      updated_at: new Date().toISOString(),
    }).catch(err => console.error(`Erro ao salvar ${p.nome}:`, err.message));

    novos++;
  }

  console.log(`${novos} novos adicionados à fila.`);
}

// ─── Job: disparo WA (1º msg — apenas texto, sem site) ───────────────────────
async function jobDisparoLote(limite) {
  console.log(`[${new Date().toLocaleString('pt-BR')}] Disparando lote (${limite})...`);

  const dispararHoje = await contarDisparosHoje();
  const restantes = Math.min(limite, LIMITE_DIA - dispararHoje);
  if (restantes <= 0) { console.log('Limite diário atingido.'); return; }

  const pendentes = await sbFetch(
    `/wa_prospects?status=eq.pending&select=*&limit=${restantes}`
  ).catch(() => []);

  if (!pendentes?.length) { console.log('Sem prospects na fila.'); return; }

  console.log(`${pendentes.length} para disparar`);

  for (const p of pendentes) {
    try {
      await enviarWA(p.wa_num, MSG_1(p.nome));
      await sbFetch(`/wa_prospects?id=eq.${p.id}`, 'PATCH', {
        status: 'sent1',
        sent1_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      console.log(`✓ ${p.nome} (${p.wa_num})`);
    } catch (err) {
      console.error(`Erro WA ${p.nome}:`, err.message);
      if (err.message.includes('quota') || err.message.includes('rate')) {
        await alertar(`Evolution API rate limit:\n${err.message}`);
        break;
      }
    }
    const delay = delayAleatorio();
    console.log(`Aguardando ${Math.round(delay/1000)}s...`);
    await sleep(delay);
  }

  console.log('Lote finalizado.');
}

// ─── Agendamentos (UTC, Brasília = UTC-3) ────────────────────────────────────
// 07:30 BRT = 10:30 UTC
cron.schedule('30 10 * * 1-6', jobBuscar);

// 08:00 BRT = 11:00 UTC
cron.schedule('0 11 * * 1-6', () => jobDisparoLote(LIMITE_MANHA));

// 13:00 BRT = 16:00 UTC — hoje (primeira vez) roda às 17:37 UTC
cron.schedule('37 17 27 4 *', () => jobDisparoLote(LIMITE_TARDE)); // hoje 14:37 BRT
cron.schedule('0 16 * * 1-6', () => jobDisparoLote(LIMITE_TARDE)); // normal

// Servidor HTTP para triggers manuais
const PORT = process.env.PORT || 3000;
const TRIGGER_KEY = process.env.TRIGGER_KEY || 'familia1@';

http.createServer(async (req, res) => {
  if (req.method !== 'POST') { res.writeHead(405); res.end(); return; }

  let body = '';
  req.on('data', d => body += d);
  req.on('end', async () => {
    try {
      const { key, job } = JSON.parse(body);
      if (key !== TRIGGER_KEY) { res.writeHead(401); res.end('unauthorized'); return; }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, job }));
      if (job === 'buscar') await jobBuscar();
      if (job === 'disparar') await jobDisparoLote(LIMITE_TARDE);
    } catch (e) {
      res.writeHead(400); res.end(e.message);
    }
  });
}).listen(PORT, () => console.log(`  HTTP trigger: porta ${PORT}`));

console.log('🤖 RDCreator Worker iniciado');
console.log('  Busca:     07:30 BRT (seg-sab)');
console.log('  Manhã WA:  08:00 BRT (seg-sab)');
console.log('  Tarde WA:  13:00 BRT (seg-sab)');
