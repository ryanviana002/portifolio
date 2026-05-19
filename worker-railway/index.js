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
const SHEETS_ID      = '1H9nNzoJUTIKd07eInNR7jSJUj-U5fNyZMzuRg_1Y5qY';
const LIDER_NUM      = '5519992734341';
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

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
const MSGS_1_AUTO = [
  // 1. Concorrente com nota menor aparece antes
  (nome, r, rv) => `Oi! Vi a *${nome}* no Google agora — ${r}⭐ com ${rv} avaliações, reputação muito boa 👏\n\nSou o Ryan, trabalho com presença digital para oficinas aqui da região.\n\nPercebi que algumas oficinas com nota menor aparecem antes de vocês nas buscas por terem o perfil mais ativo e estruturado. Isso faz muita diferença na hora que o cliente escolhe pra onde vai levar o carro.\n\nQuer que eu te mostre o que dá pra melhorar?`,
  // 2. Cliente decidindo pelo celular agora
  (nome, r, rv) => `Oi! Pesquisei oficinas aqui da região e a *${nome}* apareceu com ${r}⭐ e ${rv} avaliações.\n\nSou o Ryan, ajudo oficinas a aparecerem melhor no Google e gerar mais contato pelo WhatsApp.\n\nHoje a maioria das pessoas escolhe a oficina direto pelo celular — quem aparece primeiro e passa mais confiança leva o cliente. Com algumas mudanças no perfil do Google dá pra mudar isso bastante.\n\nPosso te mostrar alguns pontos?`,
  // 3. Reputação forte não sendo convertida
  (nome, r, rv) => `Oi! A *${nome}* tem ${rv} avaliações e ${r}⭐ no Google — esse nível de reputação é raro.\n\nMeu nome é Ryan, trabalho com presença digital só pra oficinas e centros automotivos.\n\nO problema é que muita gente pesquisa "oficina perto de mim" e acaba escolhendo outra — não porque é melhor, mas porque aparece mais forte no Google. Com a reputação que vocês já têm, dá pra converter muito mais.\n\nQuer ver como ficaria?`,
  // 4. Google Meu Negócio com pontos perdendo cliente
  (nome, r, rv) => `Oi! Vi a *${nome}* no Maps com ${r}⭐ e ${rv} avaliações — nota ótima.\n\nSou o Ryan, cuido da presença no Google de oficinas aqui da região.\n\nSó de olhar o perfil de vocês, vi alguns pontos que tão deixando cliente escapar — serviços não listados, fotos paradas, horários… São ajustes simples que fazem diferença na hora que o cliente tá decidindo.\n\nPosso te enviar um exemplo do que faço?`,
  // 5. Ser referência da região
  (nome, r, rv) => `Oi! Tudo bem? Dei uma pesquisada em oficinas da região e a *${nome}* se destacou com ${r}⭐ e ${rv} avaliações.\n\nMe chamo Ryan, trabalho com presença digital pra oficinas — Google, WhatsApp e posicionamento local.\n\nCom o que vocês já têm de reputação, dá pra ser a referência da região nas buscas. Quem pesquisa oficina por aqui deveria encontrar vocês em primeiro.\n\nQuer que eu te mostre como isso funciona?`,
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

function MSG_1(nome, cat, rating, reviewCount) {
  const r = rating ? rating.toFixed(1) : '4.5';
  const rv = reviewCount || 50;
  return MSGS_1_AUTO[Math.floor(Math.random() * MSGS_1_AUTO.length)](nome, r, rv);
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
const CAMPO_MASK = 'places.id,places.displayName,places.primaryTypeDisplayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.businessStatus,places.googleMapsUri,places.photos';
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

// ─── Interior SP — expansão quando local estiver esgotado ────────────────────
const CIDADES_SP = [
  { nome: 'Ribeirão Preto SP',         pontos: [[-21.1699,-47.8099],[-21.1699,-47.7699],[-21.2099,-47.8099],[-21.2099,-47.7699]] },
  { nome: 'São José dos Campos SP',    pontos: [[-23.1794,-45.8869],[-23.2194,-45.8869]] },
  { nome: 'Sorocaba SP',               pontos: [[-23.5015,-47.4526],[-23.5015,-47.4026]] },
  { nome: 'São José do Rio Preto SP',  pontos: [[-20.8197,-49.3794],[-20.8597,-49.3794]] },
  { nome: 'Bauru SP',                  pontos: [[-22.3246,-49.0961]] },
  { nome: 'Franca SP',                 pontos: [[-20.5386,-47.4008]] },
  { nome: 'Taubaté SP',                pontos: [[-23.0261,-45.5558]] },
  { nome: 'São Carlos SP',             pontos: [[-21.9794,-47.8906]] },
  { nome: 'Araraquara SP',             pontos: [[-21.7945,-48.1756]] },
  { nome: 'Marília SP',                pontos: [[-22.2133,-49.9458]] },
  { nome: 'Araçatuba SP',              pontos: [[-21.2094,-50.4428]] },
  { nome: 'Presidente Prudente SP',    pontos: [[-22.1256,-51.3889]] },
  { nome: 'Botucatu SP',               pontos: [[-22.8869,-48.4450]] },
  { nome: 'Guaratinguetá SP',          pontos: [[-22.8167,-45.1939]] },
  { nome: 'Ourinhos SP',               pontos: [[-22.9789,-49.8697]] },
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

  // A+ todo dia; Tier A e Outros só seg/qua/sex (uma rotativa de cada)
  const brtBuscar = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  const categoriasDia = [...CATEGORIAS_AUTO];
  if ([1, 3, 5].includes(brtBuscar.getDay())) {
    const rotA = await proximaCategoriaAutoA();
    categoriasDia.push(rotA);
    console.log(`Categorias: A+(${CATEGORIAS_AUTO.length}) + ${rotA} (Tier A)`);
  } else {
    console.log(`Categorias: A+(${CATEGORIAS_AUTO.length})`);
  }

  const LIMIAR_EXPANSAO = 15; // se local achar menos de X novos, expande pro estado

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
          foto: p.foto, rating: p.rating, review_count: p.reviewCount,
          status: 'pending', updated_at: new Date().toISOString(),
        }),
      }).catch(err => console.error(`Erro ao salvar ${p.nome}:`, err.message));
      novos++;
    }
    return novos;
  }

  // Fase 1: região local
  console.log('Fase 1: região de Campinas...');
  let novos = await buscarESalvar(CIDADES_LOCAL, vagas * 2);
  console.log(`Local: ${novos} novos`);

  // Fase 2: interior SP se local estiver esgotado
  if (novos < LIMIAR_EXPANSAO) {
    console.log(`Poucos novos localmente (${novos}) — expandindo para interior SP...`);
    const novosSP = await buscarESalvar(CIDADES_SP, vagas * 2 - novos);
    novos += novosSP;
    console.log(`Interior SP: ${novosSP} novos`);
  }

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

