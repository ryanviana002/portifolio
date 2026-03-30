import './Impacto.css';

const stats = [
  { num: '+5', label: 'Anos de experiência', desc: 'Desenvolvendo soluções digitais reais.' },
  { num: '+30', label: 'Projetos entregues', desc: 'Sites, sistemas e peças visuais.' },
  { num: '3', label: 'Especialidades', desc: 'Web, 4GL Informix e Design.' },
  { num: '100%', label: 'Comprometimento', desc: 'Do briefing à entrega final.' },
];

const testimonials = [
  {
    text: '"O Ryan entregou um site incrível para nossa oficina. Moderno, rápido e exatamente o que precisávamos. Recomendo muito!"',
    name: '— Cliente Auto Ar Shop',
    role: 'Empresário • São Paulo',
  },
  {
    text: '"Sistema entregue no prazo, funciona perfeitamente. Relatórios claros, integração perfeita. Profissional de verdade."',
    name: '— Gestor Industrial',
    role: 'Setor Industrial • Interior SP',
  },
  {
    text: '"As peças de design ficaram ótimas! Identidade visual coerente, posts lindos. Muito criativo e atencioso."',
    name: '— Empreendedora Digital',
    role: 'E-commerce • Brasil',
  },
];

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
              <span className="stat-big">{s.num}</span>
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
