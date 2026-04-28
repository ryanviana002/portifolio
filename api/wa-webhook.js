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

const MSG_2 = (nome, link) =>
  `Aqui está 👇\n\n${link}\n\nÉ um preview do site que montei pra *${nome}*. Fica disponível por 3 dias.\n\nO que achou?`;

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

async function enviarWA(numero, mensagem) {
  const r = await fetch(`${EVOLUTION_URL}/message/sendText/${EVOLUTION_INST}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': EVOLUTION_KEY },
    body: JSON.stringify({ number: numero, text: mensagem, delay: 1500 }),
  });
  if (!r.ok) throw new Error(await r.text());
}

async function alertar(msg) {
  try { await enviarWA(ALERT_NUM, `⚠️ RDCreator Bot\n${msg}`); } catch {}
}

const CUMPRIMENTOS = ['oi','olá','ola','bom dia','boa tarde','boa noite','boa','hey','hello','hi','tudo bem','tudo bom','td bem','td bom','e aí','eai','opa'];

async function analisarResposta(texto) {
  if (!texto?.trim()) return { tipo: 'ignorar', resposta: null };
  const limpo = texto.trim().toLowerCase().replace(/[!?.,']/g, '');
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

async function gerarESalvarSite(prospect) {
  // 1. Check (pega dados do Maps)
  const checkRes = await fetch(`${VERCEL_URL}/api/preview-check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: prospect.maps_url, placeId: prospect.id }),
  });
  const checkData = await checkRes.json();
  if (!checkRes.ok) throw new Error(checkData.error || 'Erro no check');

  // 2. Gerar HTML via Claude
  const genRes = await fetch(`${VERCEL_URL}/api/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: prospect.maps_url,
      placeId: prospect.id,
      prompt: '',
      modelo: 'haiku',
      origem: 'worker',
    }),
  });
  const genData = await genRes.json();
  if (!genRes.ok) throw new Error(genData.error || 'Erro na geração');

  const nome = genData.dados?.nome || checkData.nome || prospect.nome;

  // 3. Salvar preview (sem enfileirar de novo — placeId omitido)
  const saveRes = await fetch(`${VERCEL_URL}/api/preview-save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      html: genData.html,
      nome,
      categoria: genData.dados?.categoria || prospect.categoria,
      origem: 'worker',
    }),
  });
  const saveData = await saveRes.json();
  if (!saveRes.ok) throw new Error(saveData.error || 'Erro ao salvar');

  // 4. Atualiza prospect com o preview gerado
  await sbFetch(`/wa_prospects?id=eq.${prospect.id}`, 'PATCH', {
    preview_id: saveData.id,
    preview_url: saveData.url,
    updated_at: new Date().toISOString(),
  });

  return { nome, previewUrl: saveData.url };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const body = req.body;

    // Filtra só mensagens recebidas
    if (body?.event !== 'messages.upsert') return res.status(200).json({ ok: true });

    const msg = body?.data?.messages?.[0] || body?.data;
    if (!msg || msg.key?.fromMe) return res.status(200).json({ ok: true });

    const waNum = msg.key?.remoteJid?.replace('@s.whatsapp.net', '');
    if (!waNum) return res.status(200).json({ ok: true });

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
      `/wa_prospects?wa_num=eq.${waNum}&status=in.(sent1,replied,aguardando_ryan,generating)&select=*&order=sent1_at.desc&limit=1`
    );
    if (!prospects?.length) return res.status(200).json({ ok: true });

    const prospect = prospects[0];

    // Já gerando site — ignora mensagem duplicada
    if (prospect.status === 'generating') return res.status(200).json({ ok: true, ignored: 'generating' });

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
        if (resposta) await enviarWA(waNum, resposta).catch(() => {});
        return res.status(200).json({ ok: true, ignored: 'recusa' });
      }
      if (tipo === 'pergunta') {
        await alertar(`❓ Nova pergunta em *${prospect.nome}*:\n"${texto}"\n\nWA: wa.me/${waNum}`);
        return res.status(200).json({ ok: true, aguardando: 'pergunta' });
      }
      // Interesse — trava status antes de gerar (evita duplicata)
      await sbFetch(`/wa_prospects?id=eq.${prospect.id}&status=eq.aguardando_ryan`, 'PATCH', { status: 'generating', updated_at: new Date().toISOString() });
      const { nome, previewUrl } = await gerarESalvarSite(prospect);
      await enviarWA(waNum, MSG_2(nome, previewUrl));
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
        if (resposta) await enviarWA(waNum, resposta).catch(() => {});
        return res.status(200).json({ ok: true, ignored: 'recusa' });
      }
      if (tipo === 'pergunta') {
        await sbFetch(`/wa_prospects?id=eq.${prospect.id}`, 'PATCH', { status: 'aguardando_ryan', updated_at: new Date().toISOString() });
        await alertar(`❓ Pergunta em *${prospect.nome}*:\n"${texto}"\n\nWA: wa.me/${waNum}`);
        return res.status(200).json({ ok: true, aguardando: 'pergunta' });
      }
      // Trava status antes de gerar (evita duplicata)
      await sbFetch(`/wa_prospects?id=eq.${prospect.id}&status=eq.replied`, 'PATCH', { status: 'generating', updated_at: new Date().toISOString() });
      const { nome, previewUrl } = await gerarESalvarSite(prospect);
      await enviarWA(waNum, MSG_2(nome, previewUrl));
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
      if (resposta) await enviarWA(waNum, resposta).catch(() => {});
      return res.status(200).json({ ok: true, ignored: 'recusa' });
    }
    if (tipo === 'pergunta') {
      await sbFetch(`/wa_prospects?id=eq.${prospect.id}`, 'PATCH', { status: 'aguardando_ryan', updated_at: new Date().toISOString() });
      await alertar(`❓ Pergunta em *${prospect.nome}*:\n"${textoHumano}"\n\nWA: wa.me/${waNum}`);
      return res.status(200).json({ ok: true, aguardando: 'pergunta' });
    }

    // Trava status antes de gerar (evita duplicata)
    await sbFetch(`/wa_prospects?id=eq.${prospect.id}&status=eq.sent1`, 'PATCH', { status: 'generating', updated_at: new Date().toISOString() });
    const { nome, previewUrl } = await gerarESalvarSite(prospect);
    await enviarWA(waNum, MSG_2(nome, previewUrl));
    await sbFetch(`/wa_prospects?id=eq.${prospect.id}`, 'PATCH', {
      status: 'sent2',
      sent2_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return res.status(200).json({ ok: true, sent2: true, trigger: 'direct_human' });

  } catch (err) {
    console.error('wa-webhook error:', err);
    await alertar(`Erro no webhook: ${err.message}`);
    return res.status(200).json({ ok: true }); // sempre 200 pro Evolution não retentar
  }
}
