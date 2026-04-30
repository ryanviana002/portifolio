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

const LIMITE_DIA   = 30;  // semana 30, aumentar gradualmente
const LIMITE_MANHA = 15;
const LIMITE_TARDE = 15;
const DELAY_MIN_MS = 180_000;  // 3 min
const DELAY_MAX_MS = 600_000;  // 10 min

// ─── Variações da MSG_1 (anti-spam) ─────────────────────────────────────────
const MSGS_1 = [
  (nome) => `Oi! Sou o Ryan, faço sites para negócios locais. Vi a *${nome}* no Google Maps e já montei um rascunho pra vocês. Posso mandar?`,
  (nome) => `Oi, tudo bem? Sou o Ryan, faço sites profissionais. Encontrei a *${nome}* no Maps e preparei uma prévia — posso te mostrar?`,
  (nome) => `Olá! Ryan aqui, faço sites para negócios da região. Estava vendo a *${nome}* no Google e montei um exemplo pra vocês. Posso enviar?`,
  (nome) => `Oi! Vi a *${nome}* no Maps e já criei um modelo de site pra vocês. Sou o Ryan, faço isso pra negócios locais — posso mandar o link?`,
  (nome) => `Olá, tudo bem? Sou o Ryan. Encontrei a *${nome}* no Google Maps e montei um site de demonstração. Posso compartilhar pra ver o que acha?`,
  (nome) => `Oi! Sou o Ryan, faço sites pra negócios como o de vocês. Vi a *${nome}* no Google e já preparei algo — quer dar uma olhada?`,
];
function MSG_1(nome) {
  return MSGS_1[Math.floor(Math.random() * MSGS_1.length)](nome);
}

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

const CIDADES = [
  // Campinas (grid 3x3)
  { nome: 'Campinas SP',              pontos: [[-22.8600,-47.1000],[-22.8600,-47.0600],[-22.8600,-47.0200],[-22.9000,-47.1000],[-22.9000,-47.0600],[-22.9000,-47.0200],[-22.9400,-47.1000],[-22.9400,-47.0600],[-22.9400,-47.0200]] },
  // Cidades vizinhas (ponto central)
  { nome: 'Sumaré SP',                pontos: [[-22.8219,-47.2669]] },
  { nome: 'Hortolândia SP',           pontos: [[-22.8578,-47.2197]] },
  { nome: 'Santa Bárbara d\'Oeste SP',pontos: [[-22.7536,-47.4136]] },
  { nome: 'Americana SP',             pontos: [[-22.7386,-47.3319]] },
  { nome: 'Indaiatuba SP',            pontos: [[-23.0903,-47.2192]] },
  { nome: 'Valinhos SP',              pontos: [[-22.9703,-46.9961]] },
  { nome: 'Vinhedo SP',               pontos: [[-23.0297,-46.9753]] },
  { nome: 'Paulínia SP',              pontos: [[-22.7619,-47.1547]] },
  { nome: 'Nova Odessa SP',           pontos: [[-22.7811,-47.2986]] },
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
  const chamadas = CIDADES.flatMap(({ nome: cidade, pontos }) =>
    pontos.map(([lat, lng]) =>
      fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': PLACES_KEY,
          'X-Goog-FieldMask': CAMPO_MASK,
        },
        body: JSON.stringify({
          textQuery: `${categoria} ${cidade}`,
          languageCode: 'pt-BR',
          maxResultCount: 20,
          locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius: 2000 } },
        }),
      }).then(r => r.json()).then(d => d.places || []).catch(() => [])
    )
  );
  const todos = (await Promise.all(chamadas)).flat();
  const filtrados = todos.filter(p =>
    !temSiteProprio(p.websiteUri) &&
    p.businessStatus === 'OPERATIONAL' &&
    temWA(p.nationalPhoneNumber) &&
    (p.userRatingCount || 0) >= 25
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
async function setPresenca(numero, presence) {
  await fetch(`${EVOLUTION_URL}/chat/presence/${EVOLUTION_INST}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': EVOLUTION_KEY },
    body: JSON.stringify({ number: numero, presence }),
  }).catch(() => {});
}

async function enviarWA(numero, mensagem) {
  // Simula presença humana: online → digitando → envia
  await setPresenca(numero, 'available');
  await sleep(1000 + Math.random() * 2000);  // 1–3s online antes de digitar

  const tempoDigitando = Math.min(3000 + mensagem.length * 40, 12000);  // proporcional ao tamanho, máx 12s
  await setPresenca(numero, 'composing');
  await sleep(tempoDigitando);

  const r = await fetch(`${EVOLUTION_URL}/message/sendText/${EVOLUTION_INST}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': EVOLUTION_KEY },
    body: JSON.stringify({ number: numero, text: mensagem, delay: 0 }),
  });
  if (!r.ok) throw new Error(await r.text());

  await setPresenca(numero, 'paused');
  return r.json();
}

