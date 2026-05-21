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
const SHEETS_ID       = '1H9nNzoJUTIKd07eInNR7jSJUj-U5fNyZMzuRg_1Y5qY';
const LIDER_NUM       = '5519992734341';
const GOOGLE_API_KEY  = process.env.GOOGLE_API_KEY;
const MEMBERS_ID      = '1j-8XDi2N_5new-zuwnNmkl_-05Pnwry0mwl4N3WIoKc';
const MEMBERS_TAB     = 'Discipulos';
const MEMBERS_GID     = 0;
const G_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID;
const G_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const G_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

// Tier A+ — buscado todo dia (fecha rápido, carência digital alta)
const CATEGORIAS_AUTO = [
  'oficina mecânica',
  'centro automotivo',
  'ar condicionado automotivo',
  'funilaria e pintura',
  'auto elétrica',
  'mecânica diesel',
  'câmbio automático',
  'injeção eletrônica',
  'suspensão e freios',
];

// Tier A — rotação seg/qua/sex (ticket melhor ou menor concorrência digital)
const CATEGORIAS_AUTO_A = [
  'martelinho de ouro',
  'radiadores automotivos',
  'escapamento automotivo',
  'alinhamento e balanceamento',
  'estética automotiva',
  'detalhamento automotivo',
  'vitrificação automotiva',
  'retífica de motores',
  'vidraçaria automotiva',
  'tapeçaria automotiva',
  'película automotiva',
  'oficina de motos',
];


const LIMITE_DIA   = 30;  // semana 30, aumentar gradualmente
const LIMITE_MANHA = 15;
const LIMITE_TARDE = 15;
const DELAY_MIN_MS = 180_000;  // 3 min
const DELAY_MAX_MS = 600_000;  // 10 min

// ─── MSG_1 automotivo ─────────────────────────────────────────────────────────
function saudacao() {
  const h = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })).getHours();
  return h < 12 ? 'Bom dia' : 'Boa tarde';
}

const MSGS_1_AUTO = [
  (nome) => `${saudacao()}! Trabalhei no Google de uma oficina aqui da região e eles passaram a receber mais clientes das buscas. Tem interesse em ter o mesmo na ${nome}?`,
  (nome) => `${saudacao()}! Ajudei uma oficina aqui da região a aparecer melhor no Google e no Maps. Desde então eles recebem mais contatos de clientes novos. Tem interesse em ter o mesmo resultado aí na ${nome}?`,
  (nome) => `${saudacao()}! Sou o Ryan, trabalho com presença digital pra oficinas da região. Recentemente uma oficina aqui começou a aparecer na frente das buscas do Google e o movimento aumentou bastante. Tem interesse em ter o mesmo na ${nome}?`,
  (nome) => `${saudacao()}! Trabalho ajudando oficinas da região a aparecerem melhor nas buscas locais — site, perfil do Google, Maps. Uma que atendi recentemente aumentou bastante o contato de clientes novos. Tem interesse em ter o mesmo resultado na ${nome}?`,
  (nome) => `${saudacao()}! Atendi uma oficina aqui da região e eles passaram a receber mais clientes pelas buscas do Google e do Maps. Tem interesse em ter o mesmo resultado na ${nome}?`,
];


function eAutoMotivo(cat) {
  if (!cat) return false;
  const c = cat.toLowerCase();
  return [
    'mecân', 'oficina', 'elétrica auto', 'auto elétri', 'funilari', 'ar condicionado auto',
    'diesel', 'câmbio', 'injeção', 'suspensão', 'freio', 'martelinho', 'radiador',
    'escapamento', 'alinhamento', 'balanceamento', 'estética auto', 'detalhamento',
    'vitrificaç', 'retífica', 'tapeçaria auto', 'película auto', 'insulfilm',
    'vidraçaria auto', 'centro automotivo', 'auto center', 'moto',
  ].some(k => c.includes(k));
}

function MSG_1(nome) {
  return MSGS_1_AUTO[Math.floor(Math.random() * MSGS_1_AUTO.length)](nome);
}

