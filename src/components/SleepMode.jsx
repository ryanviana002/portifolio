import { useEffect, useState } from 'react';
import './SleepMode.css';

const IDLE_TIME = 120000; // 2 minutos

export default function SleepMode() {
  const [sleeping, setSleeping] = useState(false);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    let timer;
    let fadeInterval;

    const sleep = () => {
      setSleeping(true);
      let op = 0;
      fadeInterval = setInterval(() => {
        op = Math.min(1, op + 0.02);
        setOpacity(op);
        if (op >= 1) clearInterval(fadeInterval);
      }, 30);
    };

    const wake = () => {
      clearInterval(fadeInterval);
      let op = opacity;
      const fadeOut = setInterval(() => {
        op = Math.max(0, op - 0.05);
        setOpacity(op);
        if (op <= 0) {
          clearInterval(fadeOut);
          setSleeping(false);
        }
      }, 20);
      resetTimer();
    };

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(sleep, IDLE_TIME);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, wake, { passive: true }));
    resetTimer();

    return () => {
      clearTimeout(timer);
      clearInterval(fadeInterval);
      events.forEach(e => window.removeEventListener(e, wake));
    };
  }, []);

  if (!sleeping) return null;

  return (
    <div className="sleep-overlay" style={{ opacity }}>
      <div className="sleep-content">
        <div className="sleep-zzz">
          <span style={{ animationDelay: '0s' }}>Z</span>
          <span style={{ animationDelay: '0.4s' }}>Z</span>
          <span style={{ animationDelay: '0.8s' }}>Z</span>
        </div>
        <p className="sleep-msg">Você está descansando...</p>
        <p className="sleep-sub">Mova o mouse para acordar</p>
      </div>
    </div>
  );
}
