// Script one-time para obter o GOOGLE_REFRESH_TOKEN
// Antes de rodar: crie um arquivo .env.auth com CLIENT_ID e CLIENT_SECRET
// ou passe como variáveis de ambiente:
//   GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... node auth-google.js

import http from 'http';
import { exec } from 'child_process';

const CLIENT_ID     = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI  = 'http://localhost:8765';
const SCOPE         = 'https://www.googleapis.com/auth/spreadsheets';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Defina GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET como env vars.');
  process.exit(1);
}

const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(SCOPE)}&access_type=offline&prompt=consent`;

console.log('\nAbrindo browser para autenticação Google...\n');
exec(`open -a "Google Chrome" "${authUrl}"`);

const server = http.createServer(async (req, res) => {
  const code = new URL(req.url, REDIRECT_URI).searchParams.get('code');
  if (!code) { res.end('Sem código.'); return; }

  res.end('<h2>Autenticado! Pode fechar esta aba.</h2>');
  server.close();

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code, client_id: CLIENT_ID, client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI, grant_type: 'authorization_code',
    }),
  });

  const tokens = await tokenRes.json();
  if (tokens.refresh_token) {
    console.log('✅ Refresh token obtido:\n');
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
    console.log('Adicione essa variável no Railway.');
  } else {
    console.error('Erro:', JSON.stringify(tokens, null, 2));
  }
});

server.listen(8765, () => console.log('Aguardando callback em http://localhost:8765 ...\n'));
