import './Sobre.css';

const tags = ['Web Design', 'Dev 4GL Informix', 'React / Vite', 'Designer Canva', 'Sistemas Web', 'UI/UX'];

export default function Sobre() {
  return (
    <section id="sobre" className="sobre">
      <div className="sobre-inner">
        <div className="sobre-label">
          <span className="section-num">01</span>
          <span className="section-tag">SOBRE MIM</span>
        </div>

        <div className="sobre-grid">
          <div className="sobre-left">
            <h2 className="sobre-title">
              O dev que cria<br />
              <span className="grad-pink">experiências</span><br />
              <span className="grad-cyan">que vendem.</span>
            </h2>
            <div className="sobre-tags">
              {tags.map(t => (
                <span key={t} className="sobre-tag">{t}</span>
              ))}
            </div>
          </div>

          <div className="sobre-right">
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
