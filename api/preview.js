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
        'X-Goog-FieldMask': 'displayName,primaryTypeDisplayName,rating,userRatingCount,formattedAddress,nationalPhoneNumber,websiteUri,reviews,photos',
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

    const prompt = `Você é um designer web expert em criar sites profissionais de alto nível para empresas brasileiras.

Crie um site HTML completo e sofisticado para esse negócio real, no mesmo nível de qualidade de um site desenvolvido por um profissional.

DADOS REAIS DO NEGÓCIO:
- Nome: ${dados.nome}
- Segmento: ${dados.categoria}
- Avaliação: ${dados.avaliacao} ⭐ (${dados.numAvaliacoes} avaliações)
- Telefone: ${dados.telefone || 'Não informado'}
- Endereço: ${dados.endereco || 'Não informado'}
${logo ? `- Foto principal do negócio (use APENAS dentro das seções, nunca solta fora de container): ${logo}` : ''}
${reviewsText ? `\nAVALIAÇÕES REAIS:\n${reviewsText}` : ''}${galeriaText}

PALETA DE CORES: ${paletaSugerida}

ESTRUTURA OBRIGATÓRIA (nesta ordem):

1. NAVBAR fixa no topo
   - Logo à esquerda${logo ? ` usando <img src="${logo}" style="height:48px;object-fit:contain">` : ` com nome da empresa`}
   - Links de navegação: Início, Sobre, Serviços, Galeria, Depoimentos, Contato
   - Botão CTA "Fale Conosco" à direita
   - Ao rolar: fundo branco/escuro com sombra
   - Hamburger no mobile

2. HERO (100vh, fundo gradiente escuro com a paleta do segmento)
   - Grid 2 colunas: texto à esquerda, logo/imagem à direita${logo ? ` (<img src="${logo}" com float animation)` : ''}
   - Badge com nome da empresa em letras maiúsculas
   - H1 impactante em maiúsculas com palavra destaque colorida
   - Subtítulo descrevendo o negócio
   - 2 botões: "AGENDAR" (primário) + "VER SERVIÇOS" (outline branco)
   - 3 stats embaixo: número de clientes, anos de experiência, satisfação
   - Grid pattern sutil no fundo (linhas finas)

3. SOBRE (fundo branco)
   - Faixa de números com fundo da cor primária
   - 2 colunas: texto + 4 diferenciais com ícone SVG
   - Título, 2 parágrafos de descrição, telefone clicável

4. SERVIÇOS (fundo cinza claro)
   - Lista clicável à esquerda (6-8 serviços com número e chevron)
   - Painel de detalhe à direita (ícone SVG, título, descrição, botão agendar)
   - Texto de fundo grande "SERVIÇOS" em opacidade baixa

5. GALERIA (fundo branco)
   - Grid de fotos${galeria.length ? ` usando as fotos reais: ${galeria.join(', ')}` : ' com placeholders de cor sólida'}
   - object-fit: cover, altura 260px, border-radius 12px

6. DEPOIMENTOS (fundo cor primária)
   - 3 cards com avaliação, texto e nome${dados.reviews.length ? ' (use as avaliações reais)' : ' (crie depoimentos realistas para o segmento)'}
   - Estrelas ⭐, aspas decorativas

7. CTA FINAL (fundo escuro)
   - Headline chamativa
   - Botão WhatsApp grande verde (#25d366)

8. FOOTER (fundo muito escuro)
   - Logo, endereço, telefone, links

REQUISITOS TÉCNICOS:
- Google Fonts: @import Montserrat (títulos, 700/900) + Open Sans (corpo)
- CSS completo em <style>, responsivo com media queries
- Animações suaves (transitions, hover effects)
- Ícones em SVG inline (sem bibliotecas externas)
- Botão WhatsApp flutuante fixo no canto inferior direito
- NÃO use foto como fundo do hero — use gradiente
- NÃO coloque imagens soltas fora de containers ou seções
- A foto principal só pode aparecer: como logo na navbar OU como imagem dentro do hero (lado direito, dentro de uma div)
- O HTML deve ser COMPLETO — todas as 8 seções devem estar presentes
- Retorne APENAS o HTML completo, sem markdown, sem explicações`;

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 16000,
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
