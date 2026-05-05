import { useRef } from 'react';
import './Portfolio.css';
import { ShinyButton } from '@/components/ui/shiny-button';
import { RadialScrollGallery } from '@/components/ui/portfolio-and-image-gallery';

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
    if (shine) shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.08), transparent 60%)`;
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
    logo: '/logo-autoairshop.png',
    bg: 'linear-gradient(135deg, #1a3a6e 0%, #0d1f3c 100%)',
  },
  {
    num: '02',
    tag: 'WEB DESIGN • INSTITUCIONAL',
    title: 'Genuína Ar Automotivo',
    desc: 'Site institucional para empresa automotiva com identidade visual profissional, seções de serviços e formulário de contato.',
    tech: ['HTML', 'CSS3', 'JavaScript'],
    color: '#00f2fe',
    link: 'https://genuinaarautomotivo.com/',
    logo: '/logo-genuina.png',
    bg: 'linear-gradient(135deg, #2a5a9e 0%, #1a3a6e 100%)',
  },
  {
    num: '03',
    tag: 'PRODUTO DIGITAL • LANDING PAGE',
    title: 'Delega',
    desc: 'Landing page para app de marketplace de serviços — conecta pessoas com profissionais qualificados para tarefas do dia a dia.',
    tech: ['HTML', 'Tailwind', 'CSS3'],
    color: '#D95D00',
    link: 'https://ryancreator.dev/delega',
    logo: '/logo-delega.png',
    bg: '#FF6A00',
  },
  {
    num: '04',
    tag: 'SISTEMA WEB • IA',
    title: 'Preview AI',
    desc: 'Geração de sites com IA para prospecção via Google Maps. Automatiza contato com +50 leads/dia.',
    tech: ['Node.js', 'Claude AI', 'Maps API'],
    color: '#9e9eff',
    link: 'https://ryancreator.dev/preview',
    logo: '/preview-maps.png',
    bg: '#0a0a14',
  },
  {
    num: '05',
    tag: 'PORTFÓLIO • REACT',
    title: 'RDCreator',
    desc: 'Portfólio pessoal com animações canvas, efeitos neon, terminal interativo e star warp.',
    tech: ['React', 'Vite', 'GSAP', 'CSS3'],
    color: '#ff007f',
    link: 'https://ryancreator.dev',
    logo: '/logo-rdc.png',
    bg: '#000',
  },
  {
    num: '06',
    tag: 'OPEN SOURCE • GITHUB',
    title: 'GitHub — ryanviana002',
    desc: 'Repositório com projetos de desenvolvimento web, sistemas e experimentos. Código aberto, organizado e documentado.',
    tech: ['React', 'Vite', '4GL', 'CSS3'],
    color: '#9e9eff',
    link: 'https://github.com/ryanviana002',
    bg: '#0d0d1a',
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
      </div>

      <RadialScrollGallery
        baseRadius={560}
        mobileRadius={200}
        scrollDuration={2500}
        visiblePercentage={38}
        startTrigger="center center"
        onItemSelect={(i) => window.open(projects[i].link, '_blank')}
      >
        {(hoveredIndex) =>
          projects.map((p, i) => (
            <TiltCard key={i} className="proj-card proj-card--radial" style={{ '--accent-color': p.color, width: '300px' }}>
              <div className="proj-thumb">
                <div className="proj-thumb-bg" />
                {p.logo ? (
                  <div className="proj-logo-wrap" style={{ background: p.bg }}>
                    <img src={p.logo} alt={p.title} className="proj-logo-img" loading="lazy" />
                  </div>
                ) : (
                  <div className="proj-github-thumb">
                    <svg viewBox="0 0 98 96" xmlns="http://www.w3.org/2000/svg" className="proj-github-icon">
                      <path fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" fill="currentColor"/>
                    </svg>
                    <span className="proj-github-user">ryanviana002</span>
                  </div>
                )}
              </div>
              <div className="proj-info">
                <span className="proj-tag">{p.tag}</span>
                <h3 className="proj-name">{p.title}</h3>
                <p className="proj-desc">{p.desc}</p>
                <div className="proj-tech">
                  {p.tech.map(t => <span key={t} className="tech-badge">{t}</span>)}
                </div>
              </div>
              <ShinyButton href={p.link} target="_blank" rel="noreferrer">VER MAIS</ShinyButton>
            </TiltCard>
          ))
        }
      </RadialScrollGallery>

      <div className="portfolio-inner">
        <div className="portfolio-cta-row">
          <ShinyButton href="#contato">SOLICITAR ORÇAMENTO</ShinyButton>
        </div>
      </div>
    </section>
  );
}
