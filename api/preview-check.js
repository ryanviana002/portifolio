const PLACES_KEY = process.env.GOOGLE_PLACES_API_KEY;

async function extractPlaceId(url) {
  let finalUrl = url;
  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      redirect: 'follow',
    });
    finalUrl = r.url;
  } catch {}

  // Valida se é Google Maps (aceita links mobile, share, short links)
  const isMaps =
    finalUrl.includes('google.com/maps') ||
    finalUrl.includes('maps.google.com') ||
    finalUrl.includes('maps.app.goo.gl') ||
    finalUrl.includes('goo.gl/maps') ||
    finalUrl.includes('g.co/kgs') ||
    url.includes('g.co/kgs') ||
    url.includes('maps.app.goo.gl') ||
    url.includes('goo.gl/maps');
  if (!isMaps) {
    return { error: 'not_maps' };
  }

  const placeIdMatch = finalUrl.match(/place_id=([^&]+)/);
  if (placeIdMatch) return { placeId: placeIdMatch[1] };

  // CID (Google Share links: ?cid=XXXXX)
  const cidMatch = finalUrl.match(/[?&]cid=(\d+)/);
  if (cidMatch) {
    const placeId = await searchPlaceByCid(cidMatch[1]);
    return placeId ? { placeId } : { error: 'not_found' };
  }

  const nameMatch = finalUrl.match(/place\/([^/@?]+)/);
  if (nameMatch) {
    const nome = decodeURIComponent(nameMatch[1].replace(/\+/g, ' '));
    const placeId = await searchPlaceByName(nome);
    return placeId ? { placeId } : { error: 'not_found' };
  }

  const coordMatch = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coordMatch) {
    const placeId = await searchPlaceByCoords(coordMatch[1], coordMatch[2]);
    return placeId ? { placeId } : { error: 'not_found' };
  }

  return { error: 'not_found' };
}

async function searchPlaceByCid(cid) {
  // Busca por CID usando Places API text search
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': PLACES_KEY,
      'X-Goog-FieldMask': 'places.id',
    },
    body: JSON.stringify({ textQuery: `cid:${cid}`, languageCode: 'pt-BR' }),
  });
  const data = await res.json();
  return data.places?.[0]?.id || null;
}

async function searchPlaceByName(name) {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': PLACES_KEY,
      'X-Goog-FieldMask': 'places.id',
    },
    body: JSON.stringify({ textQuery: name, languageCode: 'pt-BR' }),
  });
  const data = await res.json();
  return data.places?.[0]?.id || null;
}

async function searchPlaceByCoords(lat, lng) {
  const res = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
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
  });
  const data = await res.json();
  return data.places?.[0]?.id || null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL obrigatória' });

  try {
    const result = await extractPlaceId(url);

    if (result.error === 'not_maps') {
      return res.status(400).json({ error: 'Link inválido. Cole o link do Google Maps do seu negócio.' });
    }
    if (result.error === 'not_found') {
      return res.status(400).json({ error: 'Negócio não encontrado. Verifique o link e tente novamente.' });
    }

    const placeRes = await fetch(
      `https://places.googleapis.com/v1/places/${result.placeId}?languageCode=pt-BR`,
      {
        headers: {
          'X-Goog-Api-Key': PLACES_KEY,
          'X-Goog-FieldMask': 'displayName,primaryTypeDisplayName,rating,userRatingCount,formattedAddress,photos',
        },
      }
    );
    const place = await placeRes.json();
    if (place.error) return res.status(400).json({ error: 'Negócio não encontrado.' });

    const foto = place.photos?.[0]
      ? `https://places.googleapis.com/v1/${place.photos[0].name}/media?maxWidthPx=400&key=${PLACES_KEY}`
      : null;

    return res.status(200).json({
      placeId: result.placeId,
      nome: place.displayName?.text || 'Meu Negócio',
      categoria: place.primaryTypeDisplayName?.text || 'Empresa local',
      avaliacao: place.rating?.toFixed(1) || null,
      numAvaliacoes: place.userRatingCount || 0,
      endereco: place.formattedAddress || '',
      foto,
    });
  } catch (err) {
    console.error('Preview-check error:', err);
    return res.status(500).json({ error: 'Erro ao verificar o link.' });
  }
}
