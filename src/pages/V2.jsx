import { useState, useEffect, useRef } from 'react';
import './V2.css';

const STATS = [
  { val: '+30', label: 'projetos entregues' },
  { val: '+5', label: 'anos de experiência' },
  { val: '100%', label: 'resultado' },
];

const TESTIMONIALS = [
  { name: 'Divanio', role: 'AUTO AR', text: 'Em menos de 30 dias o site já trouxe novos clientes. Design profissional e entrega rápida.' },
  { name: 'Edilson', role: 'Genuína Automotivo', text: 'O Ryan entende o negócio antes de codar. O resultado superou as expectativas.' },
  { name: 'App Delega', role: 'Aplicativo Mobile', text: 'Sistema complexo entregue no prazo. Automatizou nosso processo de prospecção completamente.' },
];

const WORKS = [
  { tag: 'Web Design', title: 'AutoAirShop', desc: 'Site institucional para empresa de ar-condicionado automotivo.', sub: 'Mais acessos e contatos em 30 dias.', img: '/preview-autoairshop.png', link: '#' },
  { tag: 'Web Design', title: 'Genuína', desc: 'Presença digital completa para empresa local.', sub: 'Site com foco em contato e vendas.', img: '/preview-genuina.png', link: '#' },
  { tag: 'Sistema Web', title: 'Preview AI', desc: 'Geração de sites com IA para prospecção via Google Maps.', sub: 'Automatiza contato com +50 leads/dia.', img: '/preview-previewai.png', link: '/preview' },
  { tag: 'Landing Page', title: 'Delega', desc: 'Landing page para app de marketplace de serviços.', sub: 'Design arrojado, alta conversão.', img: '/preview-delega.png', link: '/delega' },
  { tag: 'Portfólio', title: 'RDCreator', desc: 'Portfólio pessoal com animações canvas e efeitos neon.', sub: 'Terminal interativo e star warp.', img: '/preview-rdcreator.png', link: '/' },
];

