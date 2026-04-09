import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function scrapeGoogleMaps(url) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'pt-BR,pt;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  };

  const res = await fetch(url, { headers });
  const html = await res.text();

  // Extrai dados do HTML do Google Maps
  const nome = html.match(/"([^"]+)","[^"]*","[^"]*",\[\["[^"]*"\]\]/)?.[1]
    || html.match(/class="DUwDvf[^"]*"[^>]*>([^<]+)</)?.[1]
    || html.match(/<title>([^<]+) ·/)?.[1]
    || 'Empresa';

  const avaliacao = html.match(/(\d+[.,]\d+)\s*\(\d+\s*avalia/)?.[1]
    || html.match(/(\d+[.,]\d+).*?star/i)?.[1]
    || '4.5';

  const numAvaliacoes = html.match(/\((\d+(?:\.\d+)?)\s*avalia[çc][õo]es?\)/)?.[1]
    || html.match(/(\d+)\s*reviews/i)?.[1]
    || '0';

  const categoria = html.match(/category":"([^"]+)"/)?.[1]
    || html.match(/\["([^"]+)"\],null,null,null,\[null,null/)?.[1]
    || 'Empresa local';

  const endereco = html.match(/"([^"]+(?:Rua|Av|Avenida|R\.|Al\.|Alameda)[^"]+)"/i)?.[1]
    || '';

  const telefone = html.match(/\+55[\d\s\-\(\)]+/)?.[0]
    || html.match(/\(?\d{2}\)?\s?\d{4,5}[-\s]?\d{4}/)?.[0]
    || '';

  return { nome, avaliacao, numAvaliacoes, categoria, endereco, telefone };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL obrigatória' });

  try {
    // Tenta scraping
    let dados = { nome: 'Sua Empresa', avaliacao: '4.5', numAvaliacoes: '0', categoria: 'Empresa local', endereco: '', telefone: '' };
    try {
      dados = await scrapeGoogleMaps(url);
    } catch {}

    // Gera mockup HTML com Claude
    const prompt = `Você é um designer web especialista. Com base nos dados abaixo de um negócio real, crie um mockup visual em HTML completo de como seria o site desse negócio.

DADOS DO NEGÓCIO:
- Nome: ${dados.nome}
- Categoria: ${dados.categoria}
- Avaliação Google: ${dados.avaliacao} ⭐ (${dados.numAvaliacoes} avaliações)
- Endereço: ${dados.endereco || 'Não informado'}
- Telefone: ${dados.telefone || 'Não informado'}

INSTRUÇÕES:
- Crie um HTML completo e bonito, como se fosse uma proposta de site profissional
- Use cores que combinem com o segmento do negócio
- Inclua seções: Hero com headline impactante, Sobre, Serviços/Cardápio, Avaliações, CTA com botão WhatsApp
- Design moderno, responsivo, com gradientes e tipografia Google Fonts (Inter ou Poppins)
- Mostre as avaliações reais do Google
- No Hero coloque uma headline poderosa relacionada ao segmento
- Adicione um banner no topo: "🎨 PRÉVIA DO SEU FUTURO SITE — criado por RDCreator"
- CSS inline ou em <style> tag no mesmo arquivo
- Retorne APENAS o HTML completo, sem explicações, sem markdown, sem \`\`\``;

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const html = message.content[0].text;

    return res.status(200).json({ html, dados });
  } catch (err) {
    console.error('Preview error:', err);
    return res.status(500).json({ error: err.message });
  }
}
