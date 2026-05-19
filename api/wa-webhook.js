// Webhook Evolution API — recebe mensagens dos clientes
// POST /api/wa-webhook

const SUPABASE_URL   = 'https://zivrekynlmznlyoyyrvg.supabase.co';
const SUPABASE_KEY   = process.env.SUPABASE_SERVICE_KEY;
const EVOLUTION_URL  = process.env.EVOLUTION_URL;
const EVOLUTION_KEY  = process.env.EVOLUTION_KEY;
const EVOLUTION_INST = process.env.EVOLUTION_INSTANCE || 'rdcreator';
const ALERT_NUM      = '5519992525515';
const ANTHROPIC_KEY  = process.env.ANTHROPIC_API_KEY;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

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

async function alertarRyan(texto) {
  await fetch(`${EVOLUTION_URL}/message/sendText/${EVOLUTION_INST}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': EVOLUTION_KEY },
    body: JSON.stringify({ number: ALERT_NUM, text: texto, delay: 500 }),
  }).catch(() => {});
}

// ── Comandos do Ryan via WhatsApp ─────────────────────────────────────────────
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
      await alertarRyan(`❌ Prospect não encontrado: ${arg}`);
      return res.status(200).json({ ok: true });
    }

    const novoStatus = acao === 'fechar' ? 'cliente' : 'ignored';
    await sbFetch(`/wa_prospects?id=eq.${prospect.id}`, 'PATCH', {
      status: novoStatus, updated_at: new Date().toISOString(),
    }).catch(() => {});

    const emoji = acao === 'fechar' ? '✅' : '⏭';
    const label = acao === 'fechar' ? 'marcado como cliente 🎉' : 'ignorado';
    await alertarRyan(`${emoji} *${prospect.nome}* ${label}`);
    return res.status(200).json({ ok: true });
  }

  if (cmdLower === '/ajuda' || cmdLower === '/help') {
    await alertarRyan(`*Comandos disponíveis:*\n\n/fechar 5519999999999 — marca como cliente\n/pular 5519999999999 — ignora o prospect`);
    return res.status(200).json({ ok: true });
  }

  return res.status(200).json({ ok: true });
}

// ── Detecta resposta automática de bot ────────────────────────────────────────
const PADROES_BOT = [
  'como posso ajudar','como posso te ajudar','como posso lhe ajudar',
  'em que posso ajudar','obrigado por entrar em contato','obrigada por entrar em contato',
  'em breve retornaremos','fora do horário de atendimento','horário de atendimento',
  'atendimento automático','mensagem automática','assistente virtual',
  'nossa equipe entrará em contato','aguarde um momento','transferindo para',
];
function eRespostaAutomatica(texto) {
  const limpo = texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  return PADROES_BOT.some(p => limpo.includes(p.normalize('NFD').replace(/[̀-ͯ]/g, '')));
}

// ── Detecta cumprimento sem conteúdo ─────────────────────────────────────────
const CUMPRIMENTOS = ['oi','olá','ola','bom dia','boa tarde','boa noite','hey','hello','hi','tudo bem','tudo bom','td bem','td bom','e aí','eai','opa'];
function eCumprimento(texto) {
  const limpo = texto.trim().toLowerCase().replace(/[!?.,'-]/g, '').trim();
  if (CUMPRIMENTOS.includes(limpo)) return true;
  const palavras = limpo.split(/\s+/).length;
  if (palavras <= 6 && CUMPRIMENTOS.some(c => limpo.startsWith(c))) return true;
  return false;
}

// ── Classifica intenção com Claude ───────────────────────────────────────────
async function classificar(texto) {
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
          content: `Classifique em uma palavra: INTERESSE, PERGUNTA ou RECUSA.

Contexto: desenvolvedor web mandou WA pra negócio local perguntando se podia mostrar portfólio.

INTERESSE = aceita ver ou quer saber mais (sim, pode, manda, claro, ok, vai lá, me fala, o que você faz, pois não, etc)
PERGUNTA = pergunta específica (quanto custa? como funciona? qual o prazo? tem contrato? etc)
RECUSA = não quer ou responde só com saudação sem pedir nada (não obrigado, já tenho, boa tarde, etc)

Mensagem: "${texto}"

Responda só a palavra:`,
        }],
      }),
    });
    const d = await r.json();
    const txt = (d.content?.[0]?.text || '').trim().toUpperCase();
    if (txt.includes('INTERESSE')) return 'interesse';
    if (txt.includes('PERGUNTA')) return 'pergunta';
    return 'recusa';
  } catch {
    return 'interesse'; // dúvida → alerta Ryan
  }
}

// ── Rate limit em memória ────────────────────────────────────────────────────
const _rateLimitMap = new Map();
function checarRateLimit(num) {
  const agora = Date.now();
  const entry = _rateLimitMap.get(num) || { count: 0, since: agora };
  if (agora - entry.since > 60_000) { entry.count = 0; entry.since = agora; }
  entry.count++;
  _rateLimitMap.set(num, entry);
  return entry.count > 5;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  if (WEBHOOK_SECRET) {
    const secret = req.headers['apikey'] || req.headers['x-webhook-secret'] || req.headers['authorization'];
    if (secret !== WEBHOOK_SECRET) return res.status(401).json({ error: 'unauthorized' });
  }

  try {
    const body = req.body;
    console.log('[webhook]', JSON.stringify(body).slice(0, 300));

    // Mensagens enviadas pelo próprio bot
    if (body?.event === 'send.message') {
      const msgCmd = body?.data;
      if (!msgCmd?.key?.fromMe) return res.status(200).json({ ok: true });
      const textoCmd = (msgCmd?.message?.conversation || msgCmd?.message?.extendedTextMessage?.text || '').trim();
      return processarComandoRyan(textoCmd, res);
    }

    if (body?.event !== 'messages.upsert') return res.status(200).json({ ok: true });

    const msg = body?.data?.messages?.[0] || body?.data;
    if (!msg) return res.status(200).json({ ok: true });

    // Comandos do Ryan (fromMe via upsert)
    if (msg.key?.fromMe) {
      const textoCmd = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || '').trim();
      return processarComandoRyan(textoCmd, res);
    }

    const waNum = msg.key?.remoteJid?.replace('@s.whatsapp.net', '');
    if (!waNum) return res.status(200).json({ ok: true });
    if (checarRateLimit(waNum)) return res.status(200).json({ ok: true });

    // Comando do Ryan pelo celular pessoal
    if (waNum === ALERT_NUM) {
      const textoCmd = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || '').trim();
      return processarComandoRyan(textoCmd, res);
    }

    // Só processa texto
    const tipoMensagem = msg.message ? Object.keys(msg.message)[0] : 'unknown';
    const eMidia = ['imageMessage','videoMessage','audioMessage','stickerMessage','documentMessage'].includes(tipoMensagem);
    const texto = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';

    // Busca prospect ativo
    const prospects = await sbFetch(
      `/wa_prospects?wa_num=eq.${waNum}&status=in.(sent1,sent3,sent2,replied,aguardando_ryan)&select=*&order=sent1_at.desc&limit=1`
    );
    if (!prospects?.length) return res.status(200).json({ ok: true });

    const prospect = prospects[0];

    // Janela de silêncio (22h–08h BRT)
    const brt = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    if (brt.getHours() < 8 || brt.getHours() >= 22) return res.status(200).json({ ok: true });

    // Mídia → alerta Ryan
    if (eMidia) {
      await sbFetch(`/wa_prospects?id=eq.${prospect.id}`, 'PATCH', { status: 'aguardando_ryan', updated_at: new Date().toISOString() }).catch(() => {});
      await alertarRyan(`📎 *${prospect.nome}* enviou mídia\nwa.me/${waNum}`);
      return res.status(200).json({ ok: true });
    }

    // Ignora bots e cumprimentos
    if (eRespostaAutomatica(texto)) return res.status(200).json({ ok: true });
    if (eCumprimento(texto)) return res.status(200).json({ ok: true });

    // Anti-bot: resposta muito rápida na primeira mensagem
    if (prospect.status === 'sent1' || prospect.status === 'sent3') {
      const delayMs = Date.now() - new Date(prospect.sent1_at).getTime();
      if (delayMs < 60000) {
        await sbFetch(`/wa_prospects?id=eq.${prospect.id}`, 'PATCH', { status: 'replied', updated_at: new Date().toISOString() }).catch(() => {});
        return res.status(200).json({ ok: true });
      }
    }

    // Classifica intenção
    const tipo = await classificar(texto);

    if (tipo === 'recusa') {
      await sbFetch(`/wa_prospects?id=eq.${prospect.id}`, 'PATCH', { status: 'ignored', updated_at: new Date().toISOString() }).catch(() => {});
      return res.status(200).json({ ok: true });
    }

    // INTERESSE ou PERGUNTA → alerta Ryan
    await sbFetch(`/wa_prospects?id=eq.${prospect.id}`, 'PATCH', { status: 'aguardando_ryan', updated_at: new Date().toISOString() }).catch(() => {});
    const emoji = tipo === 'interesse' ? '🔥' : '💬';
    await alertarRyan(`${emoji} *${prospect.nome}*\n"${texto}"\n\nwa.me/${waNum}`);

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('wa-webhook error:', err);
    return res.status(200).json({ ok: true });
  }
}
