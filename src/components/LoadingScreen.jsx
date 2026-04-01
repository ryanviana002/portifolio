import { useEffect, useState } from 'react';
import './LoadingScreen.css';

export default function LoadingScreen({ onDone }) {
  const [phase, setPhase] = useState('in'); // in | out

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('out'), 1800);
    const t2 = setTimeout(() => onDone(), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className={`loading-screen ${phase}`}>
      <div className="loading-logo">
        <span className="ll-r">R</span>
        <span className="ll-d">D</span>
        <span className="ll-c">C</span>
      </div>
      <div className="loading-bar">
        <div className="loading-bar-fill" />
      </div>
    </div>
  );
}
