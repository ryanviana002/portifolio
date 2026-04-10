import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const PLACES_KEY = process.env.GOOGLE_PLACES_API_KEY;

// Rate limit: 3 gerações por IP por dia
const rateLimitMap = new Map();
const LIMIT = 3;

function checkRateLimit(ip) {
  const today = new Date().toISOString().slice(0, 10); // "2026-04-09"
  const key = `${ip}:${today}`;
  const count = rateLimitMap.get(key) || 0;
  if (count >= LIMIT) return false;
  rateLimitMap.set(key, count + 1);
  // Limpa entradas antigas (evita memory leak)
  if (rateLimitMap.size > 5000) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    for (const k of rateLimitMap.keys()) {
      if (k.includes(yesterday)) rateLimitMap.delete(k);
    }
  }
  return true;
}

async function extractPlaceId(url) {
  // Expande links encurtados
  let finalUrl = url;
  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      redirect: 'follow',
    });
    finalUrl = r.url;
  } catch {}

  // Tenta extrair place ID da URL
  const placeIdMatch = finalUrl.match(/place_id=([^&]+)/);
  if (placeIdMatch) return placeIdMatch[1];

  // Tenta extrair o nome do lugar da URL para buscar via Text Search
  const nameMatch = finalUrl.match(/place\/([^/@]+)/);
  if (nameMatch) {
    const nome = decodeURIComponent(nameMatch[1].replace(/\+/g, ' '));
    return await searchPlaceByName(nome);
  }

  // Tenta extrair coordenadas para busca por nearby
  const coordMatch = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coordMatch) {
    return await searchPlaceByCoords(coordMatch[1], coordMatch[2]);
  }

  return null;
}

async function searchPlaceByName(name) {
  const res = await fetch(
    `https://places.googleapis.com/v1/places:searchText`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': PLACES_KEY,
        'X-Goog-FieldMask': 'places.id',
      },
      body: JSON.stringify({ textQuery: name, languageCode: 'pt-BR' }),
    }
  );
  const data = await res.json();
  return data.places?.[0]?.id || null;
}

async function searchPlaceByCoords(lat, lng) {
  const res = await fetch(
    `https://places.googleapis.com/v1/places:searchNearby`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': PLACES_KEY,
        'X-Goog-FieldMask': 'places.id',
      },
      body: JSON.stringify({
        locationRestriction: {
          circle: { center: { latitude: parseFloat(lat), longitude: parseFloat(lng) }, radius: 50 },
        },
        maxResultCount: 1,
      }),
    }
  );
  const data = await res.json();
  return data.places?.[0]?.id || null;
}

