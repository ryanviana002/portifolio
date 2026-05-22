import { useEffect, useRef, useState } from 'react';
import './Automotivo.css';

/* ─── Icons (Phosphor replacements inline SVG) ─── */
const IcWrench = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 256 256" fill="currentColor">
    <path d="M232.49,71.51l-32-32a12,12,0,0,0-17,0L120,103l-9.37-9.37A52,52,0,0,0,41.37,164L16.49,188.84a12,12,0,0,0,0,17l33.66,33.66a12,12,0,0,0,17,0L92,214.63A52,52,0,0,0,162.63,145l-9.37-9.37L206.9,83.51l25.59-12a12,12,0,0,0,0-12ZM84.69,199.31a12,12,0,0,0-17,0L42,225,31,214,56.69,188.3a12,12,0,0,0,0-17A28,28,0,0,1,96.3,131.31a12,12,0,0,0,17,0L124,120.69,135.31,132l-10.69,10.7a12,12,0,0,0,0,17A28,28,0,0,1,84.69,199.31Zm97.94-97.94L140,143l-27-27,41.63-41.63L184,84Z"/>
  </svg>
);

const IcWhatsapp = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 256 256" fill="currentColor">
    <path d="M187.58,144.84l-32-16a8,8,0,0,0-8,.5l-14.69,9.8a40.55,40.55,0,0,1-16-16l9.8-14.69a8,8,0,0,0,.5-8l-16-32A8,8,0,0,0,104,64a40,40,0,0,0-40,40,88.1,88.1,0,0,0,88,88,40,40,0,0,0,40-40A8,8,0,0,0,187.58,144.84ZM152,176a72.08,72.08,0,0,1-72-72,24,24,0,0,1,19.29-23.54l11.48,22.95L101,117.11a8,8,0,0,0-.73,7.51,56.47,56.47,0,0,0,30.15,30.15,8,8,0,0,0,7.51-.73l13.71-9.12,22.95,11.48A24,24,0,0,1,152,176ZM128,24A104,104,0,0,0,36.18,176.88L24.83,210.93a16,16,0,0,0,20.24,20.24l34.05-11.35A104,104,0,1,0,128,24Zm0,192a88.1,88.1,0,0,1-44.06-11.81,8,8,0,0,0-6.54-.67L40,216,52.47,178.6a8,8,0,0,0-.66-6.54A88,88,0,1,1,128,216Z"/>
  </svg>
);

const IcCheckCircle = ({ color = '#00f2fe' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill={color} style={{flexShrink:0, marginTop:2}}>
    <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"/>
  </svg>
);

const IcXCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="currentColor" style={{flexShrink:0, marginTop:2, opacity:0.3}}>
    <path d="M165.66,101.66,139.31,128l26.35,26.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,26.35a8,8,0,0,1-11.32-11.32L116.69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35a8,8,0,0,1,11.32,11.32ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"/>
  </svg>
);

const IcGlobe = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="14">
    <circle cx="128" cy="128" r="96"/><ellipse cx="128" cy="128" rx="40" ry="96"/>
    <line x1="32" y1="128" x2="224" y2="128"/><line x1="44" y1="80" x2="212" y2="80"/>
    <line x1="44" y1="176" x2="212" y2="176"/>
  </svg>
);

const IcGoogle = () => (
  <svg viewBox="0 0 48 48" width="24" height="24">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const IcStar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 256 256" fill="#eab308">
    <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34l13.49-58.54-45.11-39.42a16,16,0,0,1,9.12-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L191,82.61l59.44,5.13a16,16,0,0,1,9.11,28.11Z"/>
  </svg>
);

const IcMapPin = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor">
    <path d="M128,16a96,96,0,1,0,96,96A96.11,96.11,0,0,0,128,16Zm0,176a80,80,0,1,1,80-80A80.09,80.09,0,0,1,128,192Zm0-120a40,40,0,1,0,40,40A40,40,0,0,0,128,72Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,136Z"/>
  </svg>
);

const IcSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16">
    <circle cx="112" cy="112" r="80"/><line x1="168.57" y1="168.57" x2="224" y2="224"/>
  </svg>
);

const IcMegaphone = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor">
    <path d="M240,120a48.05,48.05,0,0,0-48-48H152.2C116,72,68.72,60.29,34.66,33.55A16,16,0,0,0,10,46.93V201.07a16,16,0,0,0,24.66,13.38C68.72,187.71,116,176,152.2,176H160v32a16,16,0,0,0,16,16h16a16,16,0,0,0,15.43-11.81l11.76-47A48.09,48.09,0,0,0,240,120ZM26,201.07V46.93C56.1,71.76,96.35,85.49,128,90.64V149.36C96.35,154.51,56.1,168.24,26,201.07ZM176,224H160V176h16Zm-16-64V112h32.2a32,32,0,0,1,0,64H152.2C160,176,166.34,175.41,160,160Z"/>
  </svg>
);

