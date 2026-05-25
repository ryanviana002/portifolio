// Recalcula frequência de todos os membros baseado no Forms (fonte da verdade)
// node --env-file=.env.example fix-frequencia.js

const SHEETS_ID   = '1H9nNzoJUTIKd07eInNR7jSJUj-U5fNyZMzuRg_1Y5qY';
const MEMBERS_ID  = '1j-8XDi2N_5new-zuwnNmkl_-05Pnwry0mwl4N3WIoKc';
const MEMBERS_TAB = 'Discipulos';
const MEMBERS_GID = 0;

const GOOGLE_API_KEY  = process.env.GOOGLE_API_KEY;
const G_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID;
const G_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const G_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

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

  // 1. Lê todas as respostas do Forms
  console.log('Lendo Forms...');
  const formsRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_ID}/values/Respostas%20ao%20formul%C3%A1rio%201!A2:E?key=${GOOGLE_API_KEY}`);
  const formsRows = (await formsRes.json()).values || [];

  // Agrupa presenças únicas por pessoa (data única por pessoa)
  const historico = [];
  for (const row of formsRows) {
    const nome = row[1] || '';
    const tel  = (row[2] || '').replace(/\D/g, '');
    const data = (row[0] || '').split(' ')[0];
    if (!nome || !data) continue;
    const match = historico.find(p => normTel(p.tel) === normTel(tel) && nomeMatch(nome, p.nome));
    if (match) { if (!match.datas.includes(data)) match.datas.push(data); }
    else historico.push({ nome, tel, datas: [data] });
  }
  console.log(`${historico.length} pessoas no Forms`);

  // 2. Lê membros da planilha
  const mRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${MEMBERS_ID}?ranges=${encodeURIComponent(MEMBERS_TAB+'!A6:H')}&fields=sheets.data.rowData.values.userEnteredValue`,
    { headers: authHdr }
  );
  const rowData = (await mRes.json()).sheets?.[0]?.data?.[0]?.rowData || [];
  const membros = rowData.map((row, i) => ({
    rowIndex: 5 + i,
    nome: row.values?.[2]?.userEnteredValue?.stringValue || '',
    tel:  String(row.values?.[3]?.userEnteredValue?.stringValue || row.values?.[3]?.userEnteredValue?.numberValue || ''),
    freqAtual: row.values?.[5]?.userEnteredValue?.numberValue || 0,
  })).filter(m => m.nome);
  console.log(`${membros.length} membros na planilha`);

  // 3. Calcula frequência correta e monta updates
  const requests = [];
  let corrigidos = 0;

  for (const membro of membros) {
    const h = historico.find(p => normTel(p.tel) === normTel(membro.tel) && nomeMatch(membro.nome, p.nome));
    const freqCorreta = h ? h.datas.length : 0;

    if (freqCorreta !== membro.freqAtual) {
      console.log(`  ${membro.nome}: ${membro.freqAtual} → ${freqCorreta}`);
      requests.push({
        updateCells: {
          rows: [{ values: [{ userEnteredValue: { numberValue: freqCorreta } }] }],
          fields: 'userEnteredValue',
          range: { sheetId: MEMBERS_GID, startRowIndex: membro.rowIndex, endRowIndex: membro.rowIndex + 1, startColumnIndex: 5, endColumnIndex: 6 },
        },
      });
      corrigidos++;
    }
  }

  if (!requests.length) { console.log('Nenhuma frequência incorreta encontrada.'); return; }

  const batchRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${MEMBERS_ID}:batchUpdate`, {
    method: 'POST', headers: authHdr, body: JSON.stringify({ requests }),
  });
  if (!batchRes.ok) { console.error('Erro:', await batchRes.text()); return; }
  console.log(`✅ Frequência corrigida em ${corrigidos} membros`);
}

main().catch(err => { console.error('Erro:', err.message); process.exit(1); });