// ─── Contagem de disparos hoje ───────────────────────────────────────────────
async function contarDisparosHoje() {
  const hoje = new Date();
  hoje.setHours(0,0,0,0);
  const rows = await sbFetch(`/wa_prospects?sent1_at=gte.${hoje.toISOString()}&select=id`).catch(() => []);
  return Array.isArray(rows) ? rows.length : 0;
}

// ─── Contagem de disparos na última hora ─────────────────────────────────────
async function contarDisparosUltimaHora() {
  const umaHoraAtras = new Date(Date.now() - 60 * 60 * 1000);
  const rows = await sbFetch(`/wa_prospects?sent1_at=gte.${umaHoraAtras.toISOString()}&select=id`).catch(() => []);
  return Array.isArray(rows) ? rows.length : 0;
}

// ─── Expirar prospects sem resposta após 7 dias ───────────────────────────────
async function jobExpirarSemResposta() {
  const sete_dias_atras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const rows = await sbFetch(
    `/wa_prospects?status=in.(sent1,replied)&sent1_at=lte.${sete_dias_atras.toISOString()}&select=id,nome`
  ).catch(() => []);
  if (!rows?.length) return;
  for (const p of rows) {
    await sbFetch(`/wa_prospects?id=eq.${p.id}`, 'PATCH', {
      status: 'ignored', updated_at: new Date().toISOString(),
    }).catch(() => {});
  }
  console.log(`[expirar] ${rows.length} prospects sem resposta marcados como ignored.`);
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

    // Salva na fila SEM gerar site — usa INSERT puro (sem merge) para nunca sobrescrever contatos existentes
    await fetch(`${SUPABASE_URL}/rest/v1/wa_prospects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'resolution=ignore-duplicates,return=minimal',
      },
      body: JSON.stringify({
        id: p.id,
        nome: p.nome,
        categoria: p.categoria,
        wa_num: p.waNum,
        telefone: p.telefone,
        maps_url: p.mapsUrl,
        foto: p.foto,
        status: 'pending',
        updated_at: new Date().toISOString(),
      }),
    }).catch(err => console.error(`Erro ao salvar ${p.nome}:`, err.message));

    novos++;
  }

  console.log(`${novos} novos adicionados à fila.`);
}

const LIMITE_HORA   = 8;
const LIMITE_SEMANA = 150;
const MAX_RECUSAS_SEGUIDAS = 5;

// ─── Contagem de disparos na semana ──────────────────────────────────────────
async function contarDisparosSemana() {
  const seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const rows = await sbFetch(`/wa_prospects?sent1_at=gte.${seteDiasAtras.toISOString()}&select=id`).catch(() => []);
  return Array.isArray(rows) ? rows.length : 0;
}

// ─── Marcar mensagem como lida ────────────────────────────────────────────────
async function marcarComoLida(numero, messageId) {
  if (!messageId) return;
  await fetch(`${EVOLUTION_URL}/chat/markMessageAsRead/${EVOLUTION_INST}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': EVOLUTION_KEY },
    body: JSON.stringify({ readMessages: [{ id: messageId, fromMe: false, remoteJid: `${numero}@s.whatsapp.net` }] }),
  }).catch(() => {});
}

