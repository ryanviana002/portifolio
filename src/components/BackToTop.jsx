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
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btt-arrow">
        <path d="M5 15l7-7 7 7"/>
      </svg>
    </button>
  );
}
