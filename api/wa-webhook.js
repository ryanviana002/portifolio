// Webhook Evolution API — recebe mensagens dos clientes
// POST /api/wa-webhook

const SUPABASE_URL    = 'https://zivrekynlmznlyoyyrvg.supabase.co';
const SUPABASE_KEY    = process.env.SUPABASE_SERVICE_KEY;
const EVOLUTION_URL   = process.env.EVOLUTION_URL;
const EVOLUTION_KEY   = process.env.EVOLUTION_KEY;
const EVOLUTION_INST  = process.env.EVOLUTION_INSTANCE || 'rdcreator';
const VERCEL_URL      = process.env.APP_URL || 'https://ryancreator.dev';
const ALERT_NUM       = '5519992525515';
const ANTHROPIC_KEY   = process.env.ANTHROPIC_API_KEY;
const WORKER_URL      = process.env.WORKER_URL;
const TRIGGER_KEY     = process.env.TRIGGER_KEY || 'familia1@';

function categoriaGrupo(cat) {
  if (!cat) return 'default';
  const c = cat.toLowerCase();
  if (['mecân', 'oficina', 'borracharia', 'elétrica auto', 'funilaria'].some(k => c.includes(k))) return 'automotivo';
  if (['salão', 'barbearia'].some(k => c.includes(k))) return 'beleza';
  if (['restaurante', 'lanchonete', 'pizzaria', 'padaria'].some(k => c.includes(k))) return 'alimentacao';
  if (['clínica', 'dentista', 'farmácia', 'academia', 'pet shop'].some(k => c.includes(k))) return 'saude';
  if (['encanador', 'eletricista', 'pintura', 'serralheria', 'marcenaria', 'vidraçaria'].some(k => c.includes(k))) return 'servicos';
  return 'default';
}

const MSGS_2 = {
  automotivo: [
    (nome) => `ryancreator.dev — já fiz pra oficina e mecânica aqui na região.\n\nQuem busca *"mecânica perto de mim"* no Google clica em quem tem site. Sem site, você perde pra concorrência.\n\nA partir de R$697, parcelado em até 12x. Qual o melhor horário pra conversar 10 min sobre a *${nome}*?`,
    (nome) => `Segue: ryancreator.dev\n\nJá fiz pra oficina da região. Cliente que busca no Google prefere quem tem site — passa mais confiança. Entrego em 7 dias, a partir de R$697.\n\nQual o melhor horário pra conversar rapidinho sobre a *${nome}*?`,
  ],
  beleza: [
    (nome) => `ryancreator.dev — já fiz pra salão e barbearia na região.\n\nSite com galeria de fotos + botão de agendamento = clientes novos todo dia, sem depender só do Instagram.\n\nA partir de R$697, parcelado em até 12x. Qual o melhor horário pra conversar 10 min sobre a *${nome}*?`,
    (nome) => `Segue: ryancreator.dev\n\nJá fiz pra barbearia aqui na região. Galeria de fotos, horários e contato direto — tudo num site que aparece no Google. A partir de R$697.\n\nQual o melhor horário pra conversar rapidinho sobre a *${nome}*?`,
  ],
  alimentacao: [
    (nome) => `ryancreator.dev — já fiz pra restaurante e pizzaria da região.\n\nCardápio online + botão de pedido pelo WhatsApp = mais pedidos sem depender só do iFood.\n\nA partir de R$697, parcelado em até 12x. Qual o melhor horário pra conversar 10 min sobre a *${nome}*?`,
    (nome) => `Segue: ryancreator.dev\n\nJá fiz pra restaurante da região. Site com cardápio, fotos e localização — cliente busca no Google e já chega decidido. A partir de R$697.\n\nQual o melhor horário pra conversar rapidinho sobre a *${nome}*?`,
  ],
  saude: [
    (nome) => `ryancreator.dev — já fiz pra clínica e consultório aqui na região.\n\nPaciente busca no Google antes de ligar. Sem site, você perde pra quem aparece primeiro.\n\nA partir de R$697, parcelado em até 12x. Qual o melhor horário pra conversar 10 min sobre a *${nome}*?`,
    (nome) => `Segue: ryancreator.dev\n\nJá fiz pra dentista e clínica da região. Site com serviços, localização e WhatsApp direto — passa confiança e traz paciente novo. A partir de R$697.\n\nQual o melhor horário pra conversar rapidinho sobre a *${nome}*?`,
  ],
  servicos: [
    (nome) => `ryancreator.dev — já fiz pra prestador de serviço da região.\n\nQuem busca *"eletricista perto de mim"* no Google clica em quem tem site. Sem site, você não aparece.\n\nA partir de R$697, parcelado em até 12x. Qual o melhor horário pra conversar 10 min sobre a *${nome}*?`,
    (nome) => `Segue: ryancreator.dev\n\nJá fiz pra prestador de serviço da região. Site com serviços, área de atendimento e WhatsApp — cliente acha você no Google. A partir de R$697.\n\nQual o melhor horário pra conversar rapidinho sobre a *${nome}*?`,
  ],
  default: [
    (nome) => `ryancreator.dev — já fiz pra vários negócios da região.\n\nEntrego em 7 dias, preço fixo, sem mensalidade. A partir de R$697, parcelado em até 12x. Agenda com poucas vagas esse mês.\n\nQual o melhor horário pra conversar 10 min sobre a *${nome}*?`,
    (nome) => `Segue: ryancreator.dev\n\nJá ajudei negócios da região a aparecerem no Google. 7 dias de prazo, a partir de R$697, parcelado em até 12x.\n\nQual o melhor horário pra conversar rapidinho sobre a *${nome}*?`,
  ],
};
function MSG_2(nome, categoria) {
  const grupo = categoriaGrupo(categoria);
  const msgs = MSGS_2[grupo];
  return msgs[Math.floor(Math.random() * msgs.length)](nome);
}

