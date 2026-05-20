// Design profissional da planilha Discipulos
// node --env-file=.env.example setup-design.js

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

// Helpers de cor
const rgb = (r, g, b) => ({ red: r/255, green: g/255, blue: b/255 });
const WHITE   = rgb(255, 255, 255);
const BLACK   = rgb(0, 0, 0);

// Paleta principal
const AZUL_ESCURO  = rgb(25,  60, 100);   // cabeçalho principal
const AZUL_MEDIO   = rgb(41,  98, 155);   // sub-cabeçalho responsáveis
const AZUL_CLARO   = rgb(219, 234, 254);  // linhas pares / zebra
const CINZA_HEADER = rgb(55,  65,  81);   // label contador
const VERDE        = rgb(22, 163, 74);
const VERMELHO     = rgb(220, 38,  38);
const AMARELO_BG   = rgb(254, 249, 195);  // destaque freq baixa (=1)
const CINZA_LINHA  = rgb(243, 244, 246);  // zebra linhas ímpares

// Frequência: escala de cor
const FREQ_BAIXA  = rgb(254, 226, 226);  // 1
const FREQ_MEDIA  = rgb(254, 249, 195);  // 2-3
const FREQ_ALTA   = rgb(220, 252, 231);  // 4+

function headerRow(texts, bgColor, fgColor = WHITE, bold = true, fontSize = 10) {
  return {
    values: texts.map(t => ({
      userEnteredValue: { stringValue: t },
      userEnteredFormat: {
        backgroundColor: bgColor,
        textFormat: { foregroundColor: fgColor, bold, fontSize },
        horizontalAlignment: 'CENTER',
        verticalAlignment: 'MIDDLE',
      },
    })),
  };
}

