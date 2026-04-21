const PLACES_KEY = process.env.GOOGLE_PLACES_API_KEY;
const CIDADE_FIXA = 'Campinas SP';
const FIELD_MASK = 'places.id,places.displayName,places.primaryTypeDisplayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.businessStatus,places.googleMapsUri,places.photos';

// Bairros de Campinas com grid de pontos espalhados (lat, lng)
const BAIRROS = {
  'bonfim': [
    [-22.8712, -47.0891], [-22.8745, -47.0923], [-22.8678, -47.0856],
    [-22.8730, -47.0870], [-22.8695, -47.0910],
  ],
  'cambuí': [
    [-22.9012, -47.0589], [-22.9045, -47.0623], [-22.8978, -47.0556],
    [-22.9030, -47.0570], [-22.8995, -47.0610],
  ],
  'centro': [
    [-22.9056, -47.0608], [-22.9080, -47.0580], [-22.9030, -47.0640],
    [-22.9060, -47.0560], [-22.9010, -47.0600],
  ],
  'taquaral': [
    [-22.8820, -47.0620], [-22.8855, -47.0655], [-22.8785, -47.0585],
    [-22.8840, -47.0600], [-22.8800, -47.0640],
  ],
  'barão geraldo': [
    [-22.8190, -47.0697], [-22.8225, -47.0730], [-22.8155, -47.0664],
    [-22.8210, -47.0680], [-22.8175, -47.0715],
  ],
  'nova campinas': [
    [-22.8650, -47.0420], [-22.8685, -47.0455], [-22.8615, -47.0385],
    [-22.8668, -47.0400], [-22.8632, -47.0440],
  ],
  'jardim chapadão': [
    [-22.8540, -47.0780], [-22.8575, -47.0815], [-22.8505, -47.0745],
    [-22.8558, -47.0760], [-22.8522, -47.0800],
  ],
  'vila industrial': [
    [-22.9150, -47.0750], [-22.9185, -47.0785], [-22.9115, -47.0715],
    [-22.9168, -47.0730], [-22.9132, -47.0770],
  ],
  'swift': [
    [-22.9230, -47.0580], [-22.9265, -47.0615], [-22.9195, -47.0545],
    [-22.9248, -47.0560], [-22.9212, -47.0600],
  ],
  'jardim santa genebra': [
    [-22.8780, -47.0450], [-22.8815, -47.0485], [-22.8745, -47.0415],
    [-22.8798, -47.0430], [-22.8762, -47.0470],
  ],
};

// Campinas inteira: grid 3x3 cobrindo a cidade
const GRID_CAMPINAS = [
  [-22.8600, -47.1000], [-22.8600, -47.0600], [-22.8600, -47.0200],
  [-22.9000, -47.1000], [-22.9000, -47.0600], [-22.9000, -47.0200],
  [-22.9400, -47.1000], [-22.9400, -47.0600], [-22.9400, -47.0200],
];

const VARIACOES = {
  'barbearia':   ['barbearia', 'barbeiro', 'barber'],
  'restaurante': ['restaurante', 'culinária'],
  'lanchonete':  ['lanchonete', 'hamburgueria', 'burger'],
  'pizzaria':    ['pizzaria', 'pizza'],
  'salão':       ['salão de beleza', 'cabeleireiro'],
  'academia':    ['academia', 'gym', 'crossfit'],
  'clínica':     ['clínica', 'consultório'],
  'farmácia':    ['farmácia', 'drogaria'],
  'pet':         ['pet shop', 'veterinário'],
  'padaria':     ['padaria', 'panificadora'],
  'mercado':     ['mercado', 'mercearia'],
  'advocacia':   ['advogado', 'advocacia'],
  'imobiliária': ['imobiliária', 'corretor de imóveis'],
  'escola':      ['escola', 'curso'],
  'oficina':     ['oficina', 'mecânico', 'auto center'],
  'dentista':    ['dentista', 'odontologia'],
  'mecânica':    ['mecânica', 'mecânico', 'auto center', 'oficina mecânica'],
};

function gerarVariacoes(query) {
  const q = query.toLowerCase().trim();
  for (const [chave, vars] of Object.entries(VARIACOES)) {
    if (vars.some(v => q.includes(v) || v.includes(q)) || q.includes(chave)) {
      return vars;
    }
  }
  return [query.trim()];
}

function encontrarBairro(bairro) {
  if (!bairro) return null;
  const b = bairro.toLowerCase().trim();
  for (const [nome, pontos] of Object.entries(BAIRROS)) {
    if (b.includes(nome) || nome.includes(b)) return pontos;
  }
  return null;
}

