import './Footer.css';
import Ticker from './Ticker';

const navLinks = [
  { label: 'Início', href: '#inicio' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'Método', href: '#metodo' },
  { label: 'Portfólio', href: '#portfolio' },
  { label: 'Impacto', href: '#impacto' },
  { label: 'Contato', href: '#contato' },
];

export default function Footer() {
  return (
    <footer className="footer">
      <Ticker items={['SUA MARCA MERECE SER LENDÁRIA', 'DESIGN QUE VENDE', 'CÓDIGO QUE FUNCIONA', 'O PRÓXIMO NÍVEL COMEÇA AGORA']} />

      <div className="footer-main">
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="logo-r">R</span><span className="logo-d">D</span><span className="logo-c">C</span>
          </div>
          <p className="footer-tagline">
            Criação de sites, sistemas e design para marcas que querem se destacar.
          </p>
          <a
            href="https://wa.me/5519992525515"
            target="_blank"
            rel="noreferrer"
            className="footer-wa"
          >
            💬 Chamar no WhatsApp
          </a>
        </div>

        <div className="footer-col">
          <h4>Navegação</h4>
          <ul>
            {navLinks.map(l => (
              <li key={l.label}><a href={l.href}>{l.label}</a></li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>Serviços</h4>
          <ul>
            <li><a href="#servicos">Criação de Sites</a></li>
            <li><a href="#servicos">Landing Pages</a></li>
            <li><a href="#servicos">Sistema 4GL Informix</a></li>
            <li><a href="#servicos">Design & Canva</a></li>
            <li><a href="#servicos">E-commerce</a></li>
            <li><a href="#servicos">Manutenção</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contato</h4>
          <ul>
            <li><span className="footer-contact-label">WhatsApp:</span> (19) 99252-5515</li>
            <li><span className="footer-contact-label">E-mail:</span> ryanviana002@gmail.com</li>
            <li><a href="https://www.linkedin.com/in/ryanvrvianas/" target="_blank" rel="noreferrer" style={{color: '#0ea5e9'}}>LinkedIn</a></li>
            <li><a href="https://github.com/ryanviana002" target="_blank" rel="noreferrer" style={{color: 'rgba(255,255,255,0.4)'}}>GitHub</a></li>
            <li><span className="footer-contact-label">Local:</span> Brasil (100% remoto)</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Ryan Dev Creator — Todos os direitos reservados.</span>
        <a href="https://ryancreator.dev" target="_blank" rel="noreferrer" className="footer-designed">DESIGNED & DEVELOPED BY RDCreator</a>
        <a href="#contato" className="footer-cta">INICIAR PROJETO</a>
      </div>
    </footer>
  );
}
