// Webhook Evolution API — recebe mensagens dos clientes
// POST /api/wa-webhook

const SUPABASE_URL    = 'https://zivrekynlmznlyoyyrvg.supabase.co';
const SUPABASE_KEY    = process.env.SUPABASE_SERVICE_KEY;
const EVOLUTION_URL   = process.env.EVOLUTION_URL;
const EVOLUTION_KEY   = process.env.EVOLUTION_KEY;
const EVOLUTION_INST  = process.env.EVOLUTION_INSTANCE || 'rdcreator';
const VERCEL_URL      = process.env.APP_URL || 'https://ryancreator.dev';
const ALERT_NUM       = '5519992525515';

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

    const receivedAt = new Date();

    // Log da mensagem
    sbFetch('/wa_messages', 'POST', {
      wa_num: waNum,
      message: msg.message?.conversation || msg.message?.extendedTextMessage?.text || '',
      received_at: receivedAt.toISOString(),
    }).catch(() => {});

    // Busca prospect — sent1 (aguardando 1ª resposta) ou replied (aguardando 2ª)
    const prospects = await sbFetch(
      `/wa_prospects?wa_num=eq.${waNum}&status=in.(sent1,replied)&select=*&order=sent1_at.desc&limit=1`
    );
    if (!prospects?.length) return res.status(200).json({ ok: true });

    const prospect = prospects[0];

    // Prospect em "replied" = já recebeu resposta de bot antes, agora é humano
    if (prospect.status === 'replied') {
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

    // Resposta humana (> 60s): gera site agora e envia 2º WA
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