async function buscarPorTexto(query, localidade) {
  const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': PLACES_KEY,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery: `${query} ${localidade}`,
      languageCode: 'pt-BR',
      maxResultCount: 20,
    }),
  });
  const data = await r.json();
  return data.places || [];
}

async function buscarPorGrid(query, pontos) {
  const RAIO = 600; // metros por ponto
  const chamadas = pontos.map(([lat, lng]) =>
    fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': PLACES_KEY,
        'X-Goog-FieldMask': FIELD_MASK,
      },
      body: JSON.stringify({
        textQuery: query,
        languageCode: 'pt-BR',
        maxResultCount: 20,
        locationBias: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: RAIO,
          },
        },
      }),
    }).then(r => r.json()).then(d => d.places || []).catch(() => [])
  );
  const resultados = await Promise.all(chamadas);
  return resultados.flat();
}

const NAO_E_SITE = [
  'instagram.com', 'facebook.com', 'fb.com', 'wa.me', 'whatsapp.com',
  'linktr.ee', 'linktree.com', 'beacons.ai', 'bio.link', 'linkbio',
  'twitter.com', 'x.com', 'tiktok.com', 'youtube.com', 'youtu.be',
  'maps.google.com', 'google.com/maps', 'waze.com',
  'ifood.com.br', 'rappi.com', 'uber.com', 'booking.com', 'tripadvisor',
];

function temSiteProprio(uri) {
  if (!uri) return false;
  return !NAO_E_SITE.some(d => uri.toLowerCase().includes(d));
}

function temWA(phone) {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length === 11 && digits.slice(2).startsWith('9');
}

function mapear(p) {
  const digits = p.nationalPhoneNumber.replace(/\D/g, '');
  const placeId = p.id?.replace(/^places\//, '') || p.id;
  const foto = p.photos?.[0]?.name
    ? `https://places.googleapis.com/v1/${p.photos[0].name}/media?maxWidthPx=200&key=${PLACES_KEY}`
    : null;
  return {
    id: placeId,
    nome: p.displayName?.text || '',
    categoria: p.primaryTypeDisplayName?.text || '',
    endereco: p.formattedAddress || '',
    telefone: p.nationalPhoneNumber || '',
    waNum: `55${digits}`,
    avaliacao: p.rating || null,
    numAvaliacoes: p.userRatingCount || 0,
    mapsUrl: p.googleMapsUri || `https://www.google.com/maps/place/?q=place_id:${placeId}`,
    foto,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { query, bairro } = req.body;
  if (!query?.trim()) return res.status(400).json({ error: 'Query obrigatória' });

  try {
    const variacoes = gerarVariacoes(query.trim());
    const pontosBairro = encontrarBairro(bairro);
    const localidade = bairro?.trim() ? `${bairro.trim()} ${CIDADE_FIXA}` : CIDADE_FIXA;

    let todos = [];

    if (pontosBairro) {
      // Bairro mapeado: grid de pontos por cada variação em paralelo
      const chamadas = variacoes.map(v => buscarPorGrid(v, pontosBairro));
      const resultados = await Promise.all(chamadas);
      todos = resultados.flat();
    } else if (bairro?.trim()) {
      // Bairro não mapeado: text search com variações + grid genérico de Campinas para a variação principal
      const [textResults, gridResults] = await Promise.all([
        Promise.all(variacoes.map(v => buscarPorTexto(v, localidade))).then(r => r.flat()),
        buscarPorGrid(variacoes[0], GRID_CAMPINAS.slice(0, 4)), // 4 pontos do grid geral
      ]);
      todos = [...textResults, ...gridResults];
    } else {
      // Sem bairro: text search com variações + grid completo de Campinas para variação principal
      const [textResults, gridResults] = await Promise.all([
        Promise.all(variacoes.map(v => buscarPorTexto(v, localidade))).then(r => r.flat()),
        buscarPorGrid(variacoes[0], GRID_CAMPINAS),
      ]);
      todos = [...textResults, ...gridResults];
    }

    // Filtra e mapeia
    const filtrados = todos
      .filter(p => !temSiteProprio(p.websiteUri) && p.businessStatus === 'OPERATIONAL' && temWA(p.nationalPhoneNumber))
      .map(mapear);

    // Deduplica por id e ordena por avaliações
    const vistos = new Set();
    const unicos = filtrados
      .filter(p => { if (vistos.has(p.id)) return false; vistos.add(p.id); return true; })
      .sort((a, b) => b.numAvaliacoes - a.numAvaliacoes);

    return res.status(200).json(unicos);
  } catch (err) {
    console.error('buscar-prospects error:', err);
    return res.status(500).json({ error: err.message });
  }
}
