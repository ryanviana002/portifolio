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

const assinatura = `
  <div style="margin-top:32px;padding-top:20px;border-top:1px solid #e8e8e8;">
    <table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;">
      <tr>
        <td style="padding-right:16px;border-right:3px solid #ff007f;vertical-align:middle;">
          <div style="font-size:16px;font-weight:900;color:#0a0a12;letter-spacing:-0.5px;">Ryan Viana</div>
          <div style="font-size:12px;color:#ff007f;font-weight:600;margin-top:2px;">Desenvolvedor Web · RDCreator</div>
        </td>
        <td style="padding-left:16px;vertical-align:middle;">
          <div style="font-size:12px;color:#555;line-height:1.8;">
            🌐 <a href="https://ryancreator.dev" style="color:#ff007f;text-decoration:none;">ryancreator.dev</a><br>
            📩 <a href="mailto:contato@ryancreator.dev" style="color:#555;text-decoration:none;">contato@ryancreator.dev</a><br>
            📱 <a href="https://wa.me/5519994175385" style="color:#555;text-decoration:none;">(19) 99417-5385</a>
          </div>
        </td>
      </tr>
    </table>
  </div>
`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nome, email, whatsapp, empresa, servico, objetivo } = req.body;

  if (!nome || !whatsapp || !objetivo) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando' });
  }

  try {
    // Email para Ryan com os dados do contato
    await transporter.sendMail({
      from: 'Site RDCreator <contato@ryancreator.dev>',
      to: 'contato@ryancreator.dev',
      replyTo: email ? email : undefined,
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
            <a href="https://wa.me/55${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${nome}! Vi sua mensagem no site e vim falar com você 😊`)}"
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

    // Email automático de confirmação para o cliente (só se tiver email)
    if (email) {
      await transporter.sendMail({
        from: 'Ryan Viana · RDCreator <contato@ryancreator.dev>',
        to: email,
        subject: `Olá, ${nome.split(' ')[0]}! Recebi sua mensagem 👋`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 32px;background:#ffffff;color:#1a1a1a;">

            <div style="margin-bottom:32px;">
              <div style="display:inline-block;background:#ff007f;padding:6px 16px;border-radius:999px;font-size:11px;font-weight:700;color:#fff;letter-spacing:2px;text-transform:uppercase;">RDCreator</div>
            </div>

            <h1 style="font-size:24px;font-weight:900;color:#0a0a12;margin:0 0 8px;">Olá, ${nome.split(' ')[0]}!</h1>
            <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 24px;">
              Recebi sua mensagem e em breve entrarei em contato para conversarmos melhor sobre o seu projeto.
            </p>

            <div style="background:#f8f8f8;border-left:4px solid #ff007f;border-radius:4px;padding:16px 20px;margin-bottom:32px;">
              <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Sua mensagem</div>
              <p style="font-size:14px;color:#333;line-height:1.7;margin:0;white-space:pre-wrap;">${objetivo}</p>
            </div>

            <p style="font-size:14px;color:#666;line-height:1.7;margin:0 0 24px;">
              Enquanto isso, se precisar falar comigo mais rapidamente, pode me chamar pelo WhatsApp:
            </p>

            <a href="https://wa.me/5519994175385?text=${encodeURIComponent(`Olá Ryan! Acabei de preencher o formulário do seu site.`)}"
               style="display:inline-block;background:linear-gradient(135deg,#25d366,#1aab52);color:#fff;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px;">
              💬 Falar no WhatsApp
            </a>

            ${assinatura}
          </div>
        `,
      });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Mail error:', err);
    return res.status(500).json({ error: 'Falha ao enviar email' });
  }
}
