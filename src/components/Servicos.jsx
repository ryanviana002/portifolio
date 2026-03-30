import { useState } from 'react';
import './Servicos.css';

const services = [
  {
    num: '01',
    tag: 'WEB • FRONTEND',
    title: 'Web Design & Criação de Sites',
    desc: 'Sites modernos, rápidos e focados em conversão. Do portfólio profissional à landing page que vende — com React, Vite e design premium.',
    items: ['Design responsivo', 'Alta performance', 'SEO técnico', 'Animações modernas'],
  },
  {
    num: '02',
    tag: 'SISTEMA • BACKEND',
    title: 'Desenvolvimento 4GL Informix',
    desc: 'Sistemas empresariais robustos com 4GL Informix. Automação de processos, relatórios inteligentes e integrações para empresas que precisam de solidez.',
    items: ['4GL / Informix', 'Relatórios customizados', 'Integração de sistemas', 'Automação de processos'],
  },
  {
    num: '03',
    tag: 'DESIGN • IDENTIDADE',
    title: 'Design & Identidade Visual (Canva)',
    desc: 'Criação de peças visuais que comunicam com autoridade: logos, posts, apresentações, banners e materiais para redes sociais com identidade profissional.',
    items: ['Logos e branding', 'Posts para redes sociais', 'Apresentações', 'Banners e flyers'],
  },
];

export default function Servicos() {
  const [open, setOpen] = useState(null);

  return (
    <section id="servicos" className="servicos">
      <div className="servicos-inner">
        <div className="sobre-label">
          <span className="section-num">02</span>
          <span className="section-tag">SERVIÇOS</span>
        </div>

        <div className="servicos-header">
          <h2 className="servicos-title">
            Engenharia de<br />
            <span className="grad-pink">Soluções</span>{' '}
            <span className="grad-cyan">Digitais</span>
          </h2>
          <p className="servicos-sub">
            Do design ao código — entrego o projeto completo, com qualidade e foco em resultado.
          </p>
        </div>

        <div className="servicos-list">
          {services.map((s, i) => (
            <div
              key={i}
              className={`serv-item${open === i ? ' open' : ''}`}
              onClick={() => setOpen(open === i ? null : i)}
            >
              <div className="serv-row">
                <span className="serv-num">{s.num}</span>
                <div className="serv-info">
                  <span className="serv-tag">{s.tag}</span>
                  <h3 className="serv-name">{s.title}</h3>
                </div>
                <span className="serv-toggle">{open === i ? '−' : '+'}</span>
              </div>
              <div className="serv-body">
                <p className="serv-desc">{s.desc}</p>
                <ul className="serv-items">
                  {s.items.map(it => (
                    <li key={it}><span className="serv-dot" />  {it}</li>
                  ))}
                </ul>
                <a href="#contato" className="serv-cta">SOLICITAR SERVIÇO</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
