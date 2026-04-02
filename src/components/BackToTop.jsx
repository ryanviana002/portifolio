import { useEffect, useState } from 'react';
import './BackToTop.css';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = () => {
    setLaunching(true);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setLaunching(false), 800);
    }, 400);
  };

  return (
    <button
      className={`back-to-top${visible ? ' visible' : ''}${launching ? ' launching' : ''}`}
      onClick={handleClick}
      title="Voltar ao topo"
    >
      <svg viewBox="0 0 120 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="btt-rocket">
        <path d="M60 8 C38 38 28 85 28 118 L92 118 C92 85 82 38 60 8Z" stroke="#00f2fe" strokeWidth="1.5" fill="none"/>
        <circle cx="60" cy="70" r="10" stroke="#00f2fe" strokeWidth="1.5" fill="none"/>
        <rect x="28" y="118" width="64" height="8" rx="3" stroke="#9e9eff" strokeWidth="1.5" fill="none"/>
        <path d="M28 118 L8 150 L28 140" stroke="#ff007f" strokeWidth="1.5" fill="none"/>
        <path d="M92 118 L112 150 L92 140" stroke="#ff007f" strokeWidth="1.5" fill="none"/>
      </svg>
      <span className="btt-flame" />
    </button>
  );
}
