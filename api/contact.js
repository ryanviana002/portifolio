import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nome, email, whatsapp, empresa, servico, objetivo } = req.body;

  if (!nome || !whatsapp || !objetivo) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando' });
  }

  try {
    await transporter.sendMail({
      from: 'Site RDCreator <contato@ryancreator.dev>',
      to: 'ryanviana002@gmail.com',
      replyTo: email ? email : 'contato@ryancreator.dev',
      subject: `Novo contato: ${nome}${servico ? ` — ${servico}` : ''}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#0a0a12;color:#fff;border-radius:12px;">
          <div style="margin-bottom:24px;">
            <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#ff007f;margin-bottom:8px;">Novo contato pelo site</div>
            <h1 style="font-size:28px;font-weight:900;color:#fff;margin:0;">${nome}</h1>
          </div>

          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.45);font-size:12px;width:140px;">WhatsApp</td>
                <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);color:#fff;font-weight:600;">${whatsapp}</td></tr>
            ${email ? `<tr><td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.45);font-size:12px;">E-mail</td>
                <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);color:#fff;font-weight:600;">${email}</td></tr>` : ''}
            ${empresa ? `<tr><td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.45);font-size:12px;">Empresa / Projeto</td>
                <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);color:#fff;font-weight:600;">${empresa}</td></tr>` : ''}
            ${servico ? `<tr><td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.45);font-size:12px;">Serviço</td>
                <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);color:#fff;">
                  <span style="background:rgba(255,0,127,0.15);border:1px solid rgba(255,0,127,0.3);padding:4px 12px;border-radius:999px;font-size:12px;color:#ff007f;">${servico}</span>
                </td></tr>` : ''}
          </table>

          <div style="margin-top:24px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:20px;">
            <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:10px;">Objetivo / Mensagem</div>
            <p style="color:rgba(255,255,255,0.85);line-height:1.7;margin:0;white-space:pre-wrap;">${objetivo}</p>
          </div>

          <div style="margin-top:24px;display:flex;gap:12px;">
            <a href="https://wa.me/5519992525515?text=${encodeURIComponent(`Olá ${nome}!`)}"
               style="display:inline-block;background:linear-gradient(135deg,#25d366,#1aab52);color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:700;font-size:13px;">
              💬 Responder no WhatsApp
            </a>
            ${email ? `<a href="mailto:${email}" style="display:inline-block;background:rgba(255,255,255,0.08);color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:700;font-size:13px;border:1px solid rgba(255,255,255,0.15);">
              ✉ Responder por e-mail
            </a>` : ''}
          </div>

          <div style="margin-top:32px;font-size:11px;color:rgba(255,255,255,0.2);border-top:1px solid rgba(255,255,255,0.06);padding-top:16px;">
            ryancreator.dev · contato@ryancreator.dev
          </div>
        </div>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Mail error:', err);
    return res.status(500).json({ error: 'Falha ao enviar email' });
  }
}
