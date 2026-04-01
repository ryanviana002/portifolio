import { useEffect, useState } from 'react';
import './SectionNav.css';

const sections = [
  { id: 'inicio', label: 'Início' },
  { id: 'sobre', label: 'Sobre' },
  { id: 'servicos', label: 'Serviços' },
  { id: 'metodo', label: 'Método' },
  { id: 'portfolio', label: 'Portfólio' },
  { id: 'impacto', label: 'Impacto' },
  { id: 'contato', label: 'Contato' },
];

export default function SectionNav() {
  const [active, setActive] = useState('inicio');

  useEffect(() => {
    const observers = sections.map(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { threshold: 0.4 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, []);

  return (
    <nav className="section-nav">
      {sections.map(({ id, label }) => (
        <a key={id} href={`#${id}`} className={`sn-dot${active === id ? ' active' : ''}`} title={label}>
          <span className="sn-label">{label}</span>
          <span className="sn-circle" />
        </a>
      ))}
    </nav>
  );
}