// ─── MSG_3 follow-up (automotivo especialista / outros genérico) ──────────────
const MSGS_3_AUTO = [
  (nome) => `Oi *${nome}*! Passando rapidinho — sou especialista em sites pra mecânicas e oficinas. Meu portfólio: ryancreator.dev\n\nQualquer coisa é só chamar 👋`,
  (nome) => `Olá *${nome}*! Trabalho só com o setor automotivo — deixa o link aqui: ryancreator.dev\n\nSe fizer sentido no futuro pode me chamar 👋`,
  (nome) => `Oi! Deixa o portfólio aqui pra *${nome}*: ryancreator.dev — já fiz pra mecânicas e oficinas da região. Qualquer dúvida é só falar 👋`,
];
function MSG_3(nome) {
  return MSGS_3_AUTO[Math.floor(Math.random() * MSGS_3_AUTO.length)](nome);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function delayAleatorio() { return DELAY_MIN_MS + Math.floor(Math.random() * (DELAY_MAX_MS - DELAY_MIN_MS)); }
async function proximaCategoria(chave, lista) {
  const rows = await sbFetch(`/wa_config?select=valor&id=eq.${chave}`).catch(() => []);
  const idx = rows?.[0]?.valor ? (parseInt(rows[0].valor) + 1) % lista.length : 0;
  await sbFetch('/wa_config', 'POST', { id: chave, valor: String(idx), updated_at: new Date().toISOString() }).catch(() => {});
  return lista[idx];
}
const proximaCategoriaAutoA = () => proximaCategoria('auto_a_idx', CATEGORIAS_AUTO_A);

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
const CAMPO_MASK = 'places.id,places.displayName,places.primaryTypeDisplayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.businessStatus';
const NAO_E_SITE = ['instagram.com','facebook.com','fb.com','wa.me','whatsapp.com','linktr.ee','linktree.com','beacons.ai','bio.link','ifood.com.br','rappi.com','uber.com','booking.com','tripadvisor','twitter.com','x.com','tiktok.com','youtube.com','google.com/maps','maps.google.com','waze.com'];

// ─── Região de Campinas (buscada todo dia) ────────────────────────────────────
const CIDADES_LOCAL = [
  { nome: 'Campinas SP',               pontos: [[-22.8600,-47.1000],[-22.8600,-47.0600],[-22.8600,-47.0200],[-22.9000,-47.1000],[-22.9000,-47.0600],[-22.9000,-47.0200],[-22.9400,-47.1000],[-22.9400,-47.0600],[-22.9400,-47.0200]] },
  { nome: 'Sumaré SP',                 pontos: [[-22.8219,-47.2669]] },
  { nome: 'Hortolândia SP',            pontos: [[-22.8578,-47.2197]] },
  { nome: 'Santa Bárbara d\'Oeste SP', pontos: [[-22.7536,-47.4136]] },
  { nome: 'Americana SP',              pontos: [[-22.7386,-47.3319]] },
  { nome: 'Indaiatuba SP',             pontos: [[-23.0903,-47.2192]] },
  { nome: 'Valinhos SP',               pontos: [[-22.9703,-46.9961]] },
  { nome: 'Vinhedo SP',                pontos: [[-23.0297,-46.9753]] },
  { nome: 'Paulínia SP',               pontos: [[-22.7619,-47.1547]] },
  { nome: 'Nova Odessa SP',            pontos: [[-22.7811,-47.2986]] },
  { nome: 'Piracicaba SP',             pontos: [[-22.7253,-47.6492]] },
  { nome: 'Limeira SP',                pontos: [[-22.5647,-47.4014]] },
  { nome: 'Rio Claro SP',              pontos: [[-22.4149,-47.5651]] },
  { nome: 'Jundiaí SP',                pontos: [[-23.1864,-46.8836]] },
  { nome: 'Itatiba SP',                pontos: [[-23.0053,-46.8389]] },
  { nome: 'Araras SP',                 pontos: [[-22.3569,-47.3839]] },
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

async function buscarProspects(categoria, cidades) {
  const chamadas = cidades.flatMap(({ nome: cidade, pontos }) =>
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
    (p.userRatingCount || 0) >= 25 &&
    (p.rating || 0) >= 4.0
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
      rating: p.rating || null,
      reviewCount: p.userRatingCount || 0,
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

// ─── Follow-up após 3 dias sem resposta ──────────────────────────────────────
async function jobFollowUp() {
  console.log(`[${new Date().toLocaleString('pt-BR')}] Follow-up 3 dias...`);
  if (!dentroJanelaEnvio()) { console.log('Fora da janela.'); return; }

  const tresDiasAtras = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const prospects = await sbFetch(
    `/wa_prospects?status=eq.sent1&sent1_at=lte.${tresDiasAtras.toISOString()}&select=*&limit=10`
  ).catch(() => []);

  if (!prospects?.length) { console.log('Sem follow-ups pendentes.'); return; }

  for (const p of prospects) {
    // Ignora prospects não-automotivos que vieram de buscas antigas
    if (!eAutoMotivo(p.categoria)) {
      await sbFetch(`/wa_prospects?id=eq.${p.id}`, 'PATCH', { status: 'ignored', updated_at: new Date().toISOString() }).catch(() => {});
      continue;
    }
    try {
      await enviarWA(p.wa_num, MSG_3(p.nome, p.categoria));
      await sbFetch(`/wa_prospects?id=eq.${p.id}`, 'PATCH', {
        status: 'sent3',
        updated_at: new Date().toISOString(),
      });
      console.log(`[follow-up] ✓ ${p.nome}`);
    } catch (err) {
      console.error(`[follow-up] Erro ${p.nome}:`, err.message);
      if (err.message.includes('exists":false') || err.message.includes('not exists')) {
        await sbFetch(`/wa_prospects?id=eq.${p.id}`, 'PATCH', { status: 'ignored', updated_at: new Date().toISOString() }).catch(() => {});
      }
    }
    await sleep(delayAleatorio());
  }
  console.log('Follow-up finalizado.');
}

// ─── Expirar prospects sem resposta após 7 dias ───────────────────────────────
async function jobExpirarSemResposta() {
  const sete_dias_atras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const rows = await sbFetch(
    `/wa_prospects?status=in.(sent1,sent3,replied)&sent1_at=lte.${sete_dias_atras.toISOString()}&select=id,nome`
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

  // Rotaciona 3 categorias A+ por dia + 1 Tier A (seg/qua/sex)
  const rot1 = await proximaCategoria('auto_rot1', CATEGORIAS_AUTO);
  const idxRot1 = CATEGORIAS_AUTO.indexOf(rot1);
  const cat2 = CATEGORIAS_AUTO[(idxRot1 + 1) % CATEGORIAS_AUTO.length];
  const cat3 = CATEGORIAS_AUTO[(idxRot1 + 2) % CATEGORIAS_AUTO.length];
  const categoriasDia = [rot1, cat2, cat3];

  const brtBuscar = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  if ([1, 3, 5].includes(brtBuscar.getDay())) {
    const rotA = await proximaCategoriaAutoA();
    categoriasDia.push(rotA);
    console.log(`Categorias: ${categoriasDia.join(', ')}`);
  } else {
    console.log(`Categorias: ${categoriasDia.join(', ')}`);
  }

  async function buscarESalvar(cidades, limite) {
    let prospects = [];
    for (const categoria of categoriasDia) {
      try {
        const encontrados = await buscarProspects(categoria, cidades);
        prospects = prospects.concat(encontrados);
        console.log(`  ${categoria} (${cidades === CIDADES_LOCAL ? 'local' : 'SP'}): ${encontrados.length}`);
      } catch (err) {
        console.error(`Erro Places (${categoria}):`, err.message);
        await alertar(`Erro Google Places API (${categoria}):\n${err.message}`);
      }
    }
    // Deduplica por id
    const vistos = new Set();
    prospects = prospects.filter(p => { if (vistos.has(p.id)) return false; vistos.add(p.id); return true; });

    let novos = 0;
    for (const p of prospects) {
      if (novos >= limite) break;
      if (!await prospectNovo(p.id, p.waNum)) continue;
      await fetch(`${SUPABASE_URL}/rest/v1/wa_prospects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'resolution=ignore-duplicates,return=minimal',
        },
        body: JSON.stringify({
          id: p.id, nome: p.nome, categoria: p.categoria,
          wa_num: p.waNum, telefone: p.telefone, maps_url: p.mapsUrl,
          rating: p.rating, review_count: p.reviewCount,
          status: 'pending', updated_at: new Date().toISOString(),
        }),
      }).catch(err => console.error(`Erro ao salvar ${p.nome}:`, err.message));
      novos++;
    }
    return novos;
  }

  console.log('Buscando na região de Campinas...');
  const novos = await buscarESalvar(CIDADES_LOCAL, vagas * 2);
  console.log(`Total: ${novos} novos adicionados à fila.`);
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

  // Filtra DDDs e categorias não-automotivas
  const DDDS_VALIDOS = ['12','13','14','15','16','17','18','19'];
  const filtrados = pendentes.filter(p => DDDS_VALIDOS.includes(p.wa_num.slice(2, 4)) && eAutoMotivo(p.categoria));

  console.log(`${filtrados.length} para disparar (${pendentes.length - filtrados.length} filtrados por DDD/categoria)`);

  // Marca inválidos como ignored
  for (const p of pendentes) {
    if (!DDDS_VALIDOS.includes(p.wa_num.slice(2, 4)) || !eAutoMotivo(p.categoria)) {
      await sbFetch(`/wa_prospects?id=eq.${p.id}`, 'PATCH', { status: 'ignored', updated_at: new Date().toISOString() }).catch(() => {});
    }
  }

  for (const p of filtrados) {
    try {
      await enviarWA(p.wa_num, MSG_1(p.nome, p.categoria, p.rating, p.review_count));
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

// ─── Alerta para ligar quando sent2 fica 2 dias sem fechar ───────────────────
async function jobAlertarLigar() {
  const doisDiasAtras = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const prospects = await sbFetch(
    `/wa_prospects?status=eq.sent2&sent2_at=lte.${doisDiasAtras.toISOString()}&select=*`
  ).catch(() => []);

  if (!prospects?.length) return;

  for (const p of prospects) {
    await alertar(`📞 Hora de ligar!\n*${p.nome}*\nwa.me/${p.wa_num}\n\nRecebeu o portfólio há 2 dias sem fechar.`);
    await sbFetch(`/wa_prospects?id=eq.${p.id}`, 'PATCH', {
      status: 'aguardando_ryan',
      updated_at: new Date().toISOString(),
    }).catch(() => {});
    await sleep(2000);
  }

  console.log(`[alertar-ligar] ${prospects.length} alertas enviados.`);
}

// ─── OAuth2 + Helpers de membros ─────────────────────────────────────────────
async function getAccessToken() {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: G_CLIENT_ID, client_secret: G_CLIENT_SECRET,
      refresh_token: G_REFRESH_TOKEN, grant_type: 'refresh_token',
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('OAuth2 falhou: ' + JSON.stringify(data));
  return data.access_token;
}

function normNome(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z\s]/g, '').trim();
}
function normTel(s) { return (s || '').replace(/\D/g, '').slice(-8); }
function nomeMatch(a, b) {
  const na = normNome(a), nb = normNome(b);
  return na.split(' ').filter(p => p.length > 2).some(p => nb.includes(p)) ||
         nb.split(' ').filter(p => p.length > 2).some(p => na.includes(p));
}

async function lerFormsSabado(force) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_ID}/values/Respostas%20ao%20formul%C3%A1rio%201!A2:E?key=${GOOGLE_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  const rows = (await res.json()).values || [];
  let dataAlvo;
  if (force) {
    dataAlvo = rows.filter(r => r[0]).map(r => r[0].split(' ')[0]).pop();
  } else {
    const s = new Date(); s.setDate(s.getDate() - 2);
    dataAlvo = `${String(s.getDate()).padStart(2,'0')}/${String(s.getMonth()+1).padStart(2,'0')}/${s.getFullYear()}`;
  }
  return { rows: rows.filter(r => r[0] && r[0].split(' ')[0] === dataAlvo), dataAlvo };
}

// ─── Atualização de Membros ───────────────────────────────────────────────────
async function jobAtualizarMembros(force = false) {
  console.log('[membros] iniciando...');
  if (!G_CLIENT_ID || !G_CLIENT_SECRET || !G_REFRESH_TOKEN) { console.error('[membros] OAuth2 não configurado'); return; }
  if (!GOOGLE_API_KEY) { console.error('[membros] GOOGLE_API_KEY não configurado'); return; }

  const { rows: doSabado, dataAlvo } = await lerFormsSabado(force);
  if (!doSabado.length) { console.log('[membros] nenhum dado do sábado'); return; }
  console.log(`[membros] ${doSabado.length} presentes em ${dataAlvo}`);

  const token = await getAccessToken();
  const authHdr = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  // Lê membros + notas
  const mUrl = `https://sheets.googleapis.com/v4/spreadsheets/${MEMBERS_ID}?ranges=${encodeURIComponent(MEMBERS_TAB+'!A6:H')}&fields=sheets.data.rowData.values.userEnteredValue,sheets.data.rowData.values.note`;
  const mRes = await fetch(mUrl, { headers: authHdr });
  if (!mRes.ok) { console.error('[membros] erro leitura:', await mRes.text()); return; }
  const rowData = (await mRes.json()).sheets?.[0]?.data?.[0]?.rowData || [];

  const membros = rowData.map((row, i) => ({
    rowIndex: 5 + i,
    nome: row.values?.[2]?.userEnteredValue?.stringValue || '',
    tel:  String(row.values?.[3]?.userEnteredValue?.stringValue || row.values?.[3]?.userEnteredValue?.numberValue || ''),
    freq: row.values?.[5]?.userEnteredValue?.numberValue || 0,
    nota: row.values?.[5]?.note || '',
  })).filter(m => m.nome);

  const updates = [], novos = [];

  for (const form of doSabado) {
    const nomeForm = form[1] || '';
    const telForm  = (form[2] || '').replace(/\D/g, '');
    const temCadastro = (form[4] || '').toLowerCase().includes('sim');

    const match = membros.find(m =>
      normTel(m.tel) === normTel(telForm) && nomeMatch(nomeForm, m.nome)
    );

    if (match) {
      const novaFreq = (match.freq || 0) + 1;
      const novaNota = match.nota ? `${match.nota}\n${dataAlvo}` : dataAlvo;
      match.freq = novaFreq;
      updates.push({ updateCells: {
        rows: [{ values: [{ userEnteredValue: { numberValue: novaFreq }, note: novaNota }] }],
        fields: 'userEnteredValue,note',
        range: { sheetId: MEMBERS_GID, startRowIndex: match.rowIndex, endRowIndex: match.rowIndex+1, startColumnIndex: 5, endColumnIndex: 6 },
      }});
      console.log(`[membros] ✓ ${match.nome} → freq ${novaFreq}`);
    } else {
      novos.push(['', '', nomeForm, telForm, telForm ? `https://wa.me/55${telForm}` : '', 1, temCadastro ? 'SIM' : 'NÃO', '', '']);
      console.log(`[membros] + novo: ${nomeForm}`);
    }
  }

  if (updates.length) {
    const r = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${MEMBERS_ID}:batchUpdate`, {
      method: 'POST', headers: authHdr, body: JSON.stringify({ requests: updates }),
    });
    if (!r.ok) console.error('[membros] erro batchUpdate:', await r.text());
    else console.log(`[membros] ${updates.length} atualizado(s)`);
  }

  if (novos.length) {
    const r = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${MEMBERS_ID}/values/${encodeURIComponent(MEMBERS_TAB+'!A:H')}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
      method: 'POST', headers: authHdr, body: JSON.stringify({ values: novos }),
    });
    const rd = await r.json();
    if (!r.ok) { console.error('[membros] erro append:', JSON.stringify(rd)); }
    else {
      const firstRow = rd.updates?.updatedRange?.match(/(\d+):/)?.[1];
      if (firstRow) {
        const noteReqs = novos.map((_, i) => ({ updateCells: {
          rows: [{ values: [{ note: dataAlvo }] }], fields: 'note',
          range: { sheetId: MEMBERS_GID, startRowIndex: parseInt(firstRow)-1+i, endRowIndex: parseInt(firstRow)+i, startColumnIndex: 5, endColumnIndex: 6 },
        }}));
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${MEMBERS_ID}:batchUpdate`, {
          method: 'POST', headers: authHdr, body: JSON.stringify({ requests: noteReqs }),
        });
      }
      console.log(`[membros] ${novos.length} novo(s) adicionado(s)`);
    }
  }
  // Incrementa K5 (contador de encontros)
  const k5Res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${MEMBERS_ID}/values/${encodeURIComponent(MEMBERS_TAB+'!K5')}`, { headers: authHdr });
  const k5Data = await k5Res.json();
  const qtdAtual = parseInt(k5Data.values?.[0]?.[0] || '0') || 0;
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${MEMBERS_ID}/values/${encodeURIComponent(MEMBERS_TAB+'!K5')}?valueInputOption=RAW`, {
    method: 'PUT', headers: authHdr, body: JSON.stringify({ values: [[qtdAtual + 1]] }),
  });
  console.log(`[membros] encontros: ${qtdAtual} → ${qtdAtual + 1}`);

  console.log('[membros] concluído.');
}

// ─── Setup: Notas, Formatação, Filtro ────────────────────────────────────────
async function jobFixNotas() {
  console.log('[fix-notas] iniciando...');
  const formsRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_ID}/values/Respostas%20ao%20formul%C3%A1rio%201!A2:E?key=${GOOGLE_API_KEY}`);
  const formsRows = (await formsRes.json()).values || [];
  const historico = [];
  for (const row of formsRows) {
    const nome = row[1] || '', tel = (row[2] || '').replace(/\D/g, ''), data = (row[0] || '').split(' ')[0];
    if (!nome || !data) continue;
    const match = historico.find(p => normTel(p.tel) === normTel(tel) && nomeMatch(nome, p.nome));
    if (match) { if (!match.datas.includes(data)) match.datas.push(data); }
    else historico.push({ nome, tel, datas: [data] });
  }
  const token = await getAccessToken();
  const authHdr = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
  const mRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${MEMBERS_ID}?ranges=${encodeURIComponent(MEMBERS_TAB+'!A6:H')}&fields=sheets.data.rowData.values.userEnteredValue`, { headers: authHdr });
  const rowData = (await mRes.json()).sheets?.[0]?.data?.[0]?.rowData || [];
  const membros = rowData.map((row, i) => ({
    rowIndex: 5 + i,
    nome: row.values?.[2]?.userEnteredValue?.stringValue || '',
    tel:  String(row.values?.[3]?.userEnteredValue?.stringValue || row.values?.[3]?.userEnteredValue?.numberValue || ''),
  })).filter(m => m.nome);
  const requests = [];
  for (const membro of membros) {
    const h = historico.find(p => normTel(p.tel) === normTel(membro.tel) && nomeMatch(membro.nome, p.nome));
    if (!h) continue;
    requests.push({ updateCells: {
      rows: [{ values: [{ note: h.datas.sort().join('\n') }] }], fields: 'note',
      range: { sheetId: MEMBERS_GID, startRowIndex: membro.rowIndex, endRowIndex: membro.rowIndex+1, startColumnIndex: 5, endColumnIndex: 6 },
    }});
  }
  if (!requests.length) { console.log('[fix-notas] nenhuma nota para aplicar'); return; }
  const r = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${MEMBERS_ID}:batchUpdate`, { method: 'POST', headers: authHdr, body: JSON.stringify({ requests }) });
  if (!r.ok) console.error('[fix-notas] erro:', await r.text());
  else console.log(`[fix-notas] ✅ ${requests.length} notas aplicadas`);
}

async function jobSetupFormatacao() {
  console.log('[setup-formatacao] iniciando...');
  const token = await getAccessToken();
  const authHdr = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
  const range = { sheetId: MEMBERS_GID, startRowIndex: 5, endRowIndex: 1000, startColumnIndex: 6, endColumnIndex: 9 };
  const requests = [
    { addConditionalFormatRule: { rule: { ranges: [range], booleanRule: { condition: { type: 'TEXT_EQ', values: [{ userEnteredValue: 'Sim' }] }, format: { backgroundColor: { red: 0.204, green: 0.659, blue: 0.325 }, textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 } } } } }, index: 0 } },
    { addConditionalFormatRule: { rule: { ranges: [range], booleanRule: { condition: { type: 'TEXT_EQ', values: [{ userEnteredValue: 'Não' }] }, format: { backgroundColor: { red: 0.796, green: 0.196, blue: 0.196 }, textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 } } } } }, index: 1 } },
  ];
  const r = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${MEMBERS_ID}:batchUpdate`, { method: 'POST', headers: authHdr, body: JSON.stringify({ requests }) });
  if (!r.ok) console.error('[setup-formatacao] erro:', await r.text());
  else console.log('[setup-formatacao] ✅ Sim=verde, Não=vermelho aplicado');
}

async function jobSetupPlanilha() {
  console.log('[setup-planilha] iniciando...');
  const token = await getAccessToken();
  const authHdr = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
  const requests = [
    { setBasicFilter: { filter: { range: { sheetId: MEMBERS_GID, startRowIndex: 4, endRowIndex: 1000, startColumnIndex: 2, endColumnIndex: 9 } } } },
    { sortRange: { range: { sheetId: MEMBERS_GID, startRowIndex: 5, endRowIndex: 1000, startColumnIndex: 0, endColumnIndex: 9 }, sortSpecs: [{ dimensionIndex: 2, sortOrder: 'ASCENDING' }] } },
  ];
  const r = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${MEMBERS_ID}:batchUpdate`, { method: 'POST', headers: authHdr, body: JSON.stringify({ requests }) });
  if (!r.ok) console.error('[setup-planilha] erro:', await r.text());
  else console.log('[setup-planilha] ✅ Filtro e ordem alfabética aplicados');
}

// ─── Relatório de Presença ────────────────────────────────────────────────────
async function jobRelatorioPresenca(force = false) {
  console.log('[presenca] iniciando leitura do Sheets...');
  if (!GOOGLE_API_KEY) { console.error('[presenca] GOOGLE_API_KEY não configurado'); return; }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_ID}/values/Respostas%20ao%20formul%C3%A1rio%201!A2:E?key=${GOOGLE_API_KEY}`;
  const resp = await fetch(url);
  if (!resp.ok) { console.error('[presenca] erro Sheets API:', await resp.text()); return; }
  const data = await resp.json();

  const rows = data.values || [];
  if (!rows.length) { console.log('[presenca] planilha vazia'); return; }

  // Data do encontro: segunda - 2 = sábado; force = data mais recente da planilha
  let dataAlvo;
  if (force) {
    const datas = rows.filter(r => r[0]).map(r => r[0].split(' ')[0]);
    dataAlvo = datas[datas.length - 1];
    console.log('[presenca] force — data mais recente:', dataAlvo);
  } else {
    const sabado = new Date();
    sabado.setDate(sabado.getDate() - 2);
    dataAlvo = `${String(sabado.getDate()).padStart(2, '0')}/${String(sabado.getMonth() + 1).padStart(2, '0')}/${sabado.getFullYear()}`;
  }

  const doUltimoEncontro = rows.filter(r => r[0] && r[0].split(' ')[0] === dataAlvo);

  if (!doUltimoEncontro.length) {
    console.log('[presenca] nenhum dado da última sexta — nada enviado');
    return;
  }

  // Filtrar quem não tem cadastro (col E = "Não")
const semCadastro = doUltimoEncontro.filter(r => {
  const temCadastro = (r[4] || '').toLowerCase();
  const primeiraVez = (r[3] || '').toLowerCase();

  const naoTemCadastro =
    temCadastro.includes('não') ||
    temCadastro.includes('nao') ||
    temCadastro === '';

  const ehPrimeiraVez =
    primeiraVez.includes('sim');

  return naoTemCadastro || ehPrimeiraVez;
});

  if (!semCadastro.length) {
    console.log('[presenca] todos têm cadastro — nenhuma mensagem enviada');
    return;
  }

  const linhas = semCadastro.map(r => {
    const nome        = r[1] || 'Sem nome';
    const numero      = (r[2] || '').replace(/\D/g, '');
    const primeiraVez = (r[3] || '').toLowerCase().includes('sim');
    const temCadastro = !((r[4] || '').toLowerCase().includes('não') || (r[4] || '').toLowerCase().includes('nao') || r[4] === '');
    let status;
    if (primeiraVez && !temCadastro) status = 'Primeira vez e não tem cadastro';
    else if (primeiraVez)            status = 'Primeira vez';
    else                             status = 'Não tem cadastro';
    return `• *${nome}*\n  ${numero || 'sem número'} — ${status}`;
  });

  const mensagem = `📋 *Hangout — ${dataAlvo}*\n\n${linhas.join('\n\n')}`;

  if (!EVOLUTION_URL || !EVOLUTION_KEY) { console.error('[presenca] EVOLUTION_URL/KEY não configurados'); return; }

  await fetch(`${EVOLUTION_URL}/message/sendText/${EVOLUTION_INST}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': EVOLUTION_KEY },
    body: JSON.stringify({ number: LIDER_NUM, text: mensagem, delay: 500 }),
  });

  console.log(`[presenca] relatório enviado — ${semCadastro.length} pessoa(s) sem cadastro`);
}

// ─── Agendamentos (UTC, Brasília = UTC-3) ────────────────────────────────────
cron.schedule('0 15 * * 1', jobRelatorioPresenca);   // seg 12h BRT
cron.schedule('15 15 * * 1', jobAtualizarMembros);   // seg 12h15 BRT
cron.schedule('30 10 * * 1-6', jobBuscar);
cron.schedule('0 11 * * 1-6', () => { setTimeout(() => jobDisparoLote(LIMITE_MANHA), Math.floor(Math.random() * 20 * 60 * 1000)); });
cron.schedule('0 16 * * 1-5', () => { setTimeout(() => jobDisparoLote(LIMITE_TARDE), Math.floor(Math.random() * 20 * 60 * 1000)); });
// follow-up desativado
cron.schedule('0 9 * * *', jobExpirarSemResposta);

// Servidor HTTP para triggers manuais
const PORT = process.env.PORT || 3000;
const TRIGGER_KEY = process.env.TRIGGER_KEY || 'familia1@';

http.createServer(async (req, res) => {
  if (req.method !== 'POST') { res.writeHead(405); res.end(); return; }

  let body = '';
  req.on('data', d => body += d);
  req.on('end', async () => {
    try {
      const payload = JSON.parse(body);
      const { key, job } = payload;
      if (key !== TRIGGER_KEY) { res.writeHead(401); res.end('unauthorized'); return; }

      if (job === 'responder') {
        const { waNum, mensagem, simularLeitura } = payload;
        if (!waNum || !mensagem) { res.writeHead(400); res.end('missing params'); return; }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
        // Railway é long-running — delay roda em background após responder
        enviarWA(waNum, mensagem, { simularLeitura: simularLeitura || false })
          .catch(err => console.error(`[responder] ${waNum}:`, err.message));
        return;
      } else if (job === 'buscar') {
        // Busca é rápida — responde depois
        await jobBuscar();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, job }));
      } else if (job === 'disparar1') {
        // Responde imediatamente — disparo roda em background com delays
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
        const DDDS_VALIDOS = ['12','13','14','15','16','17','18','19'];
        (async () => {
          const pendentes = await sbFetch('/wa_prospects?status=eq.pending&select=*&limit=20').catch(() => []);
          const filtrados = (pendentes || []).filter(p => DDDS_VALIDOS.includes(p.wa_num.slice(2, 4)) && eAutoMotivo(p.categoria));
          for (const p of filtrados) {
            try {
              await enviarWA(p.wa_num, MSG_1(p.nome, p.categoria, p.rating, p.review_count));
              await sbFetch(`/wa_prospects?id=eq.${p.id}`, 'PATCH', {
                status: 'sent1', sent1_at: new Date().toISOString(), updated_at: new Date().toISOString(),
              });
              console.log(`✓ ${p.nome} (${p.wa_num})`);
              break;
            } catch (err) {
              console.log(`✗ ${p.nome} (${p.wa_num}): ${err.message}`);
              await sbFetch(`/wa_prospects?id=eq.${p.id}`, 'PATCH', {
                status: 'ignored', updated_at: new Date().toISOString(),
              }).catch(() => {});
            }
          }
        })().catch(err => console.error('[disparar1]', err.message));
        return;
      } else if (job === 'membros') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, job }));
        jobAtualizarMembros(payload.force === true).catch(err => console.error('[membros]', err.message));
      } else if (job === 'fix-notas') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, job }));
        jobFixNotas().catch(err => console.error('[fix-notas]', err.message));
      } else if (job === 'setup-formatacao') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, job }));
        jobSetupFormatacao().catch(err => console.error('[setup-formatacao]', err.message));
      } else if (job === 'setup-planilha') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, job }));
        jobSetupPlanilha().catch(err => console.error('[setup-planilha]', err.message));
      } else if (job === 'presenca') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, job }));
        jobRelatorioPresenca(payload.force === true).catch(err => console.error('[presenca]', err.message));
      } else {
        res.writeHead(200); res.end(JSON.stringify({ ok: true, job }));
        if (job === 'disparar') jobDisparoLote(LIMITE_TARDE).catch(err => console.error('[disparar]', err.message));
      }
    } catch (e) {
      console.error('HTTP trigger error:', e.message);
      res.writeHead(500); res.end(e.message);
    }
  });
}).listen(PORT, () => console.log(`  HTTP trigger: porta ${PORT}`));

// ─── Startup: recupera jobs perdidos por redeploy ─────────────────────────────
(async () => {
  await new Promise(r => setTimeout(r, 5000));
  if (!dentroJanelaEnvio()) return;

  const hoje = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  const chaveHoje = `buscar_${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}-${String(hoje.getDate()).padStart(2,'0')}`;

  const jaRodou = await sbFetch(`/wa_config?select=id&id=eq.${chaveHoje}`).catch(() => []);
  if (jaRodou?.length) { console.log('[startup] busca já rodou hoje — pulando.'); return; }

  // Marca como rodado ANTES de executar — evita duplo disparo em redeploys simultâneos
  await sbFetch('/wa_config', 'POST', { id: chaveHoje, valor: '1', updated_at: new Date().toISOString() }).catch(() => {});

  console.log('[startup] busca não rodou hoje — executando...');
  await jobBuscar().catch(err => console.error('[startup] buscar:', err.message));

  const disparosHoje = await contarDisparosHoje().catch(() => 0);
  if (disparosHoje === 0) {
    console.log('[startup] disparo não rodou hoje — executando...');
    jobDisparoLote(LIMITE_MANHA).catch(err => console.error('[startup] disparo:', err.message));
  }
})();

console.log('🤖 RDCreator Worker iniciado');
console.log('  Busca:     07:30 BRT (seg-sab)');
console.log('  Manhã WA:  08:00–08:20 BRT (seg-sab) — 20 msgs');
console.log('  Tarde WA:  13:00–13:20 BRT (seg-sex) — 20 msgs  [sábado só manhã]');
console.log('  Expirar:   06:00 BRT (diário) — ignored após 7 dias sem resposta');
console.log('  Limite:    40/dia | 10/hora | Delay: 3–8min | Msgs variadas');

