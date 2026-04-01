import './NotFound.css';

export default function NotFound() {
  return (
    <div className="notfound">
      <div className="nf-content">
        <div className="nf-code">
          <span className="nf-4">4</span>
          <span className="nf-0">0</span>
          <span className="nf-4b">4</span>
        </div>
        <p className="nf-title">Página não encontrada</p>
        <p className="nf-sub">Essa rota não existe. Volte para o início e explore o portfólio.</p>
        <a href="/" className="nf-btn">VOLTAR AO INÍCIO</a>
      </div>
    </div>
  );
}
