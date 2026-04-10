import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const PLACES_KEY = process.env.GOOGLE_PLACES_API_KEY;

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
        'X-Goog-FieldMask': 'displayName,primaryTypeDisplayName,rating,userRatingCount,formattedAddress,nationalPhoneNumber,websiteUri,regularOpeningHours,reviews',
      },
    }
  );
  return await res.json();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

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
    };

    // Gera mockup com Claude
    const reviewsText = dados.reviews.length
      ? dados.reviews.map(r => `- ${r.autor} (${r.nota}⭐): "${r.texto.slice(0, 120)}"`).join('\n')
      : '';

    const prompt = `Você é um designer web especialista em criar sites profissionais para pequenas e médias empresas brasileiras.

Crie um mockup visual completo em HTML de como seria o site profissional desse negócio real.

DADOS REAIS DO NEGÓCIO (Google Maps):
- Nome: ${dados.nome}
- Segmento: ${dados.categoria}
- Avaliação: ${dados.avaliacao} ⭐ (${dados.numAvaliacoes} avaliações no Google)
- Telefone: ${dados.telefone || 'Não informado'}
- Endereço: ${dados.endereco || 'Não informado'}
${reviewsText ? `\nAVALIAÇÕES REAIS:\n${reviewsText}` : ''}

INSTRUÇÕES:
1. HTML completo com CSS em <style> e Google Fonts (@import Inter ou Poppins)
2. Paleta de cores adequada ao segmento: ${dados.categoria}
3. Seções obrigatórias:
   - Banner topo rosa: "🎨 PRÉVIA DO SEU FUTURO SITE — RDCreator | ryancreator.dev"
   - Navbar com nome da empresa
   - Hero impactante com headline relacionada ao segmento e botão WhatsApp verde
   - Sobre (3 diferenciais com emojis)
   - Serviços (4 cards com ícones emojis, baseados no segmento)
   - Avaliações Google (use as avaliações reais se disponíveis, senão crie 3 fictícias realistas)
   - CTA final com botão WhatsApp
   - Footer com endereço e telefone reais
4. Design moderno, responsivo (mobile-first)
5. Botões WhatsApp: background #25d366, cor branca
6. Retorne APENAS o HTML, sem markdown, sem explicações`;

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
