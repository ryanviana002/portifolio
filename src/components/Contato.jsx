import { useState } from 'react';
import './Contato.css';
import { ShinyButton } from '@/components/ui/shiny-button';

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

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
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <ShinyButton href="https://wa.me/5519994175385" target="_blank" rel="noreferrer" className="shiny-icon-btn">
                <WhatsAppIcon />
              </ShinyButton>
              <ShinyButton href="https://www.instagram.com/rdevcreator" target="_blank" rel="noreferrer" className="shiny-icon-btn">
                <InstagramIcon />
              </ShinyButton>
            </div>
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
                <ShinyButton type="submit" disabled={sending} className="shiny-always">
                  {sending ? 'ENVIANDO...' : 'ENVIAR MENSAGEM'}
                </ShinyButton>
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