// ─── Verificar janela de silêncio (22h–08h BRT) ───────────────────────────────
function dentroJanelaEnvio() {
  const agora = new Date();
  const brt = new Date(agora.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  const hora = brt.getHours();
  return hora >= 8 && hora < 22;
}

// ─── Verificar recusas recentes (anti-ban) ────────────────────────────────────
async function recusasRecentes() {
  const umaHoraAtras = new Date(Date.now() - 60 * 60 * 1000);
  const rows = await sbFetch(
    `/wa_prospects?status=eq.ignored&updated_at=gte.${umaHoraAtras.toISOString()}&select=id`
  ).catch(() => []);
  return Array.isArray(rows) ? rows.length : 0;
}

// ─── Job: disparo WA (1º msg — apenas texto, sem site) ───────────────────────
async function jobDisparoLote(limite) {
  console.log(`[${new Date().toLocaleString('pt-BR')}] Disparando lote (${limite})...`);

  if (!dentroJanelaEnvio()) { console.log('Fora da janela de envio (22h–08h).'); return; }

  const [dispararHoje, dispararHora, dispararSemana] = await Promise.all([
    contarDisparosHoje(),
    contarDisparosUltimaHora(),
    contarDisparosSemana(),
  ]);

  if (dispararHoje  >= LIMITE_DIA)    { console.log('Limite diário atingido.'); return; }
  if (dispararHora  >= LIMITE_HORA)   { console.log('Limite por hora atingido.'); return; }
  if (dispararSemana >= LIMITE_SEMANA){ console.log('Limite semanal atingido.'); return; }

  const recusas = await recusasRecentes();
  if (recusas >= MAX_RECUSAS_SEGUIDAS) {
    await alertar(`Muitas recusas recentes (${recusas}) — disparo pausado automaticamente.`);
    console.log(`Muitas recusas (${recusas}), pausando.`);
    return;
  }

  const restantes = Math.min(limite, LIMITE_DIA - dispararHoje, LIMITE_HORA - dispararHora, LIMITE_SEMANA - dispararSemana);

  const pendentes = await sbFetch(
    `/wa_prospects?status=eq.pending&select=*&limit=${restantes}`
  ).catch(() => []);

  if (!pendentes?.length) { console.log('Sem prospects na fila.'); return; }

  // Filtra apenas DDDs da região (SP interior: 11-19, exceto 11=capital)
  const DDDS_VALIDOS = ['12','13','14','15','16','17','18','19'];
  const filtrados = pendentes.filter(p => {
    const ddd = p.wa_num.slice(2, 4);
    return DDDS_VALIDOS.includes(ddd);
  });

  console.log(`${filtrados.length} para disparar (${pendentes.length - filtrados.length} filtrados por DDD)`);

  // Marca DDDs inválidos como ignored
  for (const p of pendentes) {
    const ddd = p.wa_num.slice(2, 4);
    if (!DDDS_VALIDOS.includes(ddd)) {
      await sbFetch(`/wa_prospects?id=eq.${p.id}`, 'PATCH', { status: 'ignored', updated_at: new Date().toISOString() }).catch(() => {});
    }
  }

  for (const p of filtrados) {
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
      if (err.message.includes('exists":false') || err.message.includes('not exists')) {
        await sbFetch(`/wa_prospects?id=eq.${p.id}`, 'PATCH', {
          status: 'ignored', updated_at: new Date().toISOString(),
        }).catch(() => {});
        continue;
      }
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
// cron.schedule('30 10 * * 1-6', jobBuscar);
// cron.schedule('0 11 * * 1-6', () => { setTimeout(() => jobDisparoLote(LIMITE_MANHA), Math.floor(Math.random() * 20 * 60 * 1000)); });
// cron.schedule('0 16 * * 1-5', () => { setTimeout(() => jobDisparoLote(LIMITE_TARDE), Math.floor(Math.random() * 20 * 60 * 1000)); });
// cron.schedule('0 9 * * *', jobExpirarSemResposta);

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

      if (job === 'buscar') {
        // Busca é rápida — responde depois
        await jobBuscar();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, job }));
      } else if (job === 'disparar1') {
        // Dispara UMA mensagem e retorna — tenta até achar número válido
        const pendentes = await sbFetch('/wa_prospects?status=eq.pending&select=*&limit=10').catch(() => []);
        if (!pendentes?.length) {
          res.writeHead(200); res.end(JSON.stringify({ ok: true, done: true })); return;
        }
        let enviado = null;
        for (const p of pendentes) {
          try {
            await enviarWA(p.wa_num, MSG_1(p.nome));
            await sbFetch(`/wa_prospects?id=eq.${p.id}`, 'PATCH', {
              status: 'sent1', sent1_at: new Date().toISOString(), updated_at: new Date().toISOString(),
            });
            console.log(`✓ ${p.nome} (${p.wa_num})`);
            enviado = p;
            break;
          } catch (err) {
            // Número não existe no WA — ignora e tenta próximo
            console.log(`✗ ${p.nome} (${p.wa_num}): ${err.message}`);
            await sbFetch(`/wa_prospects?id=eq.${p.id}`, 'PATCH', {
              status: 'ignored', updated_at: new Date().toISOString(),
            }).catch(() => {});
          }
        }
        if (!enviado) {
          res.writeHead(200); res.end(JSON.stringify({ ok: true, done: true })); return;
        }
        res.writeHead(200); res.end(JSON.stringify({ ok: true, nome: enviado.nome }));
      } else {
        res.writeHead(200); res.end(JSON.stringify({ ok: true, job }));
        if (job === 'disparar') await jobDisparoLote(LIMITE_TARDE);
      }
    } catch (e) {
      console.error('HTTP trigger error:', e.message);
      res.writeHead(500); res.end(e.message);
    }
  });
}).listen(PORT, () => console.log(`  HTTP trigger: porta ${PORT}`));

console.log('🤖 RDCreator Worker iniciado');
console.log('  Busca:     07:30 BRT (seg-sab)');
console.log('  Manhã WA:  08:00–08:20 BRT (seg-sab) — 20 msgs');
console.log('  Tarde WA:  13:00–13:20 BRT (seg-sex) — 20 msgs  [sábado só manhã]');
console.log('  Expirar:   06:00 BRT (diário) — ignored após 7 dias sem resposta');
console.log('  Limite:    40/dia | 10/hora | Delay: 3–8min | Msgs variadas');