const MSGS_RECUSA = [
  'Tudo bem! Se precisar de um site no futuro é só chamar. Abraço! 👋',
  'Entendido! Fica o contato caso precise. 👋',
  'Ok, sem problema! Qualquer coisa é só falar. 👋',
  'Tranquilo! Se mudar de ideia estou por aqui. 👋',
  'Beleza! Boa sorte com o negócio! 👋',
  'Compreendo! Se um dia precisar pode me chamar. 👋',
];
function MSG_RECUSA() {
  return MSGS_RECUSA[Math.floor(Math.random() * MSGS_RECUSA.length)];
}

async function sbFetch(path, method = 'GET', body) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': method === 'POST' ? 'return=representation' : 'return=minimal',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(await r.text());
  return method !== 'PATCH' ? r.json() : null;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function dentroJanelaResposta() {
  const agora = new Date();
  const brt = new Date(agora.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  const hora = brt.getHours();
  return hora >= 8 && hora < 22;
}

async function marcarComoLida(numero, messageId) {
  if (!messageId) return;
  await fetch(`${EVOLUTION_URL}/chat/markMessageAsRead/${EVOLUTION_INST}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': EVOLUTION_KEY },
    body: JSON.stringify({ readMessages: [{ id: messageId, fromMe: false, remoteJid: `${numero}@s.whatsapp.net` }] }),
  }).catch(() => {});
}

async function setPresenca(numero, presence) {
  await fetch(`${EVOLUTION_URL}/chat/presence/${EVOLUTION_INST}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': EVOLUTION_KEY },
    body: JSON.stringify({ number: numero, presence }),
  }).catch(() => {});
}