// ─── Relatório de Presença ────────────────────────────────────────────────────
async function jobRelatorioPresenca() {
  console.log('[presenca] iniciando leitura do Sheets...');
  if (!GOOGLE_API_KEY) { console.error('[presenca] GOOGLE_API_KEY não configurado'); return; }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_ID}/values/Respostas%20ao%20formul%C3%A1rio%201!A2:E?key=${GOOGLE_API_KEY}`;
  const resp = await fetch(url);
  if (!resp.ok) { console.error('[presenca] erro Sheets API:', await resp.text()); return; }
  const data = await resp.json();

  const rows = data.values || [];
  if (!rows.length) { console.log('[presenca] planilha vazia'); return; }

  // Última sexta-feira (segunda - 3 dias)
const ultimaSexta = new Date();

while (ultimaSexta.getDay() !== 5) {
  ultimaSexta.setDate(ultimaSexta.getDate() - 1);
}

const sextaFormatada =
  `${String(ultimaSexta.getDate()).padStart(2, '0')}/${
    String(ultimaSexta.getMonth() + 1).padStart(2, '0')
  }/${ultimaSexta.getFullYear()}`;

const doUltimoEncontro = rows.filter(r => {
  if (!r[0]) return false;

  const dataBr = r[0].split(' ')[0];

  return dataBr === sextaFormatada;
});
  
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
    return `• ${nome} | ${numero || 'sem número'} | ${status}`;
  });

  const dataFormatada = ultimaSexta.toLocaleDateString('pt-BR');
  const mensagem = `Relatório do último encontro Hangout — ${dataFormatada}\n${linhas.join('\n')}`;

  if (!EVOLUTION_URL || !EVOLUTION_KEY) { console.error('[presenca] EVOLUTION_URL/KEY não configurados'); return; }

  await fetch(`${EVOLUTION_URL}/message/sendText/${EVOLUTION_INST}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': EVOLUTION_KEY },
    body: JSON.stringify({ number: LIDER_NUM, text: mensagem, delay: 500 }),
  });

  console.log(`[presenca] relatório enviado — ${semCadastro.length} pessoa(s) sem cadastro`);
}

// ─── Agendamentos (UTC, Brasília = UTC-3) ────────────────────────────────────
cron.schedule('0 15 * * 1', jobRelatorioPresenca);  // seg 12h BRT
cron.schedule('30 10 * * 1-6', jobBuscar);
cron.schedule('0 11 * * 1-6', () => { setTimeout(() => jobDisparoLote(LIMITE_MANHA), Math.floor(Math.random() * 20 * 60 * 1000)); });
cron.schedule('0 16 * * 1-5', () => { setTimeout(() => jobDisparoLote(LIMITE_TARDE), Math.floor(Math.random() * 20 * 60 * 1000)); });
cron.schedule('0 15 * * 1-6', jobFollowUp);   // 12h BRT — follow-up 3 dias
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
        // Dispara UMA mensagem e retorna — tenta até achar número válido
        const pendentes = await sbFetch('/wa_prospects?status=eq.pending&select=*&limit=10').catch(() => []);
        if (!pendentes?.length) {
          res.writeHead(200); res.end(JSON.stringify({ ok: true, done: true })); return;
        }
        let enviado = null;
        for (const p of pendentes) {
          try {
            await enviarWA(p.wa_num, MSG_1(p.nome, p.categoria, p.rating, p.review_count));
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
      } else if (job === 'presenca') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, job }));
        jobRelatorioPresenca().catch(err => console.error('[presenca]', err.message));
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

