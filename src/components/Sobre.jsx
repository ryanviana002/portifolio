import { useEffect, useRef, useState } from 'react';
import './Sobre.css';

const techs = [
  {
    name: 'React',
    color: '#61dafb',
    icon: <svg viewBox="0 0 100 100" width="26" height="26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="50" rx="10" ry="10" fill="#61dafb"/>
      <ellipse cx="50" cy="50" rx="46" ry="18" stroke="#61dafb" strokeWidth="4" fill="none"/>
      <ellipse cx="50" cy="50" rx="46" ry="18" stroke="#61dafb" strokeWidth="4" fill="none" transform="rotate(60 50 50)"/>
      <ellipse cx="50" cy="50" rx="46" ry="18" stroke="#61dafb" strokeWidth="4" fill="none" transform="rotate(120 50 50)"/>
    </svg>,
  },
  {
    name: 'CSS3',
    color: '#2965f1',
    icon: <svg viewBox="0 0 100 100" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="10" fill="#2965f1"/>
      <text x="50" y="55" textAnchor="middle" dominantBaseline="middle" fontSize="36" fontWeight="900" fill="white" fontFamily="Arial, sans-serif">CSS3</text>
    </svg>,
  },
  {
    name: 'Vite',
    color: '#9e9eff',
    icon: <svg viewBox="0 0 100 100" width="26" height="26" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,5 95,25 50,50 5,25" fill="#9e9eff" opacity="0.3"/>
      <polygon points="50,5 95,25 50,50" fill="#ff007f" opacity="0.8"/>
      <polygon points="50,50 95,25 95,75 50,95" fill="#9e9eff" opacity="0.5"/>
      <polygon points="50,50 5,25 5,75 50,95" fill="#9e9eff" opacity="0.8"/>
      <line x1="50" y1="10" x2="30" y2="80" stroke="#fff" strokeWidth="5" strokeLinecap="round"/>
      <line x1="30" y1="50" x2="65" y2="50" stroke="#fff" strokeWidth="4" strokeLinecap="round"/>
    </svg>,
  },
  {
    name: 'JavaScript',
    color: '#f7df1e',
    icon: <svg viewBox="0 0 100 100" width="26" height="26" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#f7df1e" rx="8"/>
      <text x="12" y="75" fontSize="52" fontWeight="900" fill="#222" fontFamily="Arial">JS</text>
    </svg>,
  },
  {
    name: 'Canva',
    color: '#00c4cc',
    icon: <svg viewBox="0 0 100 100" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="canva-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00c4cc"/>
          <stop offset="100%" stopColor="#7d2ae8"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill="url(#canva-grad)"/>
      <text x="50" y="57" textAnchor="middle" dominantBaseline="middle" fontSize="26" fontWeight="bold" fontStyle="italic" fill="white" fontFamily="Georgia, serif">Canva</text>
    </svg>,
  },
  {
    name: '4GL',
    color: '#9e9eff',
    icon: <svg viewBox="0 0 100 100" width="26" height="26" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="10" fill="#1a1a2e"/>
      <rect x="5" y="5" width="90" height="90" rx="8" fill="none" stroke="#9e9eff" strokeWidth="3"/>
      <text x="50" y="62" textAnchor="middle" fontSize="30" fontWeight="900" fill="#9e9eff" fontFamily="monospace">4GL</text>
    </svg>,
  },
];

const skills = [
  { name: '4GL Informix', level: 98, color: '#9e9eff' },
  { name: 'Web Design / UI', level: 92, color: '#ff007f' },
  { name: 'React / Vite', level: 88, color: '#00f2fe' },
  { name: 'CSS / Animações', level: 85, color: '#ff007f' },
  { name: 'Designer Canva', level: 80, color: '#00f2fe' },
];

function SkillBar({ name, level, color }) {
  const barRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        barRef.current.style.width = level + '%';
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    if (barRef.current) obs.observe(barRef.current.parentElement);
    return () => obs.disconnect();
  }, [level]);

  return (
    <div className="skill-item">
      <div className="skill-header">
        <span className="skill-name">{name}</span>
        <span className="skill-pct" style={{ color }}>{level}%</span>
      </div>
      <div className="skill-track">
        <div ref={barRef} className="skill-fill" style={{ background: color }} />
      </div>
    </div>
  );
}