async function enviarWA(numero, mensagem, { simularLeitura = false } = {}) {
  // Simula visualização antes de digitar (quando é resposta a cliente)
  if (simularLeitura) {
    await setPresenca(numero, 'available');
    await sleep(3000 + Math.random() * 7000);  // 3–10s "lendo" a mensagem
  }

  // Online → digitando → envia
  await setPresenca(numero, 'available');
  await sleep(1000 + Math.random() * 3000);  // 1–4s online antes de digitar

  const tempoDigitando = Math.min(2000 + mensagem.length * 35, 10000);  // proporcional, máx 10s
  await setPresenca(numero, 'composing');
  await sleep(tempoDigitando);

  const r = await fetch(`${EVOLUTION_URL}/message/sendText/${EVOLUTION_INST}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': EVOLUTION_KEY },
    body: JSON.stringify({ number: numero, text: mensagem, delay: 0 }),
  });
  if (!r.ok) throw new Error(await r.text());

  await setPresenca(numero, 'paused');
}

async function alertar(msg) {
  try { await enviarWA(ALERT_NUM, `⚠️ RDCreator Bot\n${msg}`); } catch {}
}

// Fire-and-forget para Railway — evita timeout do Vercel nos delays de simulação
function dispararViaWorker(waNum, mensagem, opts = {}) {
  if (!WORKER_URL) { enviarWA(waNum, mensagem, opts).catch(() => {}); return; }
  fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: TRIGGER_KEY, job: 'responder', waNum, mensagem, simularLeitura: opts.simularLeitura || false }),
  }).catch(err => console.error('dispararViaWorker:', err.message));
}

const CUMPRIMENTOS = ['oi','olá','ola','bom dia','boa tarde','boa noite','boa','hey','hello','hi','tudo bem','tudo bom','td bem','td bom','e aí','eai','opa'];

const PADROES_BOT = [
  'como posso ajudar',
  'como posso te ajudar',
  'como posso lhe ajudar',
  'em que posso ajudar',
  'em que posso te ajudar',
  'obrigado por entrar em contato',
  'obrigada por entrar em contato',
  'em breve retornaremos',
  'em breve responderemos',
  'fora do horário de atendimento',
  'horário de atendimento',
  'atendimento automático',
  'mensagem automática',
  'assistente virtual',
  'este é um atendimento automático',
  'nossa equipe entrará em contato',
  'aguarde um momento',
  'transferindo para',
];
function eRespostaAutomatica(texto) {
  const limpo = texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  return PADROES_BOT.some(p => limpo.includes(p.normalize('NFD').replace(/[̀-ͯ]/g, '')));
}

const CONTEXTO_RYAN = `Você é o assistente virtual do Ryan Viana, desenvolvedor web da RDCreator (ryancreator.dev), especialista em sites para negócios locais da região de Campinas e todo o Brasil.

SOBRE O RYAN:
- Desenvolvedor web especialista em negócios locais
- Atendimento direto, sem intermediários
- Atende em todo o Brasil (online)
- Site: ryancreator.dev

PLANOS (pagamento único, sem mensalidade):
- Básico R$697: site one page moderno, até 6 seções, botão WhatsApp, galeria de fotos, mapa do Google, informações do negócio. Entrega em 5 dias úteis.
- Padrão R$1.197 (mais escolhido): até 3 páginas, SEO para aparecer no Google, animações, domínio + hospedagem inclusos. Entrega em 12 dias úteis.
- Premium R$1.597: até 5 páginas, copywriting estratégico, design exclusivo pensado para converter visitantes em clientes. Entrega em 14 dias úteis.

MANUTENÇÃO (opcional): R$97/mês — atualizações de conteúdo, suporte e backup. Só contrata quem quiser.

PAGAMENTO: Pix, transferência ou cartão de crédito em até 12x (com taxa da maquinha). 50% entrada + 50% na entrega.

PROCESSO: Após fechar, Ryan envia um briefing rápido para preencher com as informações do negócio. Simples e rápido.

GARANTIA: Se não gostar do resultado, revisamos sem custo até ficar perfeito.

PORTFÓLIO: Tem exemplos de sites prontos para mostrar em ryancreator.dev.

AGENDA: Limitada — poucos projetos por mês para garantir qualidade e dedicação total.

CONTRATO: Sim, fornecemos contrato formal para quem preferir.

DOMÍNIO PRÓPRIO: Sim, aproveitamos o domínio que o cliente já tem.

PROPRIEDADE: Após a entrega, o site fica totalmente no nome do cliente.

ALTERAÇÕES AVULSAS: Além da manutenção mensal, alterações pontuais têm valor a combinar.

LOJA VIRTUAL (e-commerce): Se perguntarem sobre loja virtual ou e-commerce, responda: ESCALAR

DIFERENCIAIS: Especialista em negócios locais, atendimento direto com o desenvolvedor, garantia de revisão, agenda limitada com dedicação total a cada projeto.`;

async function responderPergunta(texto, nomeProspect) {
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 300,
        system: CONTEXTO_RYAN,
        messages: [{
          role: 'user',
          content: `O cliente "${nomeProspect}" perguntou via WhatsApp: "${texto}"

Responda de forma curta e direta. Máximo 4 linhas. Use emojis com moderação.

REGRAS:
- NÃO comece com cumprimento (não use "Olá", "Oi", "Tudo bem", "Bom dia", etc)
- Vá direto ao ponto da resposta
- Fale como se fosse o próprio Ryan respondendo (primeira pessoa, "eu", "meu", "faço")
- Não mencione equipe, assistente, bot ou terceiros

Se a pergunta for sobre desconto/negociação de preço, loja virtual/e-commerce, ou algo fora do contexto, responda apenas: ESCALAR`,
        }],
      }),
    });
    const d = await r.json();
    const txt = (d.content?.[0]?.text || '').trim();
    if (!txt || txt.includes('ESCALAR')) return null;
    return txt;
  } catch {
    return null;
  }
}

async function analisarResposta(texto) {
  if (!texto?.trim()) return { tipo: 'ignorar', resposta: null };
  const limpo = texto.trim().toLowerCase().replace(/[!?.,']/g, '').trim();
  // Ignora SOMENTE se a mensagem inteira for um cumprimento
  if (CUMPRIMENTOS.includes(limpo)) return { tipo: 'ignorar', resposta: null };
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 10,
        messages: [{
          role: 'user',
          content: `Classifique a mensagem abaixo em uma única palavra: INTERESSE, PERGUNTA ou RECUSA.

Contexto: um desenvolvedor web mandou WhatsApp para um negócio local perguntando se podia mostrar seu portfólio de sites.

INTERESSE = cliente está receptivo ou abre a conversa (sim, pode, manda, quero ver, claro, ok, vai lá, como posso ajudar, pois não, me fala, oi tudo bem, o que você faz, etc)
PERGUNTA = cliente faz pergunta específica antes de decidir (quanto custa? quem é você? como funciona? qual o prazo? etc)
RECUSA = cliente claramente não quer (não obrigado, já tenho site, não tenho interesse, agora não, sem interesse, etc)

IMPORTANTE: "como posso ajudar?", "pois não", "me fala", "oi tudo bem?" são INTERESSE — o cliente está receptivo, não recusando.
Só classifique como RECUSA se o cliente deixar claro que não quer.

Mensagem: "${texto}"

Responda só a palavra:`,
        }],
      }),
    });
    const d = await r.json();
    const txt = (d.content?.[0]?.text || '').trim().toUpperCase();
    if (!txt) return { tipo: 'interesse', resposta: null };
    if (txt.includes('INTERESSE')) return { tipo: 'interesse', resposta: null };
    if (txt.includes('PERGUNTA')) return { tipo: 'pergunta', resposta: null };
    return { tipo: 'recusa', resposta: MSG_RECUSA() };
  } catch {
    return { tipo: 'interesse', resposta: null };
  }
}

// ── Normaliza número para formato 55XXXXXXXXXXX ───────────────────────────────
function normalizarNum(raw) {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('55') && digits.length >= 12) return digits;
  return `55${digits}`;
}

// Envia resposta rápida pro Ryan sem delay de simulação
async function responderRyan(texto) {
  await fetch(`${EVOLUTION_URL}/message/sendText/${EVOLUTION_INST}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': EVOLUTION_KEY },
    body: JSON.stringify({ number: ALERT_NUM, text: texto, delay: 500 }),
  }).catch(() => {});
}

