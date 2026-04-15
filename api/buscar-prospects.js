const PLACES_KEY = process.env.GOOGLE_PLACES_API_KEY;
const CIDADE_FIXA = 'Campinas SP';

async function buscarPagina(query, pageToken) {
  const body = {
    textQuery: `${query} ${CIDADE_FIXA}`,
    languageCode: 'pt-BR',
    maxResultCount: 20,
  };
  if (pageToken) body.pageToken = pageToken;

  const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': PLACES_KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.primaryTypeDisplayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.businessStatus,places.googleMapsUri,places.photos',
    },
    body: JSON.stringify(body),
  });
  return r.json();
}

function temWA(phone) {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  const semDDD = digits.slice(2);
  return digits.length === 11 && semDDD.startsWith('9');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { query } = req.body;
  if (!query?.trim()) return res.status(400).json({ error: 'Query obrigatória' });

  try {
    let todos = [];
    let pageToken = null;

    // Busca até 3 páginas (60 resultados)
    for (let i = 0; i < 3; i++) {
      const data = await buscarPagina(query.trim(), pageToken);
      if (data.places) todos = todos.concat(data.places);
      pageToken = data.nextPageToken || data.next_page_token || null;
      if (!pageToken) break;
      await new Promise(r => setTimeout(r, 500)); // pequena pausa entre páginas
    }

    // Filtra: sem site + ativo + tem celular (WA)
    const semSite = todos
      .filter(p => !p.websiteUri && p.businessStatus === 'OPERATIONAL' && temWA(p.nationalPhoneNumber))
      .map(p => {
        const digits = p.nationalPhoneNumber.replace(/\D/g, '');
        const foto = p.photos?.[0]?.name
          ? `https://places.googleapis.com/v1/${p.photos[0].name}/media?maxWidthPx=200&key=${PLACES_KEY}`
          : null;
        // A nova Places API pode retornar id com prefixo "places/"
        const placeId = p.id?.replace(/^places\//, '') || p.id;
        return {
          id: placeId,
          nome: p.displayName?.text || '',
          categoria: p.primaryTypeDisplayName?.text || '',
          endereco: p.formattedAddress || '',
          telefone: p.nationalPhoneNumber || '',
          waNum: `55${digits}`,
          avaliacao: p.rating || null,
          numAvaliacoes: p.userRatingCount || 0,
          mapsUrl: p.googleMapsUri || `https://www.google.com/maps/place/?q=place_id:${p.id}`,
          foto,
        };
      })
      .sort((a, b) => b.numAvaliacoes - a.numAvaliacoes);

    // Remove duplicados por id
    const vistos = new Set();
    const unicos = semSite.filter(p => {
      if (vistos.has(p.id)) return false;
      vistos.add(p.id);
      return true;
    });

    return res.status(200).json(unicos);
  } catch (err) {
    console.error('buscar-prospects error:', err);
    return res.status(500).json({ error: err.message });
  }
}
