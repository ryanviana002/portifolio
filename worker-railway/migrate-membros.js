// Migração one-time: lê todas as respostas do Forms e popula a planilha Discipulos
// Rodar: GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... GOOGLE_REFRESH_TOKEN=... GOOGLE_API_KEY=... node migrate-membros.js

const SHEETS_ID   = '1H9nNzoJUTIKd07eInNR7jSJUj-U5fNyZMzuRg_1Y5qY';
const MEMBERS_ID  = '1j-8XDi2N_5new-zuwnNmkl_-05Pnwry0mwl4N3WIoKc';
const MEMBERS_TAB = 'Discipulos';
const MEMBERS_GID = 0;

const GOOGLE_API_KEY  = process.env.GOOGLE_API_KEY;
const G_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID;
const G_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const G_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

if (!GOOGLE_API_KEY || !G_CLIENT_ID || !G_CLIENT_SECRET || !G_REFRESH_TOKEN) {
  console.error('Defina GOOGLE_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET e GOOGLE_REFRESH_TOKEN.');
  process.exit(1);
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
  console.log('Lendo respostas do Forms...');
  const formsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_ID}/values/Respostas%20ao%20formul%C3%A1rio%201!A2:E?key=${GOOGLE_API_KEY}`;
  const formsRes = await fetch(formsUrl);
  if (!formsRes.ok) throw new Error(await formsRes.text());
  const rows = (await formsRes.json()).values || [];
  console.log(`${rows.length} respostas encontradas.`);

  // 2. Agrupa por pessoa (match por telefone ou nome)
  const pessoas = []; // { nome, tel, datas: [], temCadastro }

  for (const row of rows) {
    const timestamp  = row[0] || '';
    const nome       = row[1] || '';
    const tel        = (row[2] || '').replace(/\D/g, '');
    const temCadastro = (row[4] || '').toLowerCase().includes('sim');
    const data       = timestamp.split(' ')[0];
    if (!nome || !data) continue;

    const existente = pessoas.find(p =>
      normTel(p.tel) === normTel(tel) && nomeMatch(nome, p.nome)
    );

    if (existente) {
      if (!existente.datas.includes(data)) existente.datas.push(data);
      if (temCadastro) existente.temCadastro = true;
      // Mantém o nome mais longo (mais completo)
      if (nome.length > existente.nome.length) existente.nome = nome;
      if (tel && !existente.tel) existente.tel = tel;
    } else {
      pessoas.push({ nome, tel, datas: [data], temCadastro });
    }
  }

  console.log(`${pessoas.length} pessoas únicas identificadas.`);

  // 3. Monta linhas para a planilha
  const linhas = pessoas.map(p => {
    const tel = p.tel;
    return [
      '',                                         // A: Foto
      p.nome,                                     // B: NOME
      tel,                                        // C: WHATSAPP
      tel ? `https://wa.me/55${tel}` : '',        // D: Link
      p.datas.length,                             // E: Frequencia
      p.temCadastro ? 'Sim' : 'Não',              // F: Sistema
      '',                                         // G: Grupo HG
      '',                                         // H: Grupo C17
    ];
  });

  // 4. Escreve na planilha via OAuth2
  const token = await getAccessToken();
  const authHdr = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  console.log('Inserindo linhas na planilha Discipulos...');
  const appendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${MEMBERS_ID}/values/${encodeURIComponent(MEMBERS_TAB + '!A:H')}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    { method: 'POST', headers: authHdr, body: JSON.stringify({ values: linhas }) }
  );
  const appendData = await appendRes.json();
  if (!appendRes.ok) throw new Error(JSON.stringify(appendData));

  // 5. Adiciona notas (histórico de datas) na coluna E
  const firstRowStr = appendData.updates?.updatedRange?.match(/(\d+):/)?.[1];
  if (firstRowStr) {
    const firstRow = parseInt(firstRowStr) - 1; // 0-indexed
    const noteReqs = pessoas.map((p, i) => ({
      updateCells: {
        rows: [{ values: [{ note: p.datas.join('\n') }] }],
        fields: 'note',
        range: {
          sheetId: MEMBERS_GID,
          startRowIndex: firstRow + i,
          endRowIndex: firstRow + i + 1,
          startColumnIndex: 4,
          endColumnIndex: 5,
        },
      },
    }));

    const batchRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${MEMBERS_ID}:batchUpdate`, {
      method: 'POST', headers: authHdr, body: JSON.stringify({ requests: noteReqs }),
    });
    if (!batchRes.ok) console.error('Erro ao adicionar notas:', await batchRes.text());
    else console.log('Notas (histórico) adicionadas na coluna Frequência.');
  }

  console.log(`\n✅ Migração concluída — ${pessoas.length} discípulos inseridos.`);
}

main().catch(err => { console.error('Erro:', err.message); process.exit(1); });
