import { useEffect, useRef } from 'react';
import './Sobre.css';

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

export default function Sobre() {
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
            <div className="sobre-foto-wrap">
              <div className="sobre-foto">
                <img src="/foto-ryan.jpg" alt="Ryan Viana" className="sobre-foto-img"
                  onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
                <div className="sobre-foto-placeholder">
                  <span>RV</span>
                  <p>Foto em breve</p>
                </div>
              </div>
              <div className="sobre-foto-badge">
                <span className="badge-num">+5</span>
                <span className="badge-label">anos de exp.</span>
              </div>
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
                <span className="stat-num">+5</span>
                <span className="stat-label">Anos de experiência</span>
              </div>
              <div className="stat">
                <span className="stat-num">+30</span>
                <span className="stat-label">Projetos entregues</span>
              </div>
              <div className="stat">
                <span className="stat-num">100%</span>
                <span className="stat-label">Foco em resultado</span>
              </div>
            </div>
            <a href="#contato" className="sobre-cta">INICIAR UM PROJETO</a>
          </div>
        </div>
      </div>
    </section>
  );
}
