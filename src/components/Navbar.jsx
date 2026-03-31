import { useState } from 'react';
import './Navbar.css';

function useTheme() {
  const [dark, setDark] = useState(true);
  const toggle = () => {
    setDark(d => {
      document.documentElement.setAttribute('data-theme', d ? 'light' : 'dark');
      return !d;
    });
  };
  return [dark, toggle];
}

const links = [
  { label: 'INÍCIO', href: '#inicio' },
  { label: 'SOBRE', href: '#sobre' },
  { label: 'SERVIÇOS', href: '#servicos' },
  { label: 'MÉTODO', href: '#metodo' },
  { label: 'PORTFÓLIO', href: '#portfolio' },
  { label: 'CONTATO', href: '#contato' },
];

export default function Navbar() {
  const [expanded, setExpanded] = useState(false);
  const [dark, toggleTheme] = useTheme();

  return (
    <>
      {expanded && <div className="sidebar-overlay" onClick={() => setExpanded(false)} />}

      <nav className={`sidebar${expanded ? ' expanded' : ''}`}>

        {/* Topo — logo + toggle + CTA */}
        <div className="sidebar-top">
          <a href="#inicio" className="sidebar-logo" onClick={() => setExpanded(false)}>
            <img src={dark ? '/logo-rdc.png' : '/logo-light.png'} alt="RDC" className="sidebar-logo-img" />
          </a>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {dark ? '☀' : '🌙'}
          </button>
          <a href="#contato" className="sidebar-cta" onClick={() => setExpanded(false)}>
            <span className="sidebar-cta-icon">✦</span>
            <span className="sidebar-label">INICIAR PROJETO</span>
          </a>
        </div>

        {/* Espaço flexível */}
        <div className="sidebar-spacer" />

        {/* Links embaixo */}
        <ul className="sidebar-links">
          {links.map(l => (
            <li key={l.label}>
              <a href={l.href} onClick={() => setExpanded(false)}>
                <span className="sidebar-label">{l.label}</span>
              </a>
            </li>
          ))}
        </ul>

        {/* Toggle hamburguer */}
        <button className="sidebar-toggle" onClick={() => setExpanded(o => !o)} aria-label="Menu">
          <span /><span /><span />
        </button>

      </nav>
    </>
  );
}