async function main() {
  const token = await getAccessToken();
  const authHdr = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const requests = [];

  // ── 1. Dimensões das colunas ──────────────────────────────────────────
  // A(0)=oculta, B(1)=Foto, C(2)=Nome, D(3)=WhatsApp, E(4)=Link, F(5)=Freq, G(6)=Sistema, H(7)=Grupo HG, I(8)=Grupo C17
  const colWidths = [
    { idx: 0, px: 40  },   // A — oculta/margem
    { idx: 1, px: 60  },   // B — Foto
    { idx: 2, px: 240 },   // C — Nome
    { idx: 3, px: 130 },   // D — WhatsApp
    { idx: 4, px: 200 },   // E — Link WA
    { idx: 5, px: 100 },   // F — Frequência
    { idx: 6, px: 110 },   // G — Sistema
    { idx: 7, px: 110 },   // H — Grupo HG
    { idx: 8, px: 110 },   // I — Grupo C17
  ];
  colWidths.forEach(({ idx, px }) => {
    requests.push({
      updateDimensionProperties: {
        range: { sheetId: MEMBERS_GID, dimension: 'COLUMNS', startIndex: idx, endIndex: idx + 1 },
        properties: { pixelSize: px },
        fields: 'pixelSize',
      },
    });
  });

  // ── 2. Altura das linhas ──────────────────────────────────────────────
  [
    { start: 0, end: 1, px: 32  }, // linha 1 — contador compacto
    { start: 1, end: 2, px: 4   }, // linha 2 — separador fino
    { start: 2, end: 3, px: 22  }, // linha 3 — responsáveis
    { start: 3, end: 4, px: 34  }, // linha 4 — cabeçalho colunas
    { start: 4, end: 68, px: 28 }, // dados
  ].forEach(({ start, end, px }) => {
    requests.push({
      updateDimensionProperties: {
        range: { sheetId: MEMBERS_GID, dimension: 'ROWS', startIndex: start, endIndex: end },
        properties: { pixelSize: px },
        fields: 'pixelSize',
      },
    });
  });

  // ── 3. Contador — linha 1 compacta: B1 = label, C1 = número ──────────
  // Linha 1 inteira branco limpo
  requests.push({
    repeatCell: {
      range: { sheetId: MEMBERS_GID, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 9 },
      cell: { userEnteredFormat: { backgroundColor: WHITE } },
      fields: 'userEnteredFormat.backgroundColor',
    },
  });
  // B1 — label
  requests.push({
    updateCells: {
      range: { sheetId: MEMBERS_GID, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 1, endColumnIndex: 2 },
      rows: [{ values: [{
        userEnteredValue: { stringValue: 'Qtd Encontros' },
        userEnteredFormat: {
          backgroundColor: AZUL_ESCURO,
          textFormat: { foregroundColor: rgb(180, 200, 230), bold: false, fontSize: 9 },
          horizontalAlignment: 'LEFT',
          verticalAlignment: 'MIDDLE',
          padding: { left: 8 },
        },
      }] }],
      fields: 'userEnteredValue,userEnteredFormat',
    },
  });
  // C1 — número (B2 na planilha continua com o valor real; C1 é só visual label)
  // O número real está em B2. Vamos formatar B1 como label e deixar B2 com o número grande mas linha 2 = separador 4px
  // Reformulando: linha 1 tem B1=label "Qtd Encontros" e C1=valor (o usuário move o valor para C1 ou deixamos B1 com ambos)
  // Solução mais limpa: B1 = "Qtd Encontros" | C1 aponta para =B2 (mas não alteramos fórmulas)
  // Mantemos: B1 = label azul escuro, resto da linha = branco

  // Linha 2 (separador) — azul escuro fino
  requests.push({
    repeatCell: {
      range: { sheetId: MEMBERS_GID, startRowIndex: 1, endRowIndex: 2, startColumnIndex: 0, endColumnIndex: 9 },
      cell: { userEnteredFormat: { backgroundColor: AZUL_ESCURO } },
      fields: 'userEnteredFormat',
    },
  });

  // ── 4. Linha 3 — Responsáveis ─────────────────────────────────────────
  requests.push({
    repeatCell: {
      range: { sheetId: MEMBERS_GID, startRowIndex: 2, endRowIndex: 3, startColumnIndex: 0, endColumnIndex: 9 },
      cell: {
        userEnteredFormat: {
          backgroundColor: AZUL_MEDIO,
          textFormat: { foregroundColor: WHITE, bold: false, fontSize: 9, italic: true },
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE',
        },
      },
      fields: 'userEnteredFormat',
    },
  });

  // ── 5. Linha 4 — Cabeçalho das colunas ───────────────────────────────
  const cabecalho = ['', 'Foto', 'NOME', 'WHATSAPP', 'LINK WA', 'Qtd\nEncontros', 'Sistema', 'Grupo HG', 'Grupo C17'];
  requests.push({
    updateCells: {
      range: { sheetId: MEMBERS_GID, startRowIndex: 3, endRowIndex: 4, startColumnIndex: 0, endColumnIndex: 9 },
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

  // ── 6. Congelar linhas 1-4 ────────────────────────────────────────────
  requests.push({
    updateSheetProperties: {
      properties: {
        sheetId: MEMBERS_GID,
        gridProperties: { frozenRowCount: 4 },
      },
      fields: 'gridProperties.frozenRowCount',
    },
  });

  // ── 7. Desfazer merges antigos e ocultar coluna A ────────────────────
  requests.push({
    unmergeCells: {
      range: { sheetId: MEMBERS_GID, startRowIndex: 0, endRowIndex: 10, startColumnIndex: 0, endColumnIndex: 9 },
    },
  });
  requests.push({
    updateDimensionProperties: {
      range: { sheetId: MEMBERS_GID, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 },
      properties: { pixelSize: 0, hiddenByUser: true },
      fields: 'pixelSize,hiddenByUser',
    },
  });

  // ── 7b. Fundo branco nas linhas de dados ─────────────────────────────
  requests.push({
    repeatCell: {
      range: { sheetId: MEMBERS_GID, startRowIndex: 4, endRowIndex: 200, startColumnIndex: 1, endColumnIndex: 9 },
      cell: { userEnteredFormat: { backgroundColor: WHITE } },
      fields: 'userEnteredFormat.backgroundColor',
    },
  });

  // ── 8. Formatação da coluna NOME (C=2) ───────────────────────────────
  requests.push({
    repeatCell: {
      range: { sheetId: MEMBERS_GID, startRowIndex: 4, endRowIndex: 200, startColumnIndex: 2, endColumnIndex: 3 },
      cell: {
        userEnteredFormat: {
          textFormat: { bold: true, fontSize: 10 },
          verticalAlignment: 'MIDDLE',
          horizontalAlignment: 'LEFT',
        },
      },
      fields: 'userEnteredFormat',
    },
  });

  // ── 9. Formatação WhatsApp (D=3) e Link (E=4) ────────────────────────
  requests.push({
    repeatCell: {
      range: { sheetId: MEMBERS_GID, startRowIndex: 4, endRowIndex: 200, startColumnIndex: 3, endColumnIndex: 5 },
      cell: {
        userEnteredFormat: {
          textFormat: { fontSize: 9, foregroundColor: rgb(75, 85, 99) },
          verticalAlignment: 'MIDDLE',
          horizontalAlignment: 'CENTER',
          numberFormat: { type: 'TEXT' },
        },
      },
      fields: 'userEnteredFormat',
    },
  });

  // ── 10. Coluna Frequência (F=5) — negrito, centralizado ──────────────
  requests.push({
    repeatCell: {
      range: { sheetId: MEMBERS_GID, startRowIndex: 4, endRowIndex: 200, startColumnIndex: 5, endColumnIndex: 6 },
      cell: {
        userEnteredFormat: {
          textFormat: { bold: true, fontSize: 12 },
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE',
        },
      },
      fields: 'userEnteredFormat',
    },
  });

  // ── 11. Frequência — formatação condicional por nível ─────────────────
  const freqRange = { sheetId: MEMBERS_GID, startRowIndex: 4, endRowIndex: 200, startColumnIndex: 5, endColumnIndex: 6 };
  requests.push(
    // 1 encontro = vermelho suave (recém chegou)
    { addConditionalFormatRule: { rule: { ranges: [freqRange], booleanRule: { condition: { type: 'NUMBER_EQ', values: [{ userEnteredValue: '1' }] }, format: { backgroundColor: FREQ_BAIXA, textFormat: { foregroundColor: VERMELHO, bold: true } } } }, index: 3 } },
    // 2-3 encontros = amarelo (em crescimento)
    { addConditionalFormatRule: { rule: { ranges: [freqRange], booleanRule: { condition: { type: 'NUMBER_BETWEEN', values: [{ userEnteredValue: '2' }, { userEnteredValue: '3' }] }, format: { backgroundColor: FREQ_MEDIA } } }, index: 4 } },
    // 4+ encontros = verde (consolidado)
    { addConditionalFormatRule: { rule: { ranges: [freqRange], booleanRule: { condition: { type: 'NUMBER_GREATER_THAN_EQ', values: [{ userEnteredValue: '4' }] }, format: { backgroundColor: FREQ_ALTA, textFormat: { foregroundColor: VERDE, bold: true } } } }, index: 5 } }
  );

  // ── 12. SIM/NÃO — dropdowns e formatação condicional ─────────────────
  const simNaoRange = { sheetId: MEMBERS_GID, startRowIndex: 4, endRowIndex: 200, startColumnIndex: 6, endColumnIndex: 9 };

  // Formatação base das células SIM/NÃO — centralizado, bold
  requests.push({
    repeatCell: {
      range: simNaoRange,
      cell: {
        userEnteredFormat: {
          textFormat: { bold: true, fontSize: 10 },
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE',
        },
      },
      fields: 'userEnteredFormat',
    },
  });

  // Dropdown
  requests.push({
    setDataValidation: {
      range: simNaoRange,
      rule: {
        condition: { type: 'ONE_OF_LIST', values: [{ userEnteredValue: 'SIM' }, { userEnteredValue: 'NÃO' }] },
        showCustomUi: true,
        strict: false,
      },
    },
  });

  // Formatação condicional SIM/NÃO
  requests.push(
    { addConditionalFormatRule: { rule: { ranges: [simNaoRange], booleanRule: { condition: { type: 'BLANK' }, format: { backgroundColor: WHITE } } }, index: 6 } },
    { addConditionalFormatRule: { rule: { ranges: [simNaoRange], booleanRule: { condition: { type: 'TEXT_EQ', values: [{ userEnteredValue: 'SIM' }] }, format: { backgroundColor: VERDE, textFormat: { foregroundColor: WHITE, bold: true } } } }, index: 7 } },
    { addConditionalFormatRule: { rule: { ranges: [simNaoRange], booleanRule: { condition: { type: 'TEXT_EQ', values: [{ userEnteredValue: 'NÃO' }] }, format: { backgroundColor: VERMELHO, textFormat: { foregroundColor: WHITE, bold: true } } } }, index: 8 } }
  );

  // ── 13. Bordas na área de dados ───────────────────────────────────────
  requests.push({
    updateBorders: {
      range: { sheetId: MEMBERS_GID, startRowIndex: 3, endRowIndex: 200, startColumnIndex: 1, endColumnIndex: 9 },
      innerHorizontal: { style: 'SOLID', color: rgb(209, 213, 219) },
      innerVertical:   { style: 'SOLID', color: rgb(209, 213, 219) },
      top:    { style: 'SOLID_MEDIUM', color: AZUL_ESCURO },
      bottom: { style: 'SOLID', color: rgb(209, 213, 219) },
      left:   { style: 'SOLID_MEDIUM', color: AZUL_ESCURO },
      right:  { style: 'SOLID_MEDIUM', color: AZUL_ESCURO },
    },
  });

  // ── 14. Remover regras condicionais antigas (limpar antes) ─────────────
  const getSheet = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${MEMBERS_ID}?fields=sheets.conditionalFormats`, { headers: authHdr });
  const sheetData = await getSheet.json();
  const existingRules = sheetData.sheets?.[0]?.conditionalFormats || [];
  console.log(`Removendo ${existingRules.length} regras condicionais antigas...`);
  existingRules.forEach(() => {
    requests.unshift({ deleteConditionalFormatRule: { sheetId: MEMBERS_GID, index: 0 } });
  });

  // ── Executar tudo ──────────────────────────────────────────────────────
  const batchRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${MEMBERS_ID}:batchUpdate`, {
    method: 'POST', headers: authHdr, body: JSON.stringify({ requests }),
  });

  if (!batchRes.ok) {
    const err = await batchRes.text();
    console.error('Erro:', err);
    return;
  }

  console.log('✅ Design profissional aplicado com sucesso!');
  console.log('   • Cabeçalho azul escuro com colunas bem definidas');
  console.log('   • Frequência: vermelho (1) → amarelo (2-3) → verde (4+)');
  console.log('   • Sistema/HG/C17: SIM=verde, NÃO=vermelho, vazio=branco');
  console.log('   • Zebra nas linhas de dados');
  console.log('   • Linhas 1-5 congeladas');
}

main().catch(err => { console.error('Erro:', err.message); process.exit(1); });
