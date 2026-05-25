// Corrige tooltip (nota) da coluna F nas linhas com membros novos sem emoji
// node --env-file=.env.example fix-linhas-erradas.js

const SHEETS_ID   = '1H9nNzoJUTIKd07eInNR7jSJUj-U5fNyZMzuRg_1Y5qY';
const MEMBERS_ID  = '1j-8XDi2N_5new-zuwnNmkl_-05Pnwry0mwl4N3WIoKc';
const MEMBERS_TAB = 'Discipulos';
const MEMBERS_GID = 0;

const GOOGLE_API_KEY  = process.env.GOOGLE_API_KEY;
const G_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID;
const G_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const G_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

const PRIMEIRA_LINHA = 69;
const ULTIMA_LINHA   = 74;

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
    body: new URLSearchParams({ client_id: G_CLIENT_ID, client_secret: G_CLIENT_SECRET, refresh_token: G_REFRESH_TOKEN, grant_type: 'refresh_token' }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('OAuth2 falhou: ' + JSON.stringify(data));
  return data.access_token;
}

async function main() {
  const token = await getAccessToken();
  const authHdr = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  // Lê nome e tel das linhas a corrigir (C=nome, D=tel)
  const mRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${MEMBERS_ID}?ranges=${encodeURIComponent(MEMBERS_TAB+'!C'+PRIMEIRA_LINHA+':D'+ULTIMA_LINHA)}&fields=sheets.data.rowData.values.userEnteredValue`,
    { headers: authHdr }
  );
  const rowData = (await mRes.json()).sheets?.[0]?.data?.[0]?.rowData || [];
  const membros = rowData.map((row, i) => ({
    rowIndex: PRIMEIRA_LINHA - 1 + i,
    nome: row.values?.[0]?.userEnteredValue?.stringValue || '',
    tel:  String(row.values?.[1]?.userEnteredValue?.stringValue || row.values?.[1]?.userEnteredValue?.numberValue || ''),
  })).filter(m => m.nome);
  console.log(`${membros.length} membros para corrigir tooltip`);

  // Lê todas as respostas do Forms
  const formsRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_ID}/values/Respostas%20ao%20formul%C3%A1rio%201!A2:E?key=${GOOGLE_API_KEY}`);
  const formsRows = (await formsRes.json()).values || [];
  const todasDatas = [...new Set(formsRows.filter(r => r[0]).map(r => r[0].split(' ')[0]))]
    .sort((a, b) => { const [da,ma,aa]=a.split('/'), [db,mb,ab]=b.split('/'); return new Date(`${aa}-${ma}-${da}`) - new Date(`${ab}-${mb}-${db}`); });
  console.log(`Datas: ${todasDatas.join(', ')}`);

  const DATA_ALVO = '23/05/2026';

  const requests = membros.map(m => {
    // Novos membros — só foram no encontro de 23/05
    const nota = todasDatas.map(d => (d === DATA_ALVO ? '✅' : '❌') + ' ' + d).join('\n');
    console.log(`  ${m.nome}`);
    return {
      updateCells: {
        rows: [{ values: [{ note: nota }] }],
        fields: 'note',
        range: { sheetId: MEMBERS_GID, startRowIndex: m.rowIndex, endRowIndex: m.rowIndex + 1, startColumnIndex: 5, endColumnIndex: 6 },
      },
    };
  });

  if (!requests.length) { console.log('Nada para corrigir.'); return; }

  const batchRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${MEMBERS_ID}:batchUpdate`, {
    method: 'POST', headers: authHdr, body: JSON.stringify({ requests }),
  });
  if (!batchRes.ok) { console.error('Erro:', await batchRes.text()); return; }
  console.log(`✅ Tooltip corrigido em ${requests.length} membros`);
}

main().catch(err => { console.error('Erro:', err.message); process.exit(1); });