const IcTrendUp = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="currentColor">
    <path d="M240,56v56a8,8,0,0,1-16,0V75.31l-82.34,82.35a8,8,0,0,1-11.32,0L96,123.31,29.66,189.66A8,8,0,0,1,18.34,178.34l72-72a8,8,0,0,1,11.32,0L136,140.69,212.69,64H168a8,8,0,0,1,0-16h56A8,8,0,0,1,240,56Z"/>
  </svg>
);

const IcInstagram = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
    <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM176,24H80A56.06,56.06,0,0,0,24,80v96a56.06,56.06,0,0,0,56,56h96a56.06,56.06,0,0,0,56-56V80A56.06,56.06,0,0,0,176,24Zm40,152a40,40,0,0,1-40,40H80a40,40,0,0,1-40-40V80A40,40,0,0,1,80,40h96a40,40,0,0,1,40,40ZM192,76a12,12,0,1,1-12-12A12,12,0,0,1,192,76Z"/>
  </svg>
);

/* ─── Marquee ─── */
function Marquee() {
  const items = ['RDCreator', 'Presença Digital Automotiva', 'Mais Clientes na Oficina'];
  const doubled = [...items, ...items, ...items];
  return (
    <div className="aw-marquee-bar">
      <div className="aw-marquee-track">
        {doubled.map((t, i) => (
          <span key={i} className="aw-marquee-item">
            {t}<span className="aw-marquee-dot" aria-hidden="true">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}

const WA = 'https://wa.me/5519994175385';
const waMsg = (msg) => `${WA}?text=${encodeURIComponent(msg)}`;

export default function Automotivo() {
  return (
    <div className="aw-page">

      {/* ── NAV ── */}
      <nav className="aw-nav">
        <div className="aw-nav-inner">
          <div className="aw-logo">
            <span className="aw-logo-icon"><IcWrench /></span>
            <span className="aw-logo-text">RDCreator.</span>
          </div>
          <div className="aw-nav-links">
            <a href="#servicos">Serviços</a>
            <a href="#resultados">Resultados</a>
            <a href="#planos">Planos</a>
          </div>
          <a href={WA} target="_blank" rel="noreferrer" className="aw-nav-cta">
            Falar no WhatsApp
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="aw-hero">
        <div className="aw-hero-bg-grid" aria-hidden="true" />
        <div className="aw-orb aw-orb-cyan" aria-hidden="true" />
        <div className="aw-orb aw-orb-pink" aria-hidden="true" />

        {/* Floating cards */}
        <div className="aw-floats" aria-hidden="true">
          <div className="aw-float aw-float-1 aw-glass-sm">
            <div className="aw-float-icon aw-float-icon-cyan"><IcMapPin /></div>
            <div>
              <p className="aw-float-label">Posição</p>
              <p className="aw-float-val">1º no Maps</p>
            </div>
          </div>
          <div className="aw-float aw-float-2 aw-glass-sm">
            <div className="aw-float-icon aw-float-icon-yellow"><IcStar /></div>
            <div>
              <p className="aw-float-val">4.9 ★★★★★</p>
              <p className="aw-float-label">Google Meu Negócio</p>
            </div>
          </div>
          <div className="aw-float aw-float-3 aw-glass-pill">
            <span className="aw-float-search-icon"><IcSearch /></span>
            <p className="aw-float-search-text">oficina perto de mim</p>
          </div>
          <div className="aw-float aw-float-4 aw-glass-sm">
            <div className="aw-float-stat">
              <span className="aw-float-stat-icon"><IcTrendUp /></span>
              <span className="aw-float-stat-val">+312%</span>
            </div>
            <p className="aw-float-label">Aumento em contatos</p>
          </div>
        </div>

        <div className="aw-hero-content">
          <div className="aw-hero-badge">
            <span className="aw-badge-check">✓</span>
            <span>Especialista no setor automotivo</span>
          </div>
          <h1 className="aw-hero-h1">
            Seu concorrente já aparece <br />
            <span className="aw-hero-hl">antes de você no Google.</span>
          </h1>
          <p className="aw-hero-sub">
            Presença digital de alta performance especializada para oficinas mecânicas, auto elétricas e centros automotivos. Transformamos buscas em veículos na sua rampa.
          </p>
          <div className="aw-hero-actions">
            <a href={waMsg('Olá, quero dominar minha região no Google!')} target="_blank" rel="noreferrer" className="aw-btn-primary aw-btn-shimmer">
              <IcWhatsapp /> Dominar Minha Região
            </a>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <Marquee />

      {/* ── RESULTADOS ── */}
      <section id="resultados" className="aw-section aw-results-section">
        <div className="aw-container">
          <div className="aw-section-header">
            <h2 className="aw-h2">O Motor da sua <span className="aw-text-cyan">Escala</span></h2>
            <p className="aw-subtitle">Não vendemos likes. Entregamos carros enguiçados precisando dos seus serviços.</p>
          </div>
          <div className="aw-stats-grid">
            <div className="aw-stat-item">
              <div className="aw-stat-num aw-grad-pink-purple">+312%</div>
              <div className="aw-stat-title">Aumento de Contatos</div>
              <div className="aw-stat-desc">Média de crescimento no primeiro trimestre via buscas locais.</div>
            </div>
            <div className="aw-stat-item aw-stat-mid">
              <div className="aw-stat-num aw-grad-cyan-blue">45</div>
              <div className="aw-stat-title">Clientes/Mês via Maps</div>
              <div className="aw-stat-desc">Geração constante de rotas traçadas direto para sua porta.</div>
            </div>
            <div className="aw-stat-item">
              <div className="aw-stat-num aw-grad-purple-pink">-60%</div>
              <div className="aw-stat-title">Custo de Aquisição (CAC)</div>
              <div className="aw-stat-desc">Menos dinheiro gasto para atrair clientes de alto valor.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVIÇOS ── */}
      <section id="servicos" className="aw-section aw-services-section">
        <div className="aw-services-glow" aria-hidden="true" />
        <div className="aw-container aw-relative">
          <div className="aw-section-header">
            <h2 className="aw-h2 aw-h2-lg">O Chassi da sua <br /><span className="aw-grad-white-gray">Autoridade Local</span></h2>
            <p className="aw-subtitle">Um ecossistema completo para garantir que quando um motor falhar na sua região, você seja a única opção.</p>
          </div>
          <div className="aw-services-grid">
            {[
              { icon: <IcGlobe />, color: 'cyan', title: 'Site Profissional', desc: 'Uma vitrine digital rápida, otimizada para mobile e desenhada para converter visitantes agoniados em orçamentos rápidos.' },
              { icon: <IcGoogle />, color: 'pink', title: 'Google Meu Negócio', desc: 'Configuração e otimização avançada da sua ficha para dominar os primeiros resultados de busca da sua cidade.' },
              { icon: <IcStar />, color: 'yellow', title: 'Gestão de Avaliações', desc: 'Estratégias automatizadas para multiplicar suas 5 estrelas e construir prova social imbatível na sua região.' },
              { icon: <IcSearch />, color: 'purple', title: 'SEO Local', desc: 'Táticas para aparecer quando buscarem "mecânico urgente", "auto elétrica perto de mim", garantindo tráfego orgânico.' },
              { icon: <IcMapPin />, color: 'cyan', title: 'Google Maps Ads', desc: 'Destaque absoluto no mapa. Fazemos o pin da sua oficina brilhar para quem está navegando nas redondezas.' },
              { icon: <IcMegaphone />, color: 'pink', title: 'Anúncios Locais (Meta/Google)', desc: 'Campanhas hiper-segmentadas para atrair o motorista certo, na hora certa, maximizando o fluxo de caixa.' },
            ].map((s, i) => (
              <div key={i} className="aw-service-card aw-glass-panel">
                <div className={`aw-svc-icon aw-svc-icon-${s.color}`}>{s.icon}</div>
                <h3 className="aw-svc-title">{s.title}</h3>
                <p className="aw-svc-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANOS ── */}
      <section id="planos" className="aw-section aw-plans-section">
        <div className="aw-container">
          <div className="aw-section-header">
            <h2 className="aw-h2 aw-h2-lg">Investimento em <span className="aw-grad-pink-purple">Resultados</span></h2>
            <p className="aw-subtitle">Escolha a potência ideal para acelerar o crescimento do seu centro automotivo.</p>
          </div>
          <div className="aw-plans-grid">

            {/* Arranque */}
            <div className="aw-plan aw-glass-panel">
              <h3 className="aw-plan-name">Arranque</h3>
              <p className="aw-plan-desc">O básico necessário para não ficar invisível na internet.</p>
              <div className="aw-plan-price">
                <span className="aw-plan-amount">R$297</span>
                <span className="aw-plan-period">/mês</span>
              </div>
              <ul className="aw-plan-list">
                <li><IcCheckCircle color="#00f2fe" /><span>Otimização Google Meu Negócio</span></li>
                <li><IcCheckCircle color="#00f2fe" /><span>Gestão de Avaliações Básica</span></li>
                <li><IcCheckCircle color="#00f2fe" /><span>Suporte WhatsApp</span></li>
                <li className="aw-plan-item-off"><IcXCircle /><span>Site Profissional</span></li>
              </ul>
              <a href={waMsg('Olá, tenho interesse no plano Arranque.')} target="_blank" rel="noreferrer" className="aw-plan-btn aw-plan-btn-ghost">
                Selecionar Arranque
              </a>
            </div>

            {/* Performance — destacado */}
            <div className="aw-plan-wrap">
              <div className="aw-plan-tag">Mais Vendido</div>
              <div className="aw-plan aw-plan-featured">
                <h3 className="aw-plan-name">Performance</h3>
                <p className="aw-plan-desc">Aceleração completa para dominar sua região.</p>
                <div className="aw-plan-price">
                  <span className="aw-plan-amount">R$497</span>
                  <span className="aw-plan-period">/mês</span>
                </div>
                <ul className="aw-plan-list">
                  <li><IcCheckCircle color="#ff007f" /><span>Tudo do pacote Arranque</span></li>
                  <li><IcCheckCircle color="#ff007f" /><span><strong>Criação de Site Profissional</strong></span></li>
                  <li><IcCheckCircle color="#ff007f" /><span>SEO Local Estratégico</span></li>
                  <li><IcCheckCircle color="#ff007f" /><span>Relatório de Desempenho Mensal</span></li>
                </ul>
                <a href={waMsg('Olá, quero turbinar com o plano Performance!')} target="_blank" rel="noreferrer" className="aw-plan-btn aw-plan-btn-pink">
                  Selecionar Performance
                </a>
              </div>
            </div>

            {/* Motor V8 */}
            <div className="aw-plan aw-glass-panel">
              <h3 className="aw-plan-name">Motor V8</h3>
              <p className="aw-plan-desc">Máquina de vendas com injeção de tráfego pago.</p>
              <div className="aw-plan-price">
                <span className="aw-plan-amount">R$797</span>
                <span className="aw-plan-period">/mês</span>
              </div>
              <ul className="aw-plan-list">
                <li><IcCheckCircle color="#9e9eff" /><span>Tudo do pacote Performance</span></li>
                <li><IcCheckCircle color="#9e9eff" /><span><strong>Gestão de Anúncios Ads</strong></span></li>
                <li><IcCheckCircle color="#9e9eff" /><span>Automação de Captura de Leads</span></li>
                <li><IcCheckCircle color="#9e9eff" /><span>Prioridade Máxima Suporte</span></li>
              </ul>
              <a href={waMsg('Olá, quero o máximo com o plano Motor V8.')} target="_blank" rel="noreferrer" className="aw-plan-btn aw-plan-btn-ghost">
                Selecionar V8
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="aw-section aw-cta-section">
        <div className="aw-container">
          <div className="aw-cta-wrap">
            <div className="aw-cta-inner-glow" aria-hidden="true" />
            <div className="aw-cta-inner">
              <h2 className="aw-h2 aw-h2-lg">Sua oficina cheia. <br /><span className="aw-text-gray">Todo santo dia.</span></h2>
              <p className="aw-subtitle">Não deixe seu concorrente roubar os clientes que estão quebrando perto da sua porta. Acione a RDCreator hoje.</p>
              <a href={WA} target="_blank" rel="noreferrer" className="aw-btn-primary aw-btn-xl">
                <IcWhatsapp /> Falar com um Especialista
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="aw-footer">
        <div className="aw-container aw-footer-inner">
          <div className="aw-logo">
            <span className="aw-logo-icon"><IcWrench /></span>
            <span className="aw-logo-text">RDCreator.</span>
          </div>
          <div className="aw-footer-copy">© 2026 RDCreator. Presença Digital Automotiva.</div>
          <div className="aw-footer-social">
            <a href="https://instagram.com/rdcreator" target="_blank" rel="noreferrer" className="aw-social-btn"><IcInstagram /></a>
            <a href={WA} target="_blank" rel="noreferrer" className="aw-social-btn"><IcWhatsapp /></a>
          </div>
        </div>
      </footer>

    </div>
  );
}
