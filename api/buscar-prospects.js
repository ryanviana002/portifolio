const PLACES_KEY = process.env.GOOGLE_PLACES_API_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { query } = req.body;
  if (!query?.trim()) return res.status(400).json({ error: 'Query obrigatória' });

  try {
    const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': PLACES_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.primaryTypeDisplayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.businessStatus,places.googleMapsUri',
      },
      body: JSON.stringify({
        textQuery: query.trim(),
        languageCode: 'pt-BR',
        maxResultCount: 20,
      }),
    });

    const data = await r.json();
    if (!data.places) return res.status(200).json([]);

    // Filtra sem site + negócio ativo, ordena por nº de avaliações (mais estabelecidos primeiro)
    const semSite = data.places
      .filter(p => !p.websiteUri && p.businessStatus === 'OPERATIONAL')
      .map(p => ({
        id: p.id,
        nome: p.displayName?.text || '',
        categoria: p.primaryTypeDisplayName?.text || '',
        endereco: p.formattedAddress || '',
        telefone: p.nationalPhoneNumber || '',
        avaliacao: p.rating || null,
        numAvaliacoes: p.userRatingCount || 0,
        mapsUrl: p.googleMapsUri || `https://www.google.com/maps/place/?q=place_id:${p.id}`,
      }))
      .sort((a, b) => b.numAvaliacoes - a.numAvaliacoes);

    return res.status(200).json(semSite);
  } catch (err) {
    console.error('buscar-prospects error:', err);
    return res.status(500).json({ error: err.message });
  }
}