export default function V2() {
  const cursorRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const [activeFilter, setActiveFilter] = useState('WEB DESIGN');
  const [activeWork, setActiveWork] = useState(2);
  const [form, setForm] = useState({ nome: '', email: '', msg: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    const move = e => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    };
    const grow = () => cursor.classList.add('big');
    const shrink = () => cursor.classList.remove('big');
    window.addEventListener('mousemove', move);
    document.querySelectorAll('a,button').forEach(el => {
      el.addEventListener('mouseenter', grow);
      el.addEventListener('mouseleave', shrink);
    });
    return () => window.removeEventListener('mousemove', move);
  }, []);

  const scrollTo = id => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async e => {
    e.preventDefault();
    setSending(true);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: form.nome, email: form.email, mensagem: form.msg }),
      });
      setSent(true);
    } catch {}
    setSending(false);
  };

  return (
    <div className="v2">
      <div className="v2-cursor" ref={cursorRef} />

      {/* NAV */}
      <nav className={`v2-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="v2-nav-logo">RYAN <span>DEV</span><br/>CREATOR.</div>
        <div className={`v2-nav-links ${menuOpen ? 'open' : ''}`}>
          <button onClick={() => scrollTo('v2-work')}>Início</button>
          <button onClick={() => scrollTo('v2-services')}>Serviços</button>
          <button onClick={() => scrollTo('v2-about2')}>Sobre</button>
          <button onClick={() => scrollTo('v2-contato')}>Contato</button>
        </div>
        <div className="v2-nav-actions">
          <a href="https://instagram.com/rdcreator" target="_blank" rel="noreferrer" className="v2-nav-ig">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </a>
          <a href="https://wa.me/5519994175385" target="_blank" rel="noreferrer" className="v2-nav-cta-white">
            Iniciar projeto
            <span className="v2-nav-cta-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M8 5v14l11-7z"/></svg>
            </span>
          </a>
        </div>
        <button className="v2-hamburger" onClick={() => setMenuOpen(v => !v)}>
          <span /><span /><span />
        </button>
      </nav>

      {/* HERO */}
      <section className="v2-hero" id="v2-work">
        <img src="/polvo3.jpg" alt="" className="v2-hero-person" />
        <div className="v2-hero-overlay" />

        {/* Esquerda — título + CTA */}
        <div className="v2-hero-left">
          <h1 className="v2-hero-title" style={{isolation:'isolate'}}>
            <span style={{position:'relative', zIndex:2}}>ryan </span><span style={{color:'#f80253', position:'relative', zIndex:1}}>dev</span><br />
            <span style={{position:'relative', zIndex:2}}>creator.</span>
          </h1>
          <p className="v2-hero-sub">Sites, sistemas e design que constroem autoridade e geram resultado real.</p>
          <a href="#" onClick={e => { e.preventDefault(); scrollTo('v2-services'); }} className="v2-hero-cta-btn">
            Comece agora
          </a>
        </div>

        {/* Floating card — top center */}
        <div className="v2-hero-card">
          <div className="v2-hero-card-top">
            <span className="v2-hero-card-val">+30</span>
            <a href="#" onClick={e => { e.preventDefault(); scrollTo('v2-contact'); }} className="v2-hero-card-btn">→</a>
          </div>
          <p className="v2-hero-card-desc">projetos entregues com sucesso</p>
        </div>

        {/* Card 1.3k — absoluto */}
        <div className="v2-hero-stat-right">
          <span className="v2-hero-stat-val">1.3k+</span>
          <p className="v2-hero-stat-desc">horas de desenvolvimento em projetos reais</p>
          <a href="#" onClick={e => { e.preventDefault(); scrollTo('v2-work'); }} className="v2-hero-stat-btn">→</a>
        </div>

        {/* Tagline cascata */}
        <div className="v2-hero-tagline">
          <h2 className="v2-hero-tagline-title">
            <span style={{display:'block', whiteSpace:'nowrap'}}>transformamos</span>
            <span style={{display:'block', marginLeft:'-1em'}}><span className="v2-pink">visitantes</span></span>
            <span style={{display:'block', marginLeft:'-2em'}}>em clientes</span>
          </h2>
          <p className="v2-hero-tagline-sub">Unimos análise, criatividade<br/>e estratégia para gerar<br/>resultados reais.</p>
        </div>
      </section>

      {/* SERVICES — grid estilo Octo */}
      <section className="v2-services" id="v2-services">
        <div className="v2-svc-glow" />
        <div className="v2-svc-ghost">
          <div>rdc</div>
          <div>web</div>
        </div>
        <div className="v2-svc-header">
          <h2 className="v2-svc-header-left">
            quais são os<br/>meus <span className="v2-pink">serviços</span>
          </h2>
          <p className="v2-svc-header-right">/ a solução ideal<br/>para o seu negócio</p>
        </div>
        <div className="v2-services-grid">
          {/* 01 — cinza, col1 row1 */}
          <div className="v2-svc v2-svc--gray v2-svc--a">
            <span className="v2-svc-num">01</span>
            <span className="v2-svc-title">Web design &amp;<br/>desenvolvimento</span>
          </div>
          {/* 02 — rosa wide, col2-3 row1 */}
          <div className="v2-svc v2-svc--pink v2-svc--b">
            <span className="v2-svc-num">02</span>
            <p className="v2-svc-desc-sm">Plataformas e sistemas sob medida que automatizam processos e escalam seu negócio.</p>
            <span className="v2-svc-title">Sistemas<br/>web</span>
          </div>
          {/* 03 — rosa tall, col1 row2-3 */}
          <div className="v2-svc v2-svc--pink v2-svc--c">
            <span className="v2-svc-num">03</span>
            <span className="v2-svc-title">Landing pages<br/>&amp; conversão</span>
          </div>
          {/* 04 — dark wide, col2-3 row2 */}
          <div className="v2-svc v2-svc--dark v2-svc--d">
            <span className="v2-svc-num">04</span>
            <span className="v2-svc-title">E-commerce<br/>&amp; lojas</span>
          </div>
          {/* 05 — cinza, col2 row3 */}
          <div className="v2-svc v2-svc--gray v2-svc--e">
            <span className="v2-svc-num">05</span>
            <span className="v2-svc-title">Identidade<br/>visual</span>
          </div>
          {/* 06 — dark tall, col3 rows2-3 */}
          <div className="v2-svc v2-svc--dark v2-svc--f">
            <span className="v2-svc-num">06</span>
            <span className="v2-svc-title">Consultoria<br/>digital</span>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="v2-stats" id="v2-about">
        <div className="v2-stats-ghost"><div>res</div><div>ult</div><div>ado</div></div>
        <div className="v2-stats-glow" />
        <div className="v2-stats-left">
          <h2 className="v2-stats-title">
            Resultados que<br />provam o<br />
            <span className="v2-pink v2-glow-text">meu impacto</span>
          </h2>
          <div className="v2-filter-pills">
            {['Web Design','Sistemas','Landing Pages','Design'].map(f => (
              <button key={f} className={`v2-filter-pill ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>{f}</button>
            ))}
          </div>
        </div>
        <div className="v2-stats-right">
          <div className="v2-stat-card v2-stat-card--white">
            <h3>Resultados chave</h3>
            <p>Sites entregues com design único, performance e foco em conversão:</p>
            <div className="v2-stat-nums">
              {STATS.map(s => (
                <div key={s.val} className="v2-stat-item">
                  <span className="v2-stat-val">{s.val}</span>
                  <span className="v2-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WORKS — carrossel 3D estilo Octo */}
      <section className="v2-works" id="v2-contact">
        <div className="v2-works-glow" />
        <div className="v2-works-header">
          <h2 className="v2-works-title">
            Nosso trabalho<br />
            <span className="v2-pink v2-glow-text">fala</span> por nós
          </h2>
        </div>

        {/* Carrossel 3D */}
        <div className="v2-carousel-3d-wrap">
          <button className="v2-carousel-btn v2-carousel-btn--side v2-carousel-btn--left" onClick={() => setActiveWork(p => (p - 1 + WORKS.length) % WORKS.length)}>←</button>
        <div className="v2-carousel-3d">
          {[-2, -1, 0, 1, 2].map(offset => {
            const i = (activeWork + offset + WORKS.length) % WORKS.length;
            const w = WORKS[i];
            const isCenter = offset === 0;
            const isEdge = Math.abs(offset) === 2;
            const cfgMap = {
              '-2': { tx: -393, ry: 42, sc: 0.60 },
              '-1': { tx: -215, ry: 32, sc: 0.75 },
               '0': { tx:    0, ry:  0, sc: 1    },
               '1': { tx:  215, ry:-32, sc: 0.75 },
               '2': { tx:  393, ry:-42, sc: 0.60 },
            };
            const { tx, ry, sc } = cfgMap[String(offset)];
            return (
              <div
                key={offset}
                className={`v2-card3d-wrap ${isCenter ? 'v2-card3d-wrap--center' : ''}`}
                style={{
                  transform: `perspective(900px) translateX(${tx}px) rotateY(${ry}deg) scale(${sc})`,
                  zIndex: isCenter ? 10 : isEdge ? 3 : 5,
                  opacity: isEdge ? 0.55 : 1,
                }}
                onClick={() => !isCenter && setActiveWork(i)}
              >
                <div className={`v2-card3d ${isCenter ? 'center' : ''}`}
                  style={{ filter: isCenter ? 'none' : 'grayscale(1) brightness(0.55)' }}
                >
                  <img src={w.img} alt={w.title} className="v2-card3d-img" />
                  {isCenter && (
                    <>
                      <div className="v2-card3d-overlay" />
                      <div className="v2-card3d-ghost">{w.title.substring(0,3).toUpperCase()}</div>
                      <div className="v2-card3d-bottom">
                        <div className="v2-card3d-info">
                          <span className="v2-card3d-tag">{w.tag}</span>
                          <h3 className="v2-card3d-title">{w.title}</h3>
                          <p className="v2-card3d-desc">{w.desc}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                {isCenter && (
                  <a href={w.link} className="v2-card3d-btn" onClick={e => e.stopPropagation()}><span style={{display:'inline-block',transform:'rotate(12deg)'}}>↗</span></a>
                )}
              </div>
            );
          })}
        </div>
          <button className="v2-carousel-btn v2-carousel-btn--pink v2-carousel-btn--side v2-carousel-btn--right" onClick={() => setActiveWork(p => (p + 1) % WORKS.length)}>→</button>
        </div>

        {/* Dots */}
        <div className="v2-carousel-dots">
          {WORKS.map((_, i) => (
            <button key={i} className={`v2-dot ${i === activeWork ? 'active' : ''}`} onClick={() => setActiveWork(i)} />
          ))}
        </div>
      </section>

      {/* IMPACTO — depoimentos */}
      <section className="v2-impacto" id="v2-impacto">
        <div className="v2-impacto-ghost"><div>cli</div><div>en</div><div>tes</div></div>
        <div className="v2-impacto-glow" />
        <div className="v2-impacto-header">
          <span className="v2-about-label">DEPOIMENTOS</span>
          <h2 className="v2-impacto-title">
            Clientes que<br /><span className="v2-pink v2-glow-text">confiam</span> no trabalho
          </h2>
        </div>
        <div className="v2-impacto-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="v2-impacto-card">
              <p className="v2-impacto-text">"{t.text}"</p>
              <div className="v2-impacto-author">
                <span className="v2-impacto-name">{t.name}</span>
                <span className="v2-impacto-role">{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* ABOUT */}
      <div className="v2-about-wrap">
        <img src="/rabo.jpg" alt="" className="v2-about-rabo" />
        <div className="v2-about-ghost">ry.<br/>an.</div>
        <div className="v2-about-glow" />
      <section className="v2-about-section" id="v2-about2">
        <div className="v2-about-img-wrap">
          <img src="/foto-ryan.png" alt="Ryan Viana" className="v2-about-img" />
          <div className="v2-about-glass-badge">
            <span>Ryan Viana</span>
            <small>Desenvolvedor Web</small>
          </div>
        </div>
        <div className="v2-about-text">
          <span className="v2-about-label">SOBRE MIM</span>
          <h2 className="v2-about-title">
            Desenvolvedor web com mais de <span className="v2-pink">5 anos</span> entregando resultado real.
          </h2>
          <p>Do site institucional ao sistema complexo — código limpo, design estratégico e entrega no prazo.</p>
          <div className="v2-about-skills">
            {['React','Vite','JavaScript','CSS3','Node.js','Supabase'].map(s => (
              <span key={s} className="v2-skill-pill">{s}</span>
            ))}
          </div>
          <a href="https://wa.me/5519994175385" target="_blank" rel="noreferrer" className="v2-btn-glass">FALAR COMIGO</a>
        </div>
      </section>
      </div>

      {/* FOOTER estilo Octo */}
      <footer className="v2-footer">
        <div className="v2-footer-glow" />
        <div className="v2-footer-ghost2">
          <div>ryan.</div>
          <div>creator.</div>
          <div>dev.</div>
        </div>
        <div className="v2-footer-inner">
          {/* Col 1 — logo + social */}
          <div className="v2-footer-col v2-footer-col--brand">
            <div className="v2-footer-logo">RYAN <span>DEV</span><br/>CREATOR.</div>
            <div className="v2-footer-social">
              <a href="https://instagram.com/rdcreator" target="_blank" rel="noreferrer" className="v2-footer-social-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://wa.me/5519994175385" target="_blank" rel="noreferrer" className="v2-footer-social-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
            </div>
          </div>

          {/* Col 2 — nav */}
          <div className="v2-footer-col v2-footer-col--nav">
            <button onClick={() => scrollTo('v2-work')}>início</button>
            <button onClick={() => scrollTo('v2-about2')}>sobre mim</button>
            <button onClick={() => scrollTo('v2-services')}>serviços</button>
            <button onClick={() => scrollTo('v2-contact')}>trabalhos</button>
          </div>

          {/* Col 3 — headline + CTA + email */}
          <div className="v2-footer-col v2-footer-col--cta">
            <h2 className="v2-footer-headline">
              vamos ser felizes<br />
              <span className="v2-pink">trabalhando juntos</span>
            </h2>
            <div className="v2-footer-cta-group">
              <a href="https://wa.me/5519994175385" target="_blank" rel="noreferrer" className="v2-footer-cta-btn">
                Contate-me
              </a>
              <p className="v2-footer-email">contato@ryancreator.dev</p>
            </div>
          </div>
        </div>

        <div className="v2-footer-bottom">
          <span>© 2025 <a href="https://ryancreator.dev" target="_blank" rel="noreferrer" style={{color:'inherit'}}>RDCreator</a>. Todos os direitos reservados.</span>
        </div>
      </footer>
    </div>
  );
}
