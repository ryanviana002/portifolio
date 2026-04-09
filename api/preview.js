import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function extractFromMaps(url) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'pt-BR,pt;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  };

  // Expande links encurtados
  let finalUrl = url;
  try {
    const r = await fetch(url, { headers, redirect: 'follow' });
    finalUrl = r.url;
  } catch {}

  // Tenta extrair nome da URL expandida
  let nome = '';
  try {
    const match = finalUrl.match(/place\/([^/@]+)/);
    if (match) nome = decodeURIComponent(match[1].replace(/\+/g, ' ')).replace(/\+/g, ' ');
  } catch {}

  // Tenta buscar o HTML
  let html = '';
  try {
    const res = await fetch(finalUrl, { headers });
    html = await res.text();
  } catch {}

  // Extrai dados do HTML
  if (!nome) {
    nome = html.match(/<title>([^<|]+)/)?.[1]?.trim()
      || html.match(/"name":"([^"]+)"/)?.[1]
      || 'Meu Negócio';
  }

  const categoria = html.match(/"category":"([^"]+)"/)?.[1]
    || html.match(/\\"category\\":\\"([^"]+)\\"/)?.[1]
    || '';

  const avaliacao = html.match(/(\d+[.,]\d)\s*\(/)?.[1] || '4.8';
  const numAvaliacoes = html.match(/\((\d[\d.]*)\s*avalia/i)?.[1]
    || html.match(/\((\d+)\)/)?.[1]
    || '0';

  const telefone = html.match(/\+55[\d\s\-\(\)]{10,}/)?.[0]
    || html.match(/\(?\d{2}\)?\s?\d{4,5}[-\s]?\d{4}/)?.[0]
    || '';

  const endereco = html.match(/"vicinity":"([^"]+)"/)?.[1] || '';

  return { nome: nome.replace(/\s*-\s*Google Maps.*/, '').trim(), categoria, avaliacao, numAvaliacoes, telefone, endereco };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL obrigatória' });

  try {
    const dados = await extractFromMaps(url);

    const prompt = `Você é um designer web especialista em criar mockups de sites para pequenas e médias empresas brasileiras.

Com base nos dados abaixo, crie um mockup visual completo em HTML de como seria o site profissional desse negócio.

DADOS DO NEGÓCIO:
- Nome: ${dados.nome}
- Categoria/Segmento: ${dados.categoria || 'negócio local'}
- Avaliação Google: ${dados.avaliacao} ⭐ (${dados.numAvaliacoes} avaliações)
- Telefone: ${dados.telefone || 'Não informado'}
- Endereço: ${dados.endereco || 'Não informado'}

INSTRUÇÕES OBRIGATÓRIAS:
1. Crie um HTML completo com CSS embutido em <style>
2. Use Google Fonts (Inter ou Poppins) via @import
3. Escolha uma paleta de cores que combine com o segmento do negócio
4. Inclua estas seções em ordem:
   - Banner topo: "🎨 PRÉVIA DO SEU FUTURO SITE — criado por RDCreator | ryancreator.dev"
   - Navbar com logo e menu
   - Hero com headline impactante e CTA WhatsApp
   - Sobre a empresa (3 diferenciais com ícones emoji)
   - Serviços/Produtos (3-4 cards)
   - Avaliações Google (mostre a nota ${dados.avaliacao} ⭐ com ${dados.numAvaliacoes} avaliações)
   - CTA final com botão WhatsApp
   - Footer com contato
5. Design moderno, responsivo, profissional
6. Botões WhatsApp verdes (#25d366)
7. Retorne APENAS o HTML completo, sem explicações, sem markdown`;

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const mockupHtml = message.content[0].text
      .replace(/^```html\n?/, '')
      .replace(/\n?```$/, '');

    return res.status(200).json({ html: mockupHtml, dados });
  } catch (err) {
    console.error('Preview error:', err);
    return res.status(500).json({ error: err.message });
  }
}
