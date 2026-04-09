# CLAUDE.md — Portfólio RDCreator

Contexto completo do projeto para continuidade em novos chats.

---

## Sobre o Dono

**Ryan Viana** — Desenvolvedor web e sistemas, atua como **RDCreator / RDC / Ryan Dev Creator**
- Site: ryancreator.dev
- Email: contato@ryancreator.dev → ryanviana002@gmail.com
- WhatsApp: (19) 99252-5515
- GitHub: ryanviana002
- Instagram: @rdcreator

---

## Stack do Projeto

- **React 19 + Vite 8** (JavaScript puro, sem TypeScript)
- **CSS puro** com variáveis (sem Tailwind)
- **Vercel** para deploy (conectado ao GitHub ryanviana002/portifolio)
- **Resend** para envio de emails via API (`api/contact.js`)
- `@vercel/analytics` para analytics

---

## Design System

```
Cores:
  Fundo principal:  #0a0a12
  Rosa/neon:        #ff007f
  Cyan:             #00f2fe
  Roxo:             #9e9eff
  Fundo hero:       #050510

Fonte: Space Grotesk (Google Fonts, pesos 300–900)

Gradientes comuns:
  grad-pink: linear-gradient(135deg, #ff007f, #d12c96)
  grad-cyan: linear-gradient(135deg, #00f2fe, #9e9eff)
```

---

## Estrutura de Componentes

```
src/
├── App.jsx          — roteamento, scroll progress bar, stars-bg, anti-scraping
├── App.css          — .scroll-progress, .stars-bg, .star
├── index.css        — body background #0a0a12
├── components/
│   ├── Hero          — canvas (star warp + dissolve), terminal interativo, lightning
│   ├── Sobre         — foto, stats com CountUp animado
│   ├── Portfolio     — projetos
│   ├── Servicos      — serviços oferecidos
│   ├── Contato       — formulário → /api/contact (Resend) + botão WhatsApp
│   ├── Footer        — rodapé
│   ├── Navbar        — navegação
│   ├── AudioToggle   — música lo-fi ambiente (volume 0.07)
│   ├── BackToTop     — botão voltar ao topo com foguete
│   └── ...outros componentes de efeito
api/
├── contact.js        — serverless Vercel, envia email via Resend
└── inbound-email.js  — webhook Resend para encaminhar emails recebidos
vercel.json           — config build + rewrites /api
```

---

## Funcionalidades Implementadas

- **Star warp canvas** no Hero (camada de fundo escura #050510, dissolve para #0a0a12)
- **Terminal interativo** no Hero: comandos `help`, `projects`, `contact`, `skills`, `clear`
- **Lightning** a cada 15s no Hero
- **CountUp** animado nas stats do Sobre (IntersectionObserver)
- **Scroll progress bar** no topo (2px, gradiente rosa→cyan)
- **Stars-bg** flutuantes (80 estrelas, audio-reactive via `rdc:audio-level`)
- **Música lo-fi** ambiente via AudioToggle (dois streams com fallback, volume 0.07)
- **Proteção anti-scraping**: detecção de bots por user-agent + `navigator.webdriver`; contextmenu bloqueado fora de inputs
- **BackToTop** com foguete
- **SEO**: lang pt-BR, og:image logo-rdc.png, preconnect Google Fonts

---

## Email / Resend

- **Envio pelo formulário**: `api/contact.js` usa `from: onboarding@resend.dev` (temporário enquanto domínio não verifica SPF) → `to: ryanviana002@gmail.com`
- **Encaminhamento inbound**: `api/inbound-email.js` — webhook para reencaminhar emails recebidos no Resend
- **Variável de ambiente no Vercel**: `RESEND_API_KEY = re_...`
- **Domínio**: `ryancreator.dev` verificado no Resend, SPF ainda pendente de propagação
- **Quando SPF verificar**: mudar `from` em `api/contact.js` para `contato@ryancreator.dev`

---

## Git / Deploy

```bash
# Remote configurado com usuário explícito:
git remote set-url origin https://ryanviana002@github.com/ryanviana002/portifolio.git

# Credenciais Windows: conta ryanviana002 (não visio-simenes)
# Deploy automático via Vercel ao fazer push no master
```

---

## Arquivos de Carrossel Instagram

Na raiz do projeto:
- `carousel-instagram.html` — estilo dark neon (o melhor, use este como base)
- `carousel-instagram-2.html` — estilo cyberpunk aurora (em desenvolvimento)

**Conteúdo dos slides:**
1. Capa: "eu crio sua / presença / digital."
2-3. Panorâmico: portfólio + stats (+30 projetos, 100% resultado)
4. Benefícios: Pré Venda / Autoridade / Qualificação
5. CTA: Contate-nos — (19) 99252-5515 / ryanviana002@gmail.com

---

## Agentes IA (pasta Projetos Claude/Agentes Claude/agentes-rdc)

CLI Node.js com agentes especializados:
```bash
cd "Projetos Claude/Agentes Claude/agentes-rdc"
$env:ANTHROPIC_API_KEY="sk-ant-..."
node rdc.js web      # IA Web — sites React/Vite
node rdc.js ads      # IA ADS — carrosséis Instagram
node rdc.js sistema  # IA Sistema — 4GL Informix
```

---

## Decisões e Preferências do Ryan

- Sem TypeScript, sem Tailwind
- Código direto, sem abstrações desnecessárias
- Mobile responsivo sempre (`@media (max-width: 768px)`)
- Commits em português com contexto claro
- WhatsApp como canal principal de contato
- Prefere dark/neon cyberpunk no design
- Não gosta de efeitos que "ficam ruins" — prefere testar antes de confirmar
- Push sempre para ryanviana002/portifolio (não visio-simenes)
