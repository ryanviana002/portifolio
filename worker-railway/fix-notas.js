// Corrige notas (tooltip histórico) na coluna Frequência da planilha Discipulos
// GOOGLE_API_KEY=... GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... GOOGLE_REFRESH_TOKEN=... node fix-notas.js

const SHEETS_ID   = '1H9nNzoJUTIKd07eInNR7jSJUj-U5fNyZMzuRg_1Y5qY';
const MEMBERS_ID  = '1j-8XDi2N_5new-zuwnNmkl_-05Pnwry0mwl4N3WIoKc';
const MEMBERS_TAB = 'Discipulos';
const MEMBERS_GID = 0;

const GOOGLE_API_KEY  = process.env.GOOGLE_API_KEY;
const G_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID;
const G_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const G_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

if (!GOOGLE_API_KEY || !G_CLIENT_ID || !G_CLIENT_SECRET || !G_REFRESH_TOKEN) {
  console.error('Variáveis de ambiente faltando.'); process.exit(1);
}

function normNome(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z\s]/g, '').trim();
}
function normTel(s) { return (s || '').replace(/\D/g, '').slice(-8); }
function nomeMatch(a, b) {
  const na = normNome(a), nb = normNome(b);
  return na.split(' ').filter(p => p.length > 2).some(p => nb.includes(p)) ||
         nb.split(' ').filter(p => p.length > 2).some(p => na.includes(p));
}

async function getAccessToken() {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: G_CLIENT_ID, client_secret: G_CLIENT_SECRET,
      refresh_token: G_REFRESH_TOKEN, grant_type: 'refresh_token',
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('OAuth2 falhou: ' + JSON.stringify(data));
  return data.access_token;
}

async function main() {
  // 1. Lê todas as respostas do Forms
  console.log('Lendo Forms...');
  const formsRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_ID}/values/Respostas%20ao%20formul%C3%A1rio%201!A2:E?key=${GOOGLE_API_KEY}`);
  const formsRows = (await formsRes.json()).values || [];

  // Agrupa datas por pessoa (tel + nome)
  const historico = []; // { nome, tel, datas[], primeiraVezDatas[] }
  for (const row of formsRows) {
    const nome       = row[1] || '';
    const tel        = (row[2] || '').replace(/\D/g, '');
    const data       = (row[0] || '').split(' ')[0];
    const primVez    = (row[3] || '').toLowerCase().includes('sim');
    if (!nome || !data) continue;

    const match = historico.find(p => normTel(p.tel) === normTel(tel) && nomeMatch(nome, p.nome));
    if (match) {
      if (!match.datas.includes(data)) match.datas.push(data);
      if (primVez && !match.primeiraVezDatas.includes(data)) match.primeiraVezDatas.push(data);
    } else {
      historico.push({ nome, tel, datas: [data], primeiraVezDatas: primVez ? [data] : [] });
    }
  }
  // Todas as datas únicas de encontros (ordem cronológica)
  const todasDatas = [...new Set(formsRows.filter(r => r[0]).map(r => r[0].split(' ')[0]))].sort((a, b) => {
    const [da,ma,aa] = a.split('/'), [db,mb,ab] = b.split('/');
    return new Date(`${aa}-${ma}-${da}`) - new Date(`${ab}-${mb}-${db}`);
  });
  console.log(`${historico.length} pessoas | ${todasDatas.length} encontros: ${todasDatas.join(', ')}`);

  // 2. Lê membros da planilha
  const token = await getAccessToken();
  const authHdr = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const mRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${MEMBERS_ID}?ranges=${encodeURIComponent(MEMBERS_TAB+'!A6:H')}&fields=sheets.data.rowData.values.userEnteredValue`,
    { headers: authHdr }
  );
  const rowData = (await mRes.json()).sheets?.[0]?.data?.[0]?.rowData || [];
  const membros = rowData.map((row, i) => ({
    rowIndex: 5 + i,
    nome: row.values?.[2]?.userEnteredValue?.stringValue || '',
    tel:  String(row.values?.[3]?.userEnteredValue?.stringValue || row.values?.[3]?.userEnteredValue?.numberValue || ''),
  })).filter(m => m.nome);

  console.log(`${membros.length} membros na planilha.`);

  // 3. Monta requests de nota para cada membro
  const requests = [];
  let aplicadas = 0;

  for (const membro of membros) {
    const h = historico.find(p => normTel(p.tel) === normTel(membro.tel) && nomeMatch(membro.nome, p.nome));
    if (!h) continue;

    const nota = todasDatas.map(d => {
      const foi = h.datas.includes(d);
      const primVez = foi && h.primeiraVezDatas?.includes(d);
      return foi ? `✅ ${d}${primVez ? ' (primeira vez)' : ''}` : `❌ ${d}`;
    }).join('\n');
    requests.push({
      updateCells: {
        rows: [{ values: [{ note: nota }] }],
        fields: 'note',
        range: {
          sheetId: MEMBERS_GID,
          startRowIndex: membro.rowIndex,
          endRowIndex: membro.rowIndex + 1,
          startColumnIndex: 5,
          endColumnIndex: 6,
        },
      },
    });
    aplicadas++;
  }

  if (!requests.length) { console.log('Nenhuma nota para aplicar.'); return; }

  const batchRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${MEMBERS_ID}:batchUpdate`, {
    method: 'POST', headers: authHdr, body: JSON.stringify({ requests }),
  });

  if (!batchRes.ok) { console.error('Erro:', await batchRes.text()); return; }
  console.log(`✅ Notas aplicadas em ${aplicadas} membros.`);
  console.log('Passe o mouse na coluna Frequência para ver o histórico.');
}

main().catch(err => { console.error('Erro:', err.message); process.exit(1); });