// ── Processa comandos enviados pelo Ryan para si mesmo ────────────────────────
async function processarComandoRyan(textoCmd, res) {
  const cmd = textoCmd.trim();
  const cmdLower = cmd.toLowerCase();

  if (cmdLower.startsWith('/fechar ') || cmdLower.startsWith('/pular ')) {
    const acao = cmdLower.startsWith('/fechar') ? 'fechar' : 'pular';
    const arg = cmd.slice(acao === 'fechar' ? 8 : 7).trim();
    const digits = arg.replace(/\D/g, '');
    const waNum = digits.length >= 10 ? (digits.startsWith('55') ? digits : `55${digits}`) : null;

    let prospect = null;
    if (waNum) {
      const rows = await sbFetch(`/wa_prospects?wa_num=eq.${waNum}&select=*&limit=1`).catch(() => []);
      prospect = rows?.[0];
    }

    if (!prospect) {
      await responderRyan(`❌ Prospect não encontrado: ${arg}`);
      return res.status(200).json({ ok: true });
    }

    const novoStatus = acao === 'fechar' ? 'cliente' : 'ignored';
    await sbFetch(`/wa_prospects?id=eq.${prospect.id}`, 'PATCH', {
      status: novoStatus,
      updated_at: new Date().toISOString(),
    }).catch(() => {});

    const emoji = acao === 'fechar' ? '✅' : '⏭';
    const label = acao === 'fechar' ? 'marcado como cliente 🎉' : 'ignorado';
    await responderRyan(`${emoji} *${prospect.nome}* ${label}`);
    return res.status(200).json({ ok: true });
  }

  if (cmdLower === '/ajuda' || cmdLower === '/help') {
    await responderRyan(`*Comandos disponíveis:*\n\n/fechar 5519999999999 — marca como cliente\n/pular 5519999999999 — ignora o prospect`);
    return res.status(200).json({ ok: true });
  }

  return res.status(200).json({ ok: true });
}

