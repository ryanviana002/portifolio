// Setup one-time: filtro + ordem alfabética na planilha Discipulos
// GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... GOOGLE_REFRESH_TOKEN=... node setup-planilha.js

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

  const requests = [
    // Filtro no cabeçalho (linha 5, index 4) — colunas A até H
    {
      setBasicFilter: {
        filter: {
          range: {
            sheetId: MEMBERS_GID,
            startRowIndex: 4,   // linha 5
            endRowIndex: 1000,
            startColumnIndex: 0,
            endColumnIndex: 8,
          },
        },
      },
    },
    // Ordenar por coluna B (NOME) — A→Z, a partir da linha 6 (index 5)
    {
      sortRange: {
        range: {
          sheetId: MEMBERS_GID,
          startRowIndex: 5,
          endRowIndex: 1000,
          startColumnIndex: 0,
          endColumnIndex: 8,
        },
        sortSpecs: [{ dimensionIndex: 1, sortOrder: 'ASCENDING' }],
      },
    },
  ];

  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${MEMBERS_ID}:batchUpdate`, {
    method: 'POST', headers: authHdr, body: JSON.stringify({ requests }),
  });

  if (!res.ok) { console.error('Erro:', await res.text()); return; }
  console.log('✅ Filtro e ordem alfabética aplicados na planilha Discipulos.');
}

main().catch(err => { console.error('Erro:', err.message); process.exit(1); });
