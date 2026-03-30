import './Ticker.css';

export default function Ticker({ items, reverse = false }) {
  const doubled = [...items, ...items];
  return (
    <div className={`ticker-bar${reverse ? ' ticker-reverse' : ''}`}>
      <div className="ticker-bar-inner">
        <div className="ticker-bar-track">
          {doubled.map((t, i) => (
            <span key={i}>{t} <span className="ticker-bar-dot">•</span> </span>
          ))}
        </div>
      </div>
    </div>
  );
}