// ─── Rate limit em memória (por número, máx 5 req/min) ───────────────────────
const _rateLimitMap = new Map();
function checarRateLimit(num) {
  const agora = Date.now();
  const entry = _rateLimitMap.get(num) || { count: 0, since: agora };
  if (agora - entry.since > 60_000) { entry.count = 0; entry.since = agora; }
  entry.count++;
  _rateLimitMap.set(num, entry);
  return entry.count > 5;
}

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Valida secret do webhook (Evolution envia no header)
  if (WEBHOOK_SECRET) {
    const secret = req.headers['apikey'] || req.headers['x-webhook-secret'] || req.headers['authorization'];
    if (secret !== WEBHOOK_SECRET) return res.status(401).json({ error: 'unauthorized' });
  }

  let _prospectNome = null;
  let _waNum = null;

  try {
    const body = req.body;

    // Log de debug — registra TUDO que chega
    console.log('[webhook RAW]', JSON.stringify(body).slice(0, 500));

    // ── Comandos do Ryan via SEND_MESSAGE ─────────────────────────────────────
    if (body?.event === 'send.message') {
      const msgCmd = body?.data;
      if (!msgCmd?.key?.fromMe) return res.status(200).json({ ok: true });
      const textoCmd = (msgCmd?.message?.conversation || msgCmd?.message?.extendedTextMessage?.text || '').trim();
      await processarComandoRyan(textoCmd, res);
      return;
    }

    if (body?.event !== 'messages.upsert') return res.status(200).json({ ok: true });

    const msg = body?.data?.messages?.[0] || body?.data;
    if (!msg) return res.status(200).json({ ok: true });

    // ── Comandos do Ryan via MESSAGES_UPSERT (fromMe) ─────────────────────────
    if (msg.key?.fromMe) {
      const textoCmd = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || '').trim();
      return processarComandoRyan(textoCmd, res);
    }

    const waNum = msg.key?.remoteJid?.replace('@s.whatsapp.net', '');
    _waNum = waNum;
    if (!waNum) return res.status(200).json({ ok: true });
    if (checarRateLimit(waNum)) return res.status(200).json({ ok: true, ignored: 'rate_limit' });

    // ── Comando do Ryan mandado do celular pessoal para o bot ─────────────────
    if (waNum === ALERT_NUM) {
      const textoCmd = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || '').trim();
      return processarComandoRyan(textoCmd, res);
    }

    // Detecta tipo de mensagem — só processa texto
    const tipoMensagem = msg.message
      ? Object.keys(msg.message)[0]
      : 'unknown';
    const eMidia = ['imageMessage','videoMessage','audioMessage','stickerMessage','documentMessage','reactionMessage'].includes(tipoMensagem);

    const receivedAt = new Date();

    // Log da mensagem
    sbFetch('/wa_messages', 'POST', {
      wa_num: waNum,
      message: msg.message?.conversation || msg.message?.extendedTextMessage?.text || '',
      received_at: receivedAt.toISOString(),
    }).catch(() => {});

    // Busca prospect ativo
    const prospects = await sbFetch(
      `/wa_prospects?wa_num=eq.${waNum}&status=in.(sent1,sent3,replied,aguardando_ryan)&select=*&order=sent1_at.desc&limit=1`
    );
    if (!prospects?.length) return res.status(200).json({ ok: true });

    const prospect = prospects[0];
    _prospectNome = prospect.nome;

    // Marca mensagem como lida
    marcarComoLida(waNum, msg.key?.id).catch(() => {});

    // Fora da janela de resposta (22h–08h) — ignora silenciosamente
    if (!dentroJanelaResposta()) return res.status(200).json({ ok: true, ignored: 'fora_janela' });

    // Resposta automática de bot do cliente — ignora silenciosamente
    const textoRecebido = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    if (eRespostaAutomatica(textoRecebido)) return res.status(200).json({ ok: true, ignored: 'bot_automatico' });

    // Mídia (figurinha, áudio, imagem, vídeo) — alerta Ryan para responder manualmente
    if (eMidia) {
      const tipoLabel = { imageMessage:'imagem', videoMessage:'vídeo', audioMessage:'áudio', stickerMessage:'figurinha', documentMessage:'documento', reactionMessage:'reação' };
      await alertar(`📨 *${prospect.nome}* enviou ${tipoLabel[tipoMensagem] || 'mídia'}\n\nWA: wa.me/${waNum}`);
      await sbFetch(`/wa_prospects?id=eq.${prospect.id}`, 'PATCH', { status: 'aguardando_ryan', updated_at: new Date().toISOString() }).catch(() => {});
      return res.status(200).json({ ok: true, aguardando: 'midia' });
    }

    // Prospect aguardando Ryan — cliente respondeu após você tirar a dúvida
    if (prospect.status === 'aguardando_ryan') {
      const texto = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
      const { tipo, resposta } = await analisarResposta(texto);
      if (tipo === 'ignorar') return res.status(200).json({ ok: true, ignored: 'cumprimento' });
      if (tipo === 'recusa') {
        await sbFetch(`/wa_prospects?id=eq.${prospect.id}`, 'PATCH', { status: 'ignored', updated_at: new Date().toISOString() });
        if (resposta) dispararViaWorker(waNum, resposta, { simularLeitura: true });
        return res.status(200).json({ ok: true, ignored: 'recusa' });
      }
      if (tipo === 'pergunta') {
        const respostas_bot = (prospect.respostas_bot || 0);
        if (respostas_bot < 3) {
          const autoResp = await responderPergunta(texto, prospect.nome);
          if (autoResp) {
            dispararViaWorker(waNum, autoResp, { simularLeitura: true });
            await sbFetch(`/wa_prospects?id=eq.${prospect.id}`, 'PATCH', { respostas_bot: respostas_bot + 1, updated_at: new Date().toISOString() });
            return res.status(200).json({ ok: true, auto_reply: true });
          }
        }
        await alertar(`❓ Pergunta em *${prospect.nome}*:\n"${texto}"\n\nWA: wa.me/${waNum}`);
        return res.status(200).json({ ok: true, aguardando: 'pergunta' });
      }
      // Interesse — envia portfólio direto
      dispararViaWorker(waNum, MSG_2(prospect.nome, prospect.categoria), { simularLeitura: true });
      await sbFetch(`/wa_prospects?id=eq.${prospect.id}`, 'PATCH', { status: 'sent2', sent2_at: new Date().toISOString(), updated_at: new Date().toISOString() });
      return res.status(200).json({ ok: true, sent2: true, trigger: 'after_question' });
    }

    // Prospect em "replied" = já recebeu resposta de bot antes, agora é humano
    if (prospect.status === 'replied') {
      const texto = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
      const { tipo, resposta } = await analisarResposta(texto);
      if (tipo === 'ignorar') return res.status(200).json({ ok: true, ignored: 'cumprimento' });
      if (tipo === 'recusa') {
        await sbFetch(`/wa_prospects?id=eq.${prospect.id}`, 'PATCH', { status: 'ignored', updated_at: new Date().toISOString() });
        if (resposta) dispararViaWorker(waNum, resposta, { simularLeitura: true });
        return res.status(200).json({ ok: true, ignored: 'recusa' });
      }
      if (tipo === 'pergunta') {
        const respostas_bot = (prospect.respostas_bot || 0);
        if (respostas_bot < 3) {
          const autoResp = await responderPergunta(texto, prospect.nome);
          if (autoResp) {
            dispararViaWorker(waNum, autoResp, { simularLeitura: true });
            await sbFetch(`/wa_prospects?id=eq.${prospect.id}`, 'PATCH', { respostas_bot: respostas_bot + 1, updated_at: new Date().toISOString() });
            return res.status(200).json({ ok: true, auto_reply: true });
          }
        }
        await sbFetch(`/wa_prospects?id=eq.${prospect.id}`, 'PATCH', { status: 'aguardando_ryan', updated_at: new Date().toISOString() });
        await alertar(`❓ Pergunta em *${prospect.nome}*:\n"${texto}"\n\nWA: wa.me/${waNum}`);
        return res.status(200).json({ ok: true, aguardando: 'pergunta' });
      }
      // Interesse — envia portfólio direto
      dispararViaWorker(waNum, MSG_2(prospect.nome, prospect.categoria), { simularLeitura: true });
      await sbFetch(`/wa_prospects?id=eq.${prospect.id}`, 'PATCH', {
        status: 'sent2',
        sent2_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return res.status(200).json({ ok: true, sent2: true, trigger: 'second_message' });
    }

    // Primeira resposta — calcular delay
    const delayMs = receivedAt - new Date(prospect.sent1_at);

    await sbFetch(`/wa_prospects?id=eq.${prospect.id}`, 'PATCH', {
      replied_at: receivedAt.toISOString(),
      reply_delay_ms: delayMs,
      updated_at: receivedAt.toISOString(),
    });

    // Anti-bot: < 60s = bot automático, aguarda próxima mensagem
    if (delayMs < 60000) {
      await sbFetch(`/wa_prospects?id=eq.${prospect.id}`, 'PATCH', {
        status: 'replied',
        updated_at: new Date().toISOString(),
      });
      return res.status(200).json({ ok: true, ignored: 'response_too_fast' });
    }

    // Resposta humana (> 60s): verifica interesse antes de gerar site
    const textoHumano = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    const { tipo, resposta } = await analisarResposta(textoHumano);
    if (tipo === 'ignorar') return res.status(200).json({ ok: true, ignored: 'cumprimento' });
    if (tipo === 'recusa') {
      await sbFetch(`/wa_prospects?id=eq.${prospect.id}`, 'PATCH', { status: 'ignored', updated_at: new Date().toISOString() });
      if (resposta) await enviarWA(waNum, resposta, { simularLeitura: true }).catch(() => {});
      return res.status(200).json({ ok: true, ignored: 'recusa' });
    }
    if (tipo === 'pergunta') {
      const respostas_bot = (prospect.respostas_bot || 0);
      if (respostas_bot < 3) {
        const autoResp = await responderPergunta(textoHumano, prospect.nome);
        if (autoResp) {
          await enviarWA(waNum, autoResp, { simularLeitura: true });
          await sbFetch(`/wa_prospects?id=eq.${prospect.id}`, 'PATCH', { respostas_bot: respostas_bot + 1, status: 'replied', updated_at: new Date().toISOString() });
          return res.status(200).json({ ok: true, auto_reply: true });
        }
      }
      await sbFetch(`/wa_prospects?id=eq.${prospect.id}`, 'PATCH', { status: 'aguardando_ryan', updated_at: new Date().toISOString() });
      await alertar(`❓ Pergunta em *${prospect.nome}*:\n"${textoHumano}"\n\nWA: wa.me/${waNum}`);
      return res.status(200).json({ ok: true, aguardando: 'pergunta' });
    }

    // Interesse — envia portfólio direto
    await enviarWA(waNum, MSG_2(prospect.nome), { simularLeitura: true });
    await sbFetch(`/wa_prospects?id=eq.${prospect.id}`, 'PATCH', {
      status: 'sent2',
      sent2_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return res.status(200).json({ ok: true, sent2: true, trigger: 'direct_human' });

  } catch (err) {
    console.error('wa-webhook error:', err);
    const quem = _prospectNome ? `*${_prospectNome}*\nwa.me/${_waNum}` : `wa.me/${_waNum}`;
    await alertar(`Erro ao processar ${quem}:\n${err.message}`).catch(() => {});
    return res.status(200).json({ ok: true }); // sempre 200 pro Evolution não retentar
  }
}
