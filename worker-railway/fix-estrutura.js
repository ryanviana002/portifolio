// Corrige estrutura: remove linha 5 duplicada, restaura Ryan/Digo na linha 4,
// limpa formatação da coluna A, ajusta card K para linha 4
// node --env-file=.env.example fix-estrutura.js

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
const AZUL_MEDIO  = rgb(41, 98, 155);
const AZUL_CLARO  = rgb(219, 234, 254);

async function main() {
  const token = await getAccessToken();
  const authHdr = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const requests = [];

  // ── 1. Deletar linha 5 (index 4) — duplicata do script ───────────────
  requests.push({
    deleteDimension: {
      range: { sheetId: MEMBERS_GID, dimension: 'ROWS', startIndex: 4, endIndex: 5 },
    },
  });

  // Após deletar, a estrutura fica:
  // Linha 1 (idx 0): vazia
  // Linha 2 (idx 1): Ryan (B2 = contador)
  // Linha 3 (idx 2): vazia
  // Linha 4 (idx 3): cabeçalho (Foto, NOME, WHATSAPP...) — responsáveis foram sobrescritos, vamos restaurar
  // Linha 5 (idx 4): dados (antes linha 6)

  // ── 2. Limpar formatação coluna A (índice 0) inteiramente ─────────────
  requests.push({
    repeatCell: {
      range: { sheetId: MEMBERS_GID, startRowIndex: 0, endRowIndex: 200, startColumnIndex: 0, endColumnIndex: 1 },
      cell: { userEnteredFormat: { backgroundColor: WHITE, textFormat: { bold: false, fontSize: 10, foregroundColor: rgb(0,0,0) } } },
      fields: 'userEnteredFormat',
    },
  });

  // ── 3. Linha 1 — vazia, sem formatação ───────────────────────────────
  requests.push({
    repeatCell: {
      range: { sheetId: MEMBERS_GID, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 11 },
      cell: { userEnteredFormat: { backgroundColor: WHITE } },
      fields: 'userEnteredFormat',
    },
  });

  // ── 4. Linha 3 — separador azul (antes linha 3, continua index 2) ─────
  requests.push({
    repeatCell: {
      range: { sheetId: MEMBERS_GID, startRowIndex: 2, endRowIndex: 3, startColumnIndex: 1, endColumnIndex: 11 },
      cell: { userEnteredFormat: { backgroundColor: AZUL_ESCURO } },
      fields: 'userEnteredFormat',
    },
  });

  // ── 5. Linha 4 (idx 3) — responsáveis Ryan/Digo + cabeçalho das colunas
  // A planilha original tinha:
  //   B=Digo/Ryan, C=Ryan, D=Ryan, E=Ryan, F=Ryan, G=Digo, H=Digo, I=Digo
  // Restauramos isso acima do cabeçalho de colunas — mas agora são só 4 linhas de header.
  // Linha 4 vira: fundo azul médio com responsáveis
  const responsaveis = ['', 'Digo/Ryan', 'Ryan', 'Ryan', 'Ryan', 'Ryan', 'Digo', 'Digo', 'Digo', '', ''];
  requests.push({
    updateCells: {
      range: { sheetId: MEMBERS_GID, startRowIndex: 3, endRowIndex: 4, startColumnIndex: 0, endColumnIndex: 11 },
      rows: [{
        values: responsaveis.map(text => ({
          userEnteredValue: { stringValue: text },
          userEnteredFormat: {
            backgroundColor: AZUL_MEDIO,
            textFormat: { foregroundColor: WHITE, bold: false, fontSize: 9, italic: true },
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE',
          },
        })),
      }],
      fields: 'userEnteredValue,userEnteredFormat',
    },
  });

  // ── 6. Inserir nova linha 5 para o cabeçalho de colunas ───────────────
  requests.push({
    insertDimension: {
      range: { sheetId: MEMBERS_GID, dimension: 'ROWS', startIndex: 4, endIndex: 5 },
      inheritFromBefore: false,
    },
  });

  // ── 7. Linha 5 (idx 4) — cabeçalho azul escuro ────────────────────────
  const cabecalho = ['', 'Foto', 'NOME', 'WHATSAPP', 'LINK WA', 'Qtd\nEncontros', 'Sistema', 'Grupo HG', 'Grupo C17', '', ''];
  requests.push({
    updateCells: {
      range: { sheetId: MEMBERS_GID, startRowIndex: 4, endRowIndex: 5, startColumnIndex: 0, endColumnIndex: 11 },
      rows: [{
        values: cabecalho.map(text => ({
          userEnteredValue: { stringValue: text },
          userEnteredFormat: {
            backgroundColor: AZUL_ESCURO,
            textFormat: { foregroundColor: WHITE, bold: true, fontSize: 10 },
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE',
            wrapStrategy: 'WRAP',
          },
        })),
      }],
      fields: 'userEnteredValue,userEnteredFormat',
    },
  });

  // ── 8. Card K — label em K4 (idx 3), número em K5 (idx 4) ───────────
  // K4 — label
  requests.push({
    updateCells: {
      range: { sheetId: MEMBERS_GID, startRowIndex: 3, endRowIndex: 4, startColumnIndex: 10, endColumnIndex: 11 },
      rows: [{ values: [{
        userEnteredValue: { stringValue: 'QTD ENCONTROS' },
        userEnteredFormat: {
          backgroundColor: AZUL_ESCURO,
          textFormat: { foregroundColor: rgb(180, 210, 255), bold: false, fontSize: 8 },
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE',
        },
      }] }],
      fields: 'userEnteredValue,userEnteredFormat',
    },
  });
  // K5 — número
  requests.push({
    updateCells: {
      range: { sheetId: MEMBERS_GID, startRowIndex: 4, endRowIndex: 5, startColumnIndex: 10, endColumnIndex: 11 },
      rows: [{ values: [{
        userEnteredValue: { formulaValue: '=B2' },
        userEnteredFormat: {
          backgroundColor: AZUL_ESCURO,
          textFormat: { foregroundColor: WHITE, bold: true, fontSize: 22 },
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE',
        },
      }] }],
      fields: 'userEnteredValue,userEnteredFormat',
    },
  });
  // Borda K4:K5
  requests.push({
    updateBorders: {
      range: { sheetId: MEMBERS_GID, startRowIndex: 3, endRowIndex: 5, startColumnIndex: 10, endColumnIndex: 11 },
      top:    { style: 'SOLID_MEDIUM', color: AZUL_CLARO },
      bottom: { style: 'SOLID_MEDIUM', color: AZUL_CLARO },
      left:   { style: 'SOLID_MEDIUM', color: AZUL_CLARO },
      right:  { style: 'SOLID_MEDIUM', color: AZUL_CLARO },
    },
  });

  // ── 9. Congelar 5 linhas ──────────────────────────────────────────────
  requests.push({
    updateSheetProperties: {
      properties: { sheetId: MEMBERS_GID, gridProperties: { frozenRowCount: 5 } },
      fields: 'gridProperties.frozenRowCount',
    },
  });

  const batchRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${MEMBERS_ID}:batchUpdate`, {
    method: 'POST', headers: authHdr, body: JSON.stringify({ requests }),
  });

  if (!batchRes.ok) { console.error('Erro:', await batchRes.text()); return; }
  console.log('✅ Estrutura corrigida: linha duplicada removida, Ryan/Digo restaurados, coluna A sem formatação');
}

main().catch(err => { console.error('Erro:', err.message); process.exit(1); });
