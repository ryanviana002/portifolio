// Setup one-time: formatação condicional nas colunas Sistema, Grupo HG, Grupo C17
// GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... GOOGLE_REFRESH_TOKEN=... node setup-formatacao.js

const MEMBERS_ID  = '1j-8XDi2N_5new-zuwnNmkl_-05Pnwry0mwl4N3WIoKc';
const MEMBERS_GID = 0;

const G_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID;
const G_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const G_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

if (!G_CLIENT_ID || !G_CLIENT_SECRET || !G_REFRESH_TOKEN) {
  console.error('Defina GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET e GOOGLE_REFRESH_TOKEN.');
  process.exit(1);
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
  const token = await getAccessToken();
  const authHdr = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  // Colunas F=5, G=6, H=7 — dados a partir da linha 6 (index 5)
  const range = {
    sheetId: MEMBERS_GID,
    startRowIndex: 5,      // linha 6
    endRowIndex: 1000,
    startColumnIndex: 5,   // col F
    endColumnIndex: 8,     // até col H
  };

  const verde  = { red: 0.204, green: 0.659, blue: 0.325 };
  const branco = { red: 1, green: 1, blue: 1 };
  const vermelho = { red: 0.796, green: 0.196, blue: 0.196 };

  const requests = [
    // Sim → verde
    {
      addConditionalFormatRule: {
        rule: {
          ranges: [range],
          booleanRule: {
            condition: { type: 'TEXT_EQ', values: [{ userEnteredValue: 'Sim' }] },
            format: { backgroundColor: verde, textFormat: { foregroundColor: branco } },
          },
        },
        index: 0,
      },
    },
    // Não → vermelho
    {
      addConditionalFormatRule: {
        rule: {
          ranges: [range],
          booleanRule: {
            condition: { type: 'TEXT_EQ', values: [{ userEnteredValue: 'Não' }] },
            format: { backgroundColor: vermelho, textFormat: { foregroundColor: branco } },
          },
        },
        index: 1,
      },
    },
  ];

  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${MEMBERS_ID}:batchUpdate`, {
    method: 'POST', headers: authHdr, body: JSON.stringify({ requests }),
  });

  if (!res.ok) { console.error('Erro:', await res.text()); return; }
  console.log('✅ Formatação condicional aplicada — F, G, H: Sim=verde, Não=vermelho');
}

main().catch(err => { console.error('Erro:', err.message); process.exit(1); });
