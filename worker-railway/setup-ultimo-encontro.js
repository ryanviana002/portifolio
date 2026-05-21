// Insere coluna G "ÚLTIMO ENCONTRO" entre F e G atual
// Preenche SIM/NÃO baseado no encontro mais recente do Forms
// node --env-file=.env.example setup-ultimo-encontro.js

const SHEETS_ID   = '1H9nNzoJUTIKd07eInNR7jSJUj-U5fNyZMzuRg_1Y5qY';
const MEMBERS_ID  = '1j-8XDi2N_5new-zuwnNmkl_-05Pnwry0mwl4N3WIoKc';
const MEMBERS_TAB = 'Discipulos';
const MEMBERS_GID = 0;

const GOOGLE_API_KEY  = process.env.GOOGLE_API_KEY;
const G_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID;
const G_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const G_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

const rgb = (r, g, b) => ({ red: r/255, green: g/255, blue: b/255 });
const WHITE    = rgb(255, 255, 255);
const VERDE    = rgb(22, 163, 74);
const VERMELHO = rgb(220, 38, 38);
const AZUL_ESCURO = rgb(25, 60, 100);
const AZUL_MEDIO  = rgb(41, 98, 155);

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

  // 1. Lê Forms — pega data do último encontro e quem foi
  console.log('Lendo Forms...');
  const formsRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_ID}/values/Respostas%20ao%20formul%C3%A1rio%201!A2:E?key=${GOOGLE_API_KEY}`);
  const formsRows = (await formsRes.json()).values || [];
  const ultimaData = formsRows.filter(r => r[0]).map(r => r[0].split(' ')[0]).pop();
  const doUltimo = formsRows.filter(r => r[0] && r[0].split(' ')[0] === ultimaData);
  console.log(`Último encontro: ${ultimaData} — ${doUltimo.length} presentes`);

  // 2. Lê membros
  const mRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${MEMBERS_ID}?ranges=${encodeURIComponent(MEMBERS_TAB+'!A6:I')}&fields=sheets.data.rowData.values.userEnteredValue`, { headers: authHdr });
  const rowData = (await mRes.json()).sheets?.[0]?.data?.[0]?.rowData || [];
  const membros = rowData.map((row, i) => ({
    rowIndex: 5 + i,
    nome: row.values?.[2]?.userEnteredValue?.stringValue || '',
    tel:  String(row.values?.[3]?.userEnteredValue?.stringValue || row.values?.[3]?.userEnteredValue?.numberValue || ''),
  })).filter(m => m.nome);
  console.log(`${membros.length} membros`);

  const requests = [];

  // 3. Inserir coluna G (índice 6) — empurra Sistema, HG, C17 para H, I, J
  requests.push({
    insertDimension: {
      range: { sheetId: MEMBERS_GID, dimension: 'COLUMNS', startIndex: 6, endIndex: 7 },
      inheritFromBefore: false,
    },
  });

  // 4. Cabeçalho linha 4 (idx 3) — responsável da nova coluna G = "Digo"
  requests.push({
    updateCells: {
      range: { sheetId: MEMBERS_GID, startRowIndex: 3, endRowIndex: 4, startColumnIndex: 6, endColumnIndex: 7 },
      rows: [{ values: [{
        userEnteredValue: { stringValue: 'Digo' },
        userEnteredFormat: {
          backgroundColor: AZUL_MEDIO,
          textFormat: { foregroundColor: WHITE, bold: false, fontSize: 9, italic: true },
          horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE',
        },
      }] }],
      fields: 'userEnteredValue,userEnteredFormat',
    },
  });

  // 5. Cabeçalho linha 5 (idx 4) — "ÚLTIMO ENCONTRO"
  requests.push({
    updateCells: {
      range: { sheetId: MEMBERS_GID, startRowIndex: 4, endRowIndex: 5, startColumnIndex: 6, endColumnIndex: 7 },
      rows: [{ values: [{
        userEnteredValue: { stringValue: 'ÚLTIMO\nENCONTRO' },
        userEnteredFormat: {
          backgroundColor: AZUL_ESCURO,
          textFormat: { foregroundColor: WHITE, bold: true, fontSize: 10 },
          horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE',
          wrapStrategy: 'WRAP',
        },
      }] }],
      fields: 'userEnteredValue,userEnteredFormat',
    },
  });

  // 6. Preenche SIM/NÃO para cada membro
  for (const membro of membros) {
    const foiNoUltimo = doUltimo.some(r => {
      const telForm = (r[2] || '').replace(/\D/g, '');
      return normTel(membro.tel) === normTel(telForm) && nomeMatch(r[1] || '', membro.nome);
    });
    requests.push({
      updateCells: {
        range: { sheetId: MEMBERS_GID, startRowIndex: membro.rowIndex, endRowIndex: membro.rowIndex+1, startColumnIndex: 6, endColumnIndex: 7 },
        rows: [{ values: [{
          userEnteredValue: { stringValue: foiNoUltimo ? 'SIM' : 'NÃO' },
          userEnteredFormat: {
            textFormat: { bold: true, fontSize: 10 },
            horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE',
          },
        }] }],
        fields: 'userEnteredValue,userEnteredFormat',
      },
    });
  }

  // 7. Dropdown SIM/NÃO na nova coluna G
  requests.push({
    setDataValidation: {
      range: { sheetId: MEMBERS_GID, startRowIndex: 5, endRowIndex: 200, startColumnIndex: 6, endColumnIndex: 7 },
      rule: {
        condition: { type: 'ONE_OF_LIST', values: [{ userEnteredValue: 'SIM' }, { userEnteredValue: 'NÃO' }] },
        showCustomUi: true, strict: false,
      },
    },
  });

  // 8. Formatação condicional SIM/NÃO na nova coluna G
  const fmtRange = { sheetId: MEMBERS_GID, startRowIndex: 5, endRowIndex: 200, startColumnIndex: 6, endColumnIndex: 7 };
  requests.push(
    { addConditionalFormatRule: { rule: { ranges: [fmtRange], booleanRule: { condition: { type: 'BLANK' }, format: { backgroundColor: WHITE } } }, index: 0 } },
    { addConditionalFormatRule: { rule: { ranges: [fmtRange], booleanRule: { condition: { type: 'TEXT_EQ', values: [{ userEnteredValue: 'SIM' }] }, format: { backgroundColor: VERDE, textFormat: { foregroundColor: WHITE, bold: true } } } }, index: 1 } },
    { addConditionalFormatRule: { rule: { ranges: [fmtRange], booleanRule: { condition: { type: 'TEXT_EQ', values: [{ userEnteredValue: 'NÃO' }] }, format: { backgroundColor: VERMELHO, textFormat: { foregroundColor: WHITE, bold: true } } } }, index: 2 } }
  );

  // 9. Largura da nova coluna G
  requests.push({
    updateDimensionProperties: {
      range: { sheetId: MEMBERS_GID, dimension: 'COLUMNS', startIndex: 6, endIndex: 7 },
      properties: { pixelSize: 120 },
      fields: 'pixelSize',
    },
  });

  const batchRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${MEMBERS_ID}:batchUpdate`, {
    method: 'POST', headers: authHdr, body: JSON.stringify({ requests }),
  });
  if (!batchRes.ok) { console.error('Erro:', await batchRes.text()); return; }
  console.log('✅ Coluna G "ÚLTIMO ENCONTRO" inserida e preenchida');
  console.log('   Sistema → H | Grupo HG → I | Grupo C17 → J');
}

main().catch(err => { console.error('Erro:', err.message); process.exit(1); });