function CountUp({ to, duration = 1800, prefix = '', suffix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          setVal(Math.round(ease * to));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to, duration]);

  return <span ref={ref}>{prefix}{val}{suffix}</span>;
}

function MatrixGlitch({ active }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    const cols = Math.floor(W / 10);
    const drops = Array.from({ length: cols }, () => Math.random() * H / 10);
    const chars = 'ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ01'.split('');

    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.fillRect(0, 0, W, H);
      ctx.font = '10px monospace';
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const bright = Math.random() > 0.9;
        ctx.fillStyle = bright ? '#fff' : '#00ff41';
        ctx.fillText(char, i * 10, y * 10);
        if (y * 10 > H && Math.random() > 0.975) drops[i] = 0;
        else drops[i] += 0.5;
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [active]);

  if (!active) return null;
  return <canvas ref={canvasRef} className="sobre-matrix-canvas" />;
}

export default function Sobre() {
  const [glitching, setGlitching] = useState(false);
  const glitchTimer = useRef(null);

  const triggerGlitch = () => {
    if (glitching) return;
    setGlitching(true);
    clearTimeout(glitchTimer.current);
    glitchTimer.current = setTimeout(() => setGlitching(false), 2000);
  };

  return (
    <section id="sobre" className="sobre">
      <div className="sobre-inner">
        <div className="sobre-label">
          <span className="section-num">01</span>
          <span className="section-tag">SOBRE MIM</span>
        </div>

        <div className="sobre-grid">
          {/* Coluna esquerda — foto + skills */}
          <div className="sobre-left">
            <div className="sobre-foto-wrap" onClick={triggerGlitch} style={{ cursor: 'pointer' }}>
              <div className={`sobre-foto${glitching ? ' sobre-foto--glitch' : ''}`}>
                <img src="/foto-ryan.png" alt="Ryan Viana" className="sobre-foto-img"
                  onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
                <div className="sobre-foto-placeholder">
                  <span>RV</span>
                  <p>Foto em breve</p>
                </div>
                <MatrixGlitch active={glitching} />
              </div>
              <div className="sobre-foto-badge">
                <span className="badge-num">+5</span>
                <span className="badge-label">anos de exp.</span>
              </div>
            </div>

            <div className="sobre-techs">
              {techs.map(t => (
                <div key={t.name} className="tech-icon" style={{ '--tech-color': t.color }}>
                  {t.icon}
                  <span>{t.name}</span>
                </div>
              ))}
            </div>

            <div className="sobre-skills">
              {skills.map(s => <SkillBar key={s.name} {...s} />)}
            </div>
          </div>

          {/* Coluna direita — texto */}
          <div className="sobre-right">
            <h2 className="sobre-title">
              O dev que cria<br />
              <span className="grad-pink">experiências</span><br />
              <span className="grad-cyan">que vendem.</span>
            </h2>
            <p className="sobre-text">
              Sou <strong>Ryan Dev Creator</strong> — desenvolvedor web, programador 4GL Informix e designer. Crio sites modernos, sistemas robustos e identidades visuais que geram resultado real.
            </p>
            <p className="sobre-text">
              Combinando <span className="hl">desenvolvimento de alto nível</span> com <span className="hl">design estratégico</span>, entrego projetos completos: do layout à funcionalidade, do conceito à conversão.
            </p>
            <div className="sobre-stats">
              <div className="stat">
                <span className="stat-num"><CountUp to={5} prefix="+" /></span>
                <span className="stat-label">Anos de experiência</span>
              </div>
              <div className="stat">
                <span className="stat-num"><CountUp to={30} prefix="+" /></span>
                <span className="stat-label">Projetos entregues</span>
              </div>
              <div className="stat">
                <span className="stat-num"><CountUp to={100} suffix="%" /></span>
                <span className="stat-label">Foco em resultado</span>
              </div>
            </div>
            <a href="#contato" className="sobre-cta" onClick={e => { e.preventDefault(); window.dispatchEvent(new Event('rdc:portal')); }}>INICIAR UM PROJETO</a>
          </div>
        </div>
      </div>
    </section>
  );
}
