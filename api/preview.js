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

    const prompt = `Crie um site HTML de apresentação para este negócio. Seja CONCISO no código — use CSS compacto e sem repetições.

NEGÓCIO: ${dados.nome} | ${dados.categoria} | ⭐${dados.avaliacao} (${dados.numAvaliacoes} avaliações)
TELEFONE: ${dados.telefone || ''} | ENDEREÇO: ${dados.endereco || ''}
CORES: ${paletaSugerida}
${reviewsText ? `DEPOIMENTOS REAIS: ${reviewsText}` : ''}
${galeria.length ? `FOTOS GALERIA: ${galeria.slice(0,3).join(' | ')}` : ''}

SEÇÕES (todas obrigatórias, código enxuto):
1. NAVBAR: nome da empresa + links (Sobre, Serviços, Galeria, Depoimentos) + botão WhatsApp
2. HERO: fundo gradiente escuro, título em maiúsculas impactante, subtítulo, botão WhatsApp verde, 3 stats (clientes/anos/satisfação)
3. SOBRE: 2 colunas — texto da empresa + 3 diferenciais com emoji
4. SERVIÇOS: 4 cards em grid com emoji, nome e descrição curta (baseado no segmento ${dados.categoria})
5. GALERIA: grid 3 colunas com ${galeria.length ? 'as fotos reais' : 'placeholders coloridos'}, height 200px, object-fit cover
6. DEPOIMENTOS: 3 cards com ⭐ e texto${dados.reviews.length ? ' (use os reais)' : ''}
7. FOOTER: nome, endereço, telefone, "Site criado por RDCreator"

REGRAS:
- Google Fonts: Montserrat+Open Sans em uma linha de @import
- Botão WhatsApp flutuante fixo (#25d366)
- Responsivo com 1 media query no final
- SEM JavaScript (exceto navbar scroll simples se necessário)
- SEM imagens no hero — apenas texto e gradiente
- Retorne APENAS o HTML, sem explicações`;

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8096,
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
