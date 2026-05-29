// Setup: nomes em maiúsculo, SIM/NÃO, dropdown nas colunas G H I
// GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... GOOGLE_REFRESH_TOKEN=... GOOGLE_API_KEY=... node setup-uppercase-dropdown.js

const MEMBERS_ID  = '1j-8XDi2N_5new-zuwnNmkl_-05Pnwry0mwl4N3WIoKc';
const MEMBERS_TAB = 'Discipulos';
const MEMBERS_GID = 0;

const GOOGLE_API_KEY  = process.env.GOOGLE_API_KEY;
const G_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID;
const G_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const G_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

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

  // 1. Lê todos os dados atuais (C=NOME, G=Sistema, H=HG, I=C17)
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${MEMBERS_ID}?ranges=${encodeURIComponent(MEMBERS_TAB+'!A6:I')}&fields=sheets.data.rowData.values.userEnteredValue`, { headers: authHdr });
  const rowData = (await res.json()).sheets?.[0]?.data?.[0]?.rowData || [];

  const updateRequests = [];

  rowData.forEach((row, i) => {
    const rowIndex = 5 + i;
    const nome = row.values?.[2]?.userEnteredValue?.stringValue;
    const sistema = row.values?.[6]?.userEnteredValue?.stringValue;
    const grupoHG = row.values?.[7]?.userEnteredValue?.stringValue;
    const grupoC17 = row.values?.[8]?.userEnteredValue?.stringValue;

    // Nome → MAIÚSCULO
    if (nome) {
      updateRequests.push({ updateCells: {
        rows: [{ values: [{ userEnteredValue: { stringValue: nome.trim().toUpperCase() } }] }],
        fields: 'userEnteredValue',
        range: { sheetId: MEMBERS_GID, startRowIndex: rowIndex, endRowIndex: rowIndex+1, startColumnIndex: 2, endColumnIndex: 3 },
      }});
    }

    // Sistema → SIM/NÃO
    if (sistema) {
      const val = sistema.toLowerCase().includes('sim') ? 'SIM' : 'NÃO';
      updateRequests.push({ updateCells: {
        rows: [{ values: [{ userEnteredValue: { stringValue: val } }] }],
        fields: 'userEnteredValue',
        range: { sheetId: MEMBERS_GID, startRowIndex: rowIndex, endRowIndex: rowIndex+1, startColumnIndex: 6, endColumnIndex: 7 },
      }});
    }

    // Grupo HG → SIM/NÃO
    if (grupoHG) {
      const val = grupoHG.toLowerCase().includes('sim') ? 'SIM' : 'NÃO';
      updateRequests.push({ updateCells: {
        rows: [{ values: [{ userEnteredValue: { stringValue: val } }] }],
        fields: 'userEnteredValue',
        range: { sheetId: MEMBERS_GID, startRowIndex: rowIndex, endRowIndex: rowIndex+1, startColumnIndex: 7, endColumnIndex: 8 },
      }});
    }

    // Grupo C17 → SIM/NÃO
    if (grupoC17) {
      const val = grupoC17.toLowerCase().includes('sim') ? 'SIM' : 'NÃO';
      updateRequests.push({ updateCells: {
        rows: [{ values: [{ userEnteredValue: { stringValue: val } }] }],
        fields: 'userEnteredValue',
        range: { sheetId: MEMBERS_GID, startRowIndex: rowIndex, endRowIndex: rowIndex+1, startColumnIndex: 8, endColumnIndex: 9 },
      }});
    }
  });

  // 2. Dropdown de validação para G, H, I (Sistema, Grupo HG, Grupo C17)
  const dropdownRange = { sheetId: MEMBERS_GID, startRowIndex: 5, endRowIndex: 1000, startColumnIndex: 6, endColumnIndex: 9 };
  updateRequests.push({ setDataValidation: {
    range: dropdownRange,
    rule: {
      condition: { type: 'ONE_OF_LIST', values: [{ userEnteredValue: 'SIM' }, { userEnteredValue: 'NÃO' }] },
      showCustomUi: true,
      strict: false,
    },
  }});

  // 3. Atualiza formatação condicional para SIM/NÃO
  // Primeiro remove regras existentes na faixa
  const getSheet = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${MEMBERS_ID}?fields=sheets.conditionalFormats`, { headers: authHdr });
  const sheetData = await getSheet.json();
  const existingRules = sheetData.sheets?.[0]?.conditionalFormats || [];
  existingRules.forEach((_, idx) => {
    updateRequests.unshift({ deleteConditionalFormatRule: { sheetId: MEMBERS_GID, index: 0 } });
  });

  // Adiciona regras novas com SIM/NÃO
  const fmtRange = { sheetId: MEMBERS_GID, startRowIndex: 5, endRowIndex: 1000, startColumnIndex: 6, endColumnIndex: 9 };
  const verde    = { red: 0.204, green: 0.659, blue: 0.325 };
  const branco   = { red: 1, green: 1, blue: 1 };
  const vermelho = { red: 0.796, green: 0.196, blue: 0.196 };

  updateRequests.push(
    { addConditionalFormatRule: { rule: { ranges: [fmtRange], booleanRule: { condition: { type: 'BLANK' }, format: { backgroundColor: branco } } }, index: 0 } },
    { addConditionalFormatRule: { rule: { ranges: [fmtRange], booleanRule: { condition: { type: 'TEXT_EQ', values: [{ userEnteredValue: 'SIM' }] }, format: { backgroundColor: verde, textFormat: { foregroundColor: branco } } } }, index: 1 } },
    { addConditionalFormatRule: { rule: { ranges: [fmtRange], booleanRule: { condition: { type: 'TEXT_EQ', values: [{ userEnteredValue: 'NÃO' }] }, format: { backgroundColor: vermelho, textFormat: { foregroundColor: branco } } } }, index: 2 } }
  );

  const batchRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${MEMBERS_ID}:batchUpdate`, {
    method: 'POST', headers: authHdr, body: JSON.stringify({ requests: updateRequests }),
  });
  if (!batchRes.ok) { console.error('Erro:', await batchRes.text()); return; }

  console.log('✅ Nomes em maiúsculo, SIM/NÃO aplicado, dropdown e formatação atualizados.');
}

main().catch(err => { console.error('Erro:', err.message); process.exit(1); });
