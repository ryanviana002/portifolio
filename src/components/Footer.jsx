import './Footer.css';
import Ticker from './Ticker';
import { ShinyButton } from '@/components/ui/shiny-button';

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

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
          <ShinyButton href="https://wa.me/5519994175385" target="_blank" rel="noreferrer">
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <WhatsAppIcon /> Chamar no WhatsApp
            </span>
          </ShinyButton>
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
            <li><span className="footer-contact-label">WhatsApp:</span> (19) 99417-5385</li>
            <li><span className="footer-contact-label">E-mail:</span> contato@ryancreator.dev</li>
            <li><a href="https://www.instagram.com/rdevcreator" target="_blank" rel="noreferrer" style={{color: '#e1306c'}}>Instagram</a></li>
            <li><a href="https://www.linkedin.com/in/ryanvrvianas/" target="_blank" rel="noreferrer" style={{color: '#0ea5e9'}}>LinkedIn</a></li>
            <li><a href="https://github.com/ryanviana002" target="_blank" rel="noreferrer" style={{color: 'rgba(255,255,255,0.4)'}}>GitHub</a></li>
            <li><span className="footer-contact-label">Local:</span> Brasil (100% remoto)</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Ryan Dev Creator — Todos os direitos reservados.</span>
        <a href="https://ryancreator.dev" target="_blank" rel="noreferrer" className="footer-designed">DESIGNED & DEVELOPED BY RDCreator</a>
        <ShinyButton href="#contato">INICIAR PROJETO</ShinyButton>
      </div>
    </footer>
  );
}
