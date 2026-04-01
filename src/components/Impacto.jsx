import { useEffect, useRef, useState } from 'react';
import './Impacto.css';

const stats = [
  { num: 5, suffix: '+', label: 'Anos de experiência', desc: 'Desenvolvendo soluções digitais reais.' },
  { num: 30, suffix: '+', label: 'Projetos entregues', desc: 'Sites, sistemas e peças visuais.' },
  { num: 3, suffix: '', label: 'Especialidades', desc: 'Web, 4GL Informix e Design.' },
  { num: 100, suffix: '%', label: 'Comprometimento', desc: 'Do briefing à entrega final.' },
];

const testimonials = [
  {
    text: '"Sistema moderno, rápido e bem estruturado. O site trouxe muito mais credibilidade pra nossa empresa e facilitou o contato com clientes."',
    name: '— Genuína Ar Automotivo',
    role: 'Climatização Automotiva • Campinas/SP',
  },
  {
    text: '"Atendimento excelente e entrega acima do esperado. O site ficou profissional, intuitivo e ajudou bastante na geração de novos clientes."',
    name: '— Victor',
    role: 'Prestação de Serviços • Brasil',
  },
  {
    text: '"Profissional dedicado e comprometido. Resultado final superou as expectativas — site bonito, rápido e que realmente converte."',
    name: '— Auto Ar Shop',
    role: 'Mecânico Automotivo • Campinas/SP',
  },
];

function AnimatedCounter({ target, suffix }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 1800;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        const interval = setInterval(() => {
          current += increment;
          if (current >= target) {
            setCount(target);
            clearInterval(interval);
          } else {
            setCount(Math.floor(current));
          }
        }, duration / steps);
      }
    }, { threshold: 0.4 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="stat-big">
      {count}{suffix}
    </span>
  );
}

export default function Impacto() {
  return (
    <section id="impacto" className="impacto">
      <div className="impacto-inner">
        <div className="sobre-label">
          <span className="section-num">05</span>
          <span className="section-tag">IMPACTO & RESULTADOS</span>
        </div>

        <div className="impacto-header">
          <h2 className="impacto-title">
            Resultados que<br />
            <span className="grad-pink">transformam</span>{' '}
            <span className="grad-cyan">negócios.</span>
          </h2>
          <p className="impacto-sub">
            Cada projeto entregue com foco em qualidade, prazo e resultado real para o cliente.
          </p>
        </div>

        <div className="stats-grid">
          {stats.map((s, i) => (
            <div key={i} className="stat-card">
              <AnimatedCounter target={s.num} suffix={s.suffix} />
              <span className="stat-title">{s.label}</span>
              <span className="stat-desc">{s.desc}</span>
            </div>
          ))}
        </div>

        <div className="testimonials">
          {testimonials.map((t, i) => (
            <div key={i} className="testimonial">
              <p className="test-text">{t.text}</p>
              <div className="test-author">
                <span className="test-name">{t.name}</span>
                <span className="test-role">{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
