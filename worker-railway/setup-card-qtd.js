// Card "QTD ENCONTROS" na coluna K, linhas 4-5
// Limpa linha 1 (card antigo) e coluna J
// node --env-file=.env.example setup-card-qtd.js

const MEMBERS_ID  = '1j-8XDi2N_5new-zuwnNmkl_-05Pnwry0mwl4N3WIoKc';
const MEMBERS_GID = 0;

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

const rgb = (r, g, b) => ({ red: r/255, green: g/255, blue: b/255 });
const WHITE       = rgb(255, 255, 255);
const AZUL_ESCURO = rgb(25, 60, 100);
const AZUL_CLARO  = rgb(219, 234, 254);

// Índices: A=0, B=1, C=2, D=3, E=4, F=5, G=6, H=7, I=8, J=9, K=10

async function main() {
  const token = await getAccessToken();
  const authHdr = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const requests = [];

  // ── 1. Limpar linha 1 inteira (B1 = "Qtd Encontros" antigo) ──────────
  requests.push({
    repeatCell: {
      range: { sheetId: MEMBERS_GID, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 11 },
      cell: {
        userEnteredValue: { stringValue: '' },
        userEnteredFormat: { backgroundColor: WHITE, textFormat: { bold: false, fontSize: 10, foregroundColor: rgb(0,0,0) } },
      },
      fields: 'userEnteredValue,userEnteredFormat',
    },
  });

  // ── 2. Restaurar coluna A visível ─────────────────────────────────────
  requests.push({
    updateDimensionProperties: {
      range: { sheetId: MEMBERS_GID, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 },
      properties: { pixelSize: 40, hiddenByUser: false },
      fields: 'pixelSize,hiddenByUser',
    },
  });

  // ── 3. Limpar coluna J (índice 9) linhas 1-10 ─────────────────────────
  requests.push({
    repeatCell: {
      range: { sheetId: MEMBERS_GID, startRowIndex: 0, endRowIndex: 10, startColumnIndex: 9, endColumnIndex: 10 },
      cell: {
        userEnteredValue: { stringValue: '' },
        userEnteredFormat: { backgroundColor: WHITE },
      },
      fields: 'userEnteredValue,userEnteredFormat',
    },
  });

  // ── 4. Largura da coluna K ────────────────────────────────────────────
  requests.push({
    updateDimensionProperties: {
      range: { sheetId: MEMBERS_GID, dimension: 'COLUMNS', startIndex: 10, endIndex: 11 },
      properties: { pixelSize: 140 },
      fields: 'pixelSize',
    },
  });

  // ── 5. K4 — label ─────────────────────────────────────────────────────
  // Linha 4 = index 3
  requests.push({
    updateCells: {
      range: { sheetId: MEMBERS_GID, startRowIndex: 3, endRowIndex: 4, startColumnIndex: 10, endColumnIndex: 11 },
      rows: [{
        values: [{
          userEnteredValue: { stringValue: 'QTD ENCONTROS' },
          userEnteredFormat: {
            backgroundColor: AZUL_ESCURO,
            textFormat: { foregroundColor: rgb(180, 210, 255), bold: false, fontSize: 8 },
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE',
          },
        }],
      }],
      fields: 'userEnteredValue,userEnteredFormat',
    },
  });

  // ── 6. K5 — número grande =B2 ─────────────────────────────────────────
  // Linha 5 = index 4
  requests.push({
    updateCells: {
      range: { sheetId: MEMBERS_GID, startRowIndex: 4, endRowIndex: 5, startColumnIndex: 10, endColumnIndex: 11 },
      rows: [{
        values: [{
          userEnteredValue: { formulaValue: '=B2' },
          userEnteredFormat: {
            backgroundColor: AZUL_ESCURO,
            textFormat: { foregroundColor: WHITE, bold: true, fontSize: 22 },
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE',
          },
        }],
      }],
      fields: 'userEnteredValue,userEnteredFormat',
    },
  });

  // ── 7. Borda ao redor de K4:K5 ────────────────────────────────────────
  requests.push({
    updateBorders: {
      range: { sheetId: MEMBERS_GID, startRowIndex: 3, endRowIndex: 5, startColumnIndex: 10, endColumnIndex: 11 },
      top:    { style: 'SOLID_MEDIUM', color: AZUL_CLARO },
      bottom: { style: 'SOLID_MEDIUM', color: AZUL_CLARO },
      left:   { style: 'SOLID_MEDIUM', color: AZUL_CLARO },
      right:  { style: 'SOLID_MEDIUM', color: AZUL_CLARO },
    },
  });

  // ── 8. K1:K3 — branco limpo ───────────────────────────────────────────
  requests.push({
    repeatCell: {
      range: { sheetId: MEMBERS_GID, startRowIndex: 0, endRowIndex: 3, startColumnIndex: 10, endColumnIndex: 11 },
      cell: {
        userEnteredValue: { stringValue: '' },
        userEnteredFormat: { backgroundColor: WHITE },
      },
      fields: 'userEnteredValue,userEnteredFormat',
    },
  });

  const batchRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${MEMBERS_ID}:batchUpdate`, {
    method: 'POST', headers: authHdr, body: JSON.stringify({ requests }),
  });

  if (!batchRes.ok) { console.error('Erro:', await batchRes.text()); return; }
  console.log('✅ Card QTD ENCONTROS em K4:K5 | Linha 1 limpa | Coluna A visível');
}

main().catch(err => { console.error('Erro:', err.message); process.exit(1); });
