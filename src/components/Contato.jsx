import { useState } from 'react';
import './Contato.css';

const services = [
  'Criação de Site',
  'Landing Page',
  'Sistema 4GL Informix',
  'Design & Identidade Visual',
  'E-commerce',
  'Manutenção / Suporte',
];

export default function Contato() {
  const [form, setForm] = useState({ nome: '', email: '', whatsapp: '', empresa: '', servico: '', objetivo: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.nome || !form.whatsapp || !form.objetivo) return;

    setSending(true);

    // Envia email via API Resend
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } catch {}

    setSending(false);
    setSent(true);
  };

  return (
    <section id="contato" className="contato">
      <div className="contato-inner">
        <div className="sobre-label">
          <span className="section-num">06</span>
          <span className="section-tag">INICIAR PROJETO</span>
        </div>

        <div className="contato-grid">
          <div className="contato-left">
            <h2 className="contato-title">
              Vamos criar algo<br />
              <span className="grad-pink">extraordinário</span><br />
              <span className="grad-cyan">juntos?</span>
            </h2>
            <p className="contato-sub">
              Preencha o formulário e entrarei em contato em até 24h com perguntas rápidas e proposta.
            </p>
            <ul className="contato-benefits">
              <li><span className="check">✓</span> Atendimento personalizado</li>
              <li><span className="check">✓</span> Proposta sem compromisso</li>
              <li><span className="check">✓</span> Processo claro e organizado</li>
              <li><span className="check">✓</span> Entrega no prazo combinado</li>
            </ul>
            <a
              href="https://wa.me/5519994175385"
              target="_blank"
              rel="noreferrer"
              className="whatsapp-btn"
            >
              <span className="wa-icon">💬</span> CHAMAR NO WHATSAPP
            </a>
            <a
              href="https://www.instagram.com/rdevcreator"
              target="_blank"
              rel="noreferrer"
              className="instagram-btn"
            >
              <span className="ig-icon">📸</span> @rdevcreator
            </a>
          </div>

          <div className="contato-right">
            {sent ? (
              <div className="sent-msg">
                <span className="sent-icon">✓</span>
                <h3>Mensagem enviada!</h3>
                <p>Obrigado pelo contato. Retorno em breve.</p>
              </div>
            ) : (
              <form className="contato-form" onSubmit={submit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Seu Nome *</label>
                    <input name="nome" value={form.nome} onChange={handle} placeholder="Seu nome" required />
                  </div>
                  <div className="form-group">
                    <label>WhatsApp *</label>
                    <input name="whatsapp" value={form.whatsapp} onChange={handle} placeholder="(11) 99999-9999" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>E-mail</label>
                    <input name="email" type="email" value={form.email} onChange={handle} placeholder="ryan@email.com" />
                  </div>
                  <div className="form-group">
                    <label>Empresa / Projeto</label>
                    <input name="empresa" value={form.empresa} onChange={handle} placeholder="Nome da empresa" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Serviço de Interesse</label>
                  <select name="servico" value={form.servico} onChange={handle}>
                    <option value="">Selecione...</option>
                    {services.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>O que você quer criar? *</label>
                  <textarea
                    name="objetivo"
                    value={form.objetivo}
                    onChange={handle}
                    rows={4}
                    placeholder="Descreva brevemente seu projeto ou objetivo..."
                    required
                  />
                </div>
                <button type="submit" className="form-submit" disabled={sending}>
                  {sending ? 'ENVIANDO...' : 'ENVIAR MENSAGEM'}
                </button>
                <p className="form-note">
                  Responderei em até 24h no e-mail ou WhatsApp informado.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
