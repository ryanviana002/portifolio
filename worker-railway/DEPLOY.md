# Deploy Railway — Evolution API + Worker RDCreator

## 1. Criar tabelas no Supabase

Abre o Supabase → SQL Editor → cola o conteúdo de `supabase-wa-setup.sql` → Run.

---

## 2. Evolution API no Railway

1. Acessa e → New Project → Deploy from GitHub repo
2. Usa o template oficial: https://github.com/EvolutionAPI/evolution-api
   - Ou: railway.app → New → Template → busca "Evolution API"
3. Adiciona as variáveis de ambiente:
   ```
   AUTHENTICATION_TYPE=apikey
   AUTHENTICATION_API_KEY=rdc_evo_2024secret  (cria qualquer chave forte)
   DATABASE_ENABLED=false
   REDIS_ENABLED=false
   ```
4. Clica Deploy. Aguarda subir.
5. Pega a URL pública do serviço (ex: `https://evolution-api-xxx.railway.app`)

### Conectar seu número (QR Code)

```bash
# Cria instância
curl -X POST https://SEU_EVOLUTION_URL/instance/create \
  -H "Content-Type: application/json" \
  -H "apikey: rdc_evo_2024secret" \
  -d '{"instanceName":"rdcreator","qrcode":true}'

# Pega QR Code (escaneia com o WhatsApp do número business)
curl https://SEU_EVOLUTION_URL/instance/connect/rdcreator \
  -H "apikey: rdc_evo_2024secret"
```

### Configurar webhook (para receber respostas dos clientes)

```bash
curl -X POST https://SEU_EVOLUTION_URL/webhook/set/rdcreator \
  -H "Content-Type: application/json" \
  -H "apikey: rdc_evo_2024secret" \
  -d '{
    "url": "https://ryancreator.dev/api/wa-webhook",
    "webhook_by_events": true,
    "events": ["messages.upsert"]
  }'
```

---

## 3. Worker RDCreator no Railway

1. New Project → Deploy from GitHub repo → seleciona `ryanviana002/portifolio`
2. **Root Directory:** `worker-railway`
3. **Start command:** `node index.js`
4. Variáveis de ambiente:
   ```
   SUPABASE_URL=https://zivrekynlmznlyoyyrvg.supabase.co
   SUPABASE_SERVICE_KEY=eyJhbGci...  (a service_role key)
   GOOGLE_PLACES_API_KEY=AIza...
   ANTHROPIC_API_KEY=sk-ant-...
   EVOLUTION_URL=https://SEU_EVOLUTION_URL
   EVOLUTION_KEY=rdc_evo_2024secret
   EVOLUTION_INSTANCE=rdcreator
   VERCEL_URL=https://ryancreator.dev
   ```
5. Deploy.

---

## 4. Variáveis de ambiente no Vercel

Adiciona no Vercel (Settings → Environment Variables):
```
SUPABASE_SERVICE_KEY=eyJhbGci...  (service_role key)
EVOLUTION_URL=https://SEU_EVOLUTION_URL
EVOLUTION_KEY=rdc_evo_2024secret
EVOLUTION_INSTANCE=rdcreator
```

---

## Fluxo completo após deploy

```
07:30 BRT → Worker busca prospects no Google Maps (sem site + tem WA)
           → Gera site HTML via Claude (haiku)
           → Salva preview no Supabase → entra na fila wa_prospects

09:00 BRT → Worker dispara lote manhã (18 msgs, delay 90-180s entre cada)
14:00 BRT → Worker dispara lote tarde (17 msgs, delay 90-180s entre cada)

Cliente responde em < 60s → ignorado (bot automático)
                           → status: "replied" (aguarda próxima mensagem)
Cliente responde novamente → bot envia 2º WA com link do preview

Cliente responde em > 60s → bot envia 2º WA direto com link do preview

Você → responde os interessados manualmente no WhatsApp
     → fecha o negócio
```

---

## Limites configurados

| Parâmetro | Valor |
|---|---|
| Máx disparos/dia | 35 |
| Lote manhã | 18 |
| Lote tarde | 17 |
| Delay entre disparos | 90-180s (aleatório) |
| Anti-bot threshold | 60s |
| Dias de operação | Seg-Sex |
| Horário busca | 07:30 BRT |
| Horário manhã | 09:00 BRT |
| Horário tarde | 14:00 BRT |
