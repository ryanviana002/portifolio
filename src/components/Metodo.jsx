import './Metodo.css';

const steps = [
  {
    num: '01',
    title: 'Diagnóstico & Briefing',
    desc: 'Entendo seu objetivo, público-alvo e identidade. Definimos escopo, prazos e as prioridades do projeto antes de qualquer linha de código.',
  },
  {
    num: '02',
    title: 'Conceito & Estrutura',
    desc: 'Crio a arquitetura visual e técnica: wireframes, paleta, tipografia e a estrutura de navegação que vai guiar a experiência do usuário.',
  },
  {
    num: '03',
    title: 'Produção & Desenvolvimento',
    desc: 'Design e código lado a lado. Cada detalhe refinado com foco em performance, responsividade e consistência visual.',
  },
  {
    num: '04',
    title: 'Entrega & Handoff',
    desc: 'Projeto entregue organizado, com orientações de uso, arquivos exportados e suporte pós-entrega quando necessário.',
  },
];

export default function Metodo() {
  return (
    <section id="metodo" className="metodo">
      <div className="metodo-inner">
        <div className="sobre-label">
          <span className="section-num">03</span>
          <span className="section-tag">MÉTODO</span>
        </div>

        <div className="metodo-header">
          <h2 className="metodo-title">
            Processo claro,<br />
            <span className="grad-pink">entrega</span>{' '}
            <span className="grad-cyan">garantida.</span>
          </h2>
        </div>

        <div className="metodo-steps">
          {steps.map((s, i) => (
            <div key={i} className="step">
              <div className="step-num">{s.num}</div>
              <div className="step-line" />
              <div className="step-content">
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
