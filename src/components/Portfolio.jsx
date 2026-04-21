import { useRef, useState } from 'react';
import './Portfolio.css';

function TiltCard({ children, style, className }) {
  const cardRef = useRef(null);

  const onMove = e => {
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateX = ((y - cy) / cy) * -8;
    const rotateY = ((x - cx) / cx) * 8;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    card.style.transition = 'transform 0.05s ease';
    const shine = card.querySelector('.tilt-shine');
    if (shine) {
      shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.08), transparent 60%)`;
    }
  };

  const onLeave = () => {
    const card = cardRef.current;
    card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
    card.style.transition = 'transform 0.5s ease';
    const shine = card.querySelector('.tilt-shine');
    if (shine) shine.style.background = 'transparent';
  };

  return (
    <div ref={cardRef} className={className} style={style} onMouseMove={onMove} onMouseLeave={onLeave}>
      <div className="tilt-shine" />
      {children}
    </div>
  );
}

const projects = [
  {
    num: '01',
    tag: 'WEB DESIGN • REACT',
    title: 'Auto Ar Shop',
    desc: 'Site institucional para oficina de ar-condicionado automotivo com seções de serviços, diferenciais e CTA para contato direto via WhatsApp.',
    tech: ['React', 'Vite', 'CSS3'],
    color: '#0ea5e9',
    link: 'https://autoarshop.vercel.app/',
    preview: '/preview-autoairshop.png',
  },
  {
    num: '02',
    tag: 'WEB DESIGN • INSTITUCIONAL',
    title: 'Genuína Ar Automotivo',
    desc: 'Site institucional para empresa automotiva com identidade visual profissional, seções de serviços e formulário de contato.',
    tech: ['HTML', 'CSS3', 'JavaScript'],
    color: '#00f2fe',
    link: 'https://genuinaarautomotivo.com/',
    preview: '/preview-genuina.png',
  },
  {
    num: '03',
    tag: 'PRODUTO DIGITAL • LANDING PAGE',
    title: 'Delega',
    desc: 'Landing page para app de marketplace de serviços — conecta pessoas com profissionais qualificados para tarefas do dia a dia.',
    tech: ['HTML', 'Tailwind', 'CSS3'],
    color: '#D95D00',
    link: 'https://ryancreator.dev/delega',
  },
  {
    num: '04',
    tag: 'OPEN SOURCE • GITHUB',
    title: 'GitHub — ryanviana002',
    desc: 'Repositório com projetos de desenvolvimento web, sistemas e experimentos. Código aberto, organizado e documentado.',
    tech: ['React', 'Vite', '4GL', 'CSS3'],
    color: '#9e9eff',
    link: 'https://github.com/ryanviana002',
  },
];

export default function Portfolio() {
  return (
    <section id="portfolio" className="portfolio">
      <div className="portfolio-inner">
        <div className="sobre-label">
          <span className="section-num">04</span>
          <span className="section-tag">PORTFÓLIO</span>
        </div>

        <div className="portfolio-header">
          <h2 className="portfolio-title">
            Uma seleção dos<br />
            <span className="grad-pink">meus melhores</span>{' '}
            <span className="grad-cyan">trabalhos.</span>
          </h2>
          <p className="portfolio-sub">
            Projetos reais, entregues com qualidade e resultado.
          </p>
        </div>

        <div className="portfolio-grid">
          {projects.map((p, i) => (
            <TiltCard key={i} className="proj-card" style={{ '--accent-color': p.color }}>
              <div className="proj-thumb">
                <div className="proj-thumb-bg" />
                {p.preview ? (
                  <div className="proj-preview">
                    <img src={p.preview} alt={p.title} className="proj-preview-img" loading="lazy" />
                  </div>
                ) : p.link.includes('github') ? (
                  <div className="proj-github-thumb">
                    <svg viewBox="0 0 98 96" xmlns="http://www.w3.org/2000/svg" className="proj-github-icon">
                      <path fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" fill="currentColor"/>
                    </svg>
                    <span className="proj-github-user">ryanviana002</span>
                  </div>
                ) : (
                  <div className="proj-preview">
                    <iframe
                      src={p.link}
                      title={p.title}
                      className="proj-iframe"
                      loading="lazy"
                      scrolling="no"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                )}
              </div>
              <div className="proj-info">
                <span className="proj-tag">{p.tag}</span>
                <h3 className="proj-name">{p.title}</h3>
                <p className="proj-desc">{p.desc}</p>
                <div className="proj-tech">
                  {p.tech.map(t => (
                    <span key={t} className="tech-badge">{t}</span>
                  ))}
                </div>
              </div>
              <a href={p.link} target="_blank" rel="noreferrer" className="proj-cta">VER MAIS</a>
            </TiltCard>
          ))}
        </div>

        <div className="portfolio-cta-row">
          <a href="#contato" className="portfolio-main-cta">
            SOLICITAR ORÇAMENTO
          </a>
        </div>
      </div>
    </section>
  );
}
