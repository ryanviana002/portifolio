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

const MSGS_2 = [
  (nome) => `Esse é meu portfólio: ryancreator.dev\n\nEntrego em até 7 dias, preço fixo, sem mensalidade. Posso fazer um orçamento pra *${nome}*?`,
  (nome) => `Segue meu portfólio: ryancreator.dev\n\nTrabalho com prazo de até 7 dias e valor fechado, sem surpresa. O que acha pra *${nome}*?`,
  (nome) => `Aqui está: ryancreator.dev\n\nJá fiz pra vários negócios da região. Entrego em 7 dias, preço fixo. Consigo fazer um orçamento pra vocês?`,
  (nome) => `ryancreator.dev — pode dar uma olhada lá.\n\nPrazo de até 7 dias, preço fixo, sem mensalidade. Faz sentido pra *${nome}*?`,
  (nome) => `Meu portfólio: ryancreator.dev\n\nEntrego rápido e com preço fechado. Se quiser, faço um orçamento específico pra *${nome}*?`,
  (nome) => `Segue: ryancreator.dev\n\nTrabalho com negócios locais, entrego em 7 dias e o valor é fixo. Posso montar uma proposta pra *${nome}*?`,
];
function MSG_2(nome) {
  return MSGS_2[Math.floor(Math.random() * MSGS_2.length)](nome);
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

const CUMPRIMENTOS = ['oi','olá','ola','bom dia','boa tarde','boa noite','boa','hey','hello','hi','tudo bem','tudo bom','td bem','td bom','e aí','eai','opa'];

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

Contexto: um desenvolvedor web perguntou pelo WhatsApp se podia mandar um site que montou para o negócio do cliente.

INTERESSE = cliente autoriza o envio (sim, pode, manda, quero ver, claro, ok, vai lá, etc)
PERGUNTA = cliente fez pergunta antes de decidir (quanto custa? quem é você? como funciona? etc)
RECUSA = qualquer outra coisa — recusa direta, educada, cumprimento sem autorizar, resposta vaga

Exemplos de RECUSA: "não obrigado", "já tenho", "agradeço", "tudo bem", "obrigada", "boa tarde", "oi", cumprimentos isolados, respostas que não autorizam o envio.

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
    return { tipo: 'recusa', resposta: 'Tudo bem! Se precisar de um site no futuro é só chamar. Abraço! 👋' };
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

// ── Processa comandos enviados pelo Ryan para si mesmo ────────────────────────
async function processarComandoRyan(textoCmd, res) {
  // Sem comandos ativos no momento
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
      `/wa_prospects?wa_num=eq.${waNum}&status=in.(sent1,replied,aguardando_ryan)&select=*&order=sent1_at.desc&limit=1`
    );
    if (!prospects?.length) return res.status(200).json({ ok: true });

    const prospect = prospects[0];
    _prospectNome = prospect.nome;

    // Marca mensagem como lida
    marcarComoLida(waNum, msg.key?.id).catch(() => {});

    // Fora da janela de resposta (22h–08h) — ignora silenciosamente
    if (!dentroJanelaResposta()) return res.status(200).json({ ok: true, ignored: 'fora_janela' });

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
        if (resposta) await enviarWA(waNum, resposta, { simularLeitura: true }).catch(() => {});
        return res.status(200).json({ ok: true, ignored: 'recusa' });
      }
      if (tipo === 'pergunta') {
        const respostas_bot = (prospect.respostas_bot || 0);
        if (respostas_bot < 3) {
          const autoResp = await responderPergunta(texto, prospect.nome);
          if (autoResp) {
            await enviarWA(waNum, autoResp, { simularLeitura: true });
            await sbFetch(`/wa_prospects?id=eq.${prospect.id}`, 'PATCH', { respostas_bot: respostas_bot + 1, updated_at: new Date().toISOString() });
            return res.status(200).json({ ok: true, auto_reply: true });
          }
        }
        await alertar(`❓ Pergunta em *${prospect.nome}*:\n"${texto}"\n\nWA: wa.me/${waNum}`);
        return res.status(200).json({ ok: true, aguardando: 'pergunta' });
      }
      // Interesse — envia portfólio direto
      await enviarWA(waNum, MSG_2(prospect.nome), { simularLeitura: true });
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
        if (resposta) await enviarWA(waNum, resposta, { simularLeitura: true }).catch(() => {});
        return res.status(200).json({ ok: true, ignored: 'recusa' });
      }
      if (tipo === 'pergunta') {
        const respostas_bot = (prospect.respostas_bot || 0);
        if (respostas_bot < 3) {
          const autoResp = await responderPergunta(texto, prospect.nome);
          if (autoResp) {
            await enviarWA(waNum, autoResp, { simularLeitura: true });
            await sbFetch(`/wa_prospects?id=eq.${prospect.id}`, 'PATCH', { respostas_bot: respostas_bot + 1, updated_at: new Date().toISOString() });
            return res.status(200).json({ ok: true, auto_reply: true });
          }
        }
        await sbFetch(`/wa_prospects?id=eq.${prospect.id}`, 'PATCH', { status: 'aguardando_ryan', updated_at: new Date().toISOString() });
        await alertar(`❓ Pergunta em *${prospect.nome}*:\n"${texto}"\n\nWA: wa.me/${waNum}`);
        return res.status(200).json({ ok: true, aguardando: 'pergunta' });
      }
      // Interesse — envia portfólio direto
      await enviarWA(waNum, MSG_2(prospect.nome), { simularLeitura: true });
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