async function getPlaceDetails(placeId) {
  const res = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}?languageCode=pt-BR`,
    {
      headers: {
        'X-Goog-Api-Key': PLACES_KEY,
        'X-Goog-FieldMask': 'displayName,primaryTypeDisplayName,rating,userRatingCount,formattedAddress,nationalPhoneNumber,websiteUri,reviews,photos',
      },
    }
  );
  return await res.json();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Rate limit desativado para testes
  // const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  // if (!checkRateLimit(ip)) {
  //   return res.status(429).json({ error: 'Limite de 3 prévias por dia atingido. Volte amanhã ou fale com a gente pelo WhatsApp!' });
  // }

  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL obrigatória' });

  try {
    // Busca Place ID
    const placeId = await extractPlaceId(url);
    if (!placeId) throw new Error('Não foi possível identificar o negócio. Verifique o link do Google Maps.');

    // Busca detalhes do lugar
    const place = await getPlaceDetails(placeId);
    if (place.error) throw new Error(place.error.message);

    const dados = {
      nome: place.displayName?.text || 'Meu Negócio',
      categoria: place.primaryTypeDisplayName?.text || 'Empresa local',
      avaliacao: place.rating?.toFixed(1) || '5.0',
      numAvaliacoes: place.userRatingCount || 0,
      telefone: place.nationalPhoneNumber || '',
      endereco: place.formattedAddress || '',
      site: place.websiteUri || '',
      reviews: place.reviews?.slice(0, 3).map(r => ({
        autor: r.authorAttribution?.displayName || 'Cliente',
        nota: r.rating,
        texto: r.text?.text || '',
      })) || [],
      fotos: place.photos?.slice(0, 5).map(p =>
        `https://places.googleapis.com/v1/${p.name}/media?maxWidthPx=800&key=${PLACES_KEY}`
      ) || [],
    };

    const logo = dados.fotos[0] || null;
    const galeria = dados.fotos.slice(1);

    // Gera mockup com Claude
    const reviewsText = dados.reviews.length
      ? dados.reviews.map(r => `- ${r.autor} (${r.nota}⭐): "${r.texto.slice(0, 120)}"`).join('\n')
      : '';

    const galeriaText = galeria.length
      ? `\nFOTOS PARA GALERIA (use como src):\n${galeria.map((f, i) => `Foto ${i + 1}: ${f}`).join('\n')}`
      : '';

    const paletasPorSegmento = {
      'concessionária': 'preto, cinza escuro e vermelho — elegante e premium',
      'restaurante': 'tons quentes, laranja e marrom — acolhedor e apetitoso',
      'lanchonete': 'vermelho e amarelo vibrante — energético e apetitoso',
      'pizzaria': 'vermelho e verde — italiano e tradicional',
      'salão de beleza': 'rosa e dourado — feminino e sofisticado',
      'barbearia': 'preto e dourado — masculino e premium',
      'academia': 'preto e laranja neon — energia e força',
      'clínica': 'azul claro e branco — clean e confiável',
      'farmácia': 'verde e branco — saúde e confiança',
      'advocacia': 'azul marinho e dourado — sério e profissional',
      'imobiliária': 'azul e cinza — confiável e moderno',
      'pet shop': 'verde e amarelo — divertido e amigável',
      'padaria': 'marrom e bege — quente e artesanal',
    };
    const categoriaLower = dados.categoria.toLowerCase();
    const paletaSugerida = Object.entries(paletasPorSegmento).find(([k]) => categoriaLower.includes(k))?.[1]
      || 'cores modernas e profissionais adequadas ao segmento';

    const ctx = `NEGÓCIO: ${dados.nome} | ${dados.categoria} | ⭐${dados.avaliacao} (${dados.numAvaliacoes} avaliações) | TEL: ${dados.telefone || ''} | END: ${dados.endereco || ''} | CORES: ${paletaSugerida}`;

    const prompt1 = `Você é um dev web. Gere APENAS a primeira metade de um site HTML para este negócio.

${ctx}

Gere exatamente estas seções com CSS inline no <style>:
1. <!DOCTYPE html><html><head> com @import Montserrat+Open Sans, reset CSS, variáveis de cor
2. NAVBAR fixa: nome da empresa bold à esquerda + links (Sobre,Serviços,Galeria,Depoimentos) + botão WhatsApp verde
3. HERO: fundo gradiente escuro, h1 maiúsculas impactante com palavra colorida, subtítulo, botão WhatsApp verde, 3 stats (clientes/anos/satisfação)
4. SOBRE: 2 colunas — parágrafo sobre a empresa + 3 diferenciais com emoji e texto curto

IMPORTANTE: Termine em </section> após o Sobre. NÃO feche </body> nem </html>. Retorne APENAS o HTML sem explicações.`;

    const prompt2 = `Você é um dev web. Gere APENAS a segunda metade de um site HTML para este negócio.

${ctx}
${reviewsText ? `DEPOIMENTOS REAIS: ${reviewsText}` : ''}
${galeria.length ? `FOTOS: ${galeria.slice(0,3).join(' | ')}` : ''}

Gere exatamente estas seções (sem <html><head><body> — apenas as sections e o fechamento):
1. SERVIÇOS: 4 cards em grid com emoji, nome e descrição curta para ${dados.categoria}
2. GALERIA: grid 3 colunas, ${galeria.length ? 'use as fotos reais com <img src="..." style="width:100%;height:200px;object-fit:cover;border-radius:8px">' : 'placeholders coloridos height:200px'}, sem texto
3. DEPOIMENTOS: 3 cards com ⭐ e texto curto ${dados.reviews.length ? '(use os reais)' : '(crie realistas)'}
4. FOOTER: fundo escuro, nome da empresa, endereço, telefone, "Site criado por RDCreator | ryancreator.dev"
5. Botão WhatsApp flutuante fixo bottom:24px right:24px cor #25d366
6. Feche com </body></html>

CSS das novas seções no <style> no início desta parte. Retorne APENAS o HTML sem explicações.`;

    // Executa as 2 chamadas em paralelo
    const [msg1, msg2] = await Promise.all([
      client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt1 }],
      }),
      client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt2 }],
      }),
    ]);

    const parte1 = msg1.content[0].text.replace(/^```html\n?/, '').replace(/\n?```$/, '');
    const parte2 = msg2.content[0].text.replace(/^```html\n?/, '').replace(/\n?```$/, '');

    // Remove o fechamento </body></html> da parte1 se existir, e junta
    const parte1Clean = parte1.replace(/<\/body>\s*<\/html>\s*$/i, '');
    const mockupHtml = parte1Clean + '\n' + parte2;

    return res.status(200).json({ html: mockupHtml, dados });
  } catch (err) {
    console.error('Preview error:', err);
    return res.status(500).json({ error: err.message });
  }
}
