import { useState, useEffect } from 'react';
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
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, toggleTheme] = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <a href="#inicio" className="navbar-logo">
        <img src={dark ? '/logo-rdc.png' : '/logo-light.png'} alt="RDC" className="navbar-logo-img" />
      </a>

      <ul className={`navbar-links${menuOpen ? ' open' : ''}`}>
        {links.map(l => (
          <li key={l.label}>
            <a href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>
          </li>
        ))}
        <li className="navbar-mobile-actions">
          <a href="#contato" className="btn-outline" onClick={() => setMenuOpen(false)}>INICIAR PROJETO</a>
          <a href="https://wa.me/5519992525515" target="_blank" rel="noreferrer" className="btn-solid" onClick={() => setMenuOpen(false)}>WHATSAPP</a>
        </li>
      </ul>

      <div className="navbar-actions">
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {dark ? '☀' : '🌙'}
        </button>
        <a href="#contato" className="btn-outline">INICIAR PROJETO</a>
        <a
          href="https://wa.me/55SEUNUMERO"
          target="_blank"
          rel="noreferrer"
          className="btn-solid"
        >
          WHATSAPP
        </a>
      </div>

      <button
        className={`hamburger${menuOpen ? ' active' : ''}`}
        onClick={() => setMenuOpen(o => !o)}
        aria-label="Menu"
      >
        <span /><span /><span />
      </button>
    </nav>
  );
}
