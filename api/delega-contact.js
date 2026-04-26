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

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email obrigatório' });
  }

  try {
    await transporter.sendMail({
      from: 'Delega <contato@ryancreator.dev>',
      to: 'contato@ryancreator.dev',
      replyTo: email,
      subject: `Novo interessado no Delega: ${email}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#191919;color:#fff;border-radius:12px;">
          <div style="margin-bottom:24px;">
            <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#F55200;margin-bottom:8px;">Delega — Novo interessado</div>
            <h1 style="font-size:24px;font-weight:900;color:#fff;margin:0;">Lista de espera</h1>
          </div>
          <p style="color:rgba(255,255,255,0.7);font-size:15px;line-height:1.7;">
            Um novo usuário entrou na lista de espera:
          </p>
          <div style="background:rgba(245,82,0,0.12);border:1px solid rgba(245,82,0,0.3);border-radius:10px;padding:20px;margin-top:16px;">
            <div style="font-size:18px;font-weight:700;color:#F55200;">${email}</div>
          </div>
          <div style="margin-top:32px;font-size:11px;color:rgba(255,255,255,0.2);border-top:1px solid rgba(255,255,255,0.06);padding-top:16px;">
            delegaapp.com.br · contato@ryancreator.dev
          </div>
        </div>
      `,
    });

    await transporter.sendMail({
      from: 'Delega <contato@ryancreator.dev>',
      to: email,
      subject: 'Você entrou na lista de espera do Delega! 🎉',
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

                <!-- HEADER laranja -->
                <tr>
                  <td style="background:linear-gradient(135deg,#F55200 0%,#CC3F00 100%);padding:48px 40px 40px;text-align:center;">
                    <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:16px;padding:14px 24px;margin-bottom:24px;">
                      <span style="font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-1px;">Delega</span>
                    </div>
                    <h1 style="margin:0;font-size:32px;font-weight:900;color:#ffffff;line-height:1.15;">Você tá na lista! 🙌</h1>
                    <p style="margin:12px 0 0;font-size:16px;color:rgba(255,255,255,0.85);line-height:1.6;">Passa a tarefa, a gente resolve.</p>
                  </td>
                </tr>

                <!-- BODY -->
                <tr>
                  <td style="padding:40px 40px 32px;">
                    <p style="margin:0 0 20px;font-size:16px;color:#333;line-height:1.7;">
                      Obrigado por entrar na lista de espera do <strong style="color:#F55200;">Delega</strong>! Você será um dos primeiros a saber quando o app estiver pronto.
                    </p>

                    <!-- 3 passos -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;">
                      <tr>
                        <td style="padding:16px;background:#fff8f5;border-radius:12px;border-left:4px solid #F55200;margin-bottom:12px;">
                          <div style="font-size:22px;margin-bottom:6px;">📦</div>
                          <div style="font-size:14px;font-weight:700;color:#191919;margin-bottom:4px;">Posta a tarefa</div>
                          <div style="font-size:13px;color:#777;line-height:1.5;">Descreva o que precisa em menos de 1 minuto.</div>
                        </td>
                      </tr>
                      <tr><td style="height:10px;"></td></tr>
                      <tr>
                        <td style="padding:16px;background:#fff8f5;border-radius:12px;border-left:4px solid #F55200;">
                          <div style="font-size:22px;margin-bottom:6px;">👆</div>
                          <div style="font-size:14px;font-weight:700;color:#191919;margin-bottom:4px;">Escolhe o prestador</div>
                          <div style="font-size:13px;color:#777;line-height:1.5;">Receba lances e escolha com um deslize.</div>
                        </td>
                      </tr>
                      <tr><td style="height:10px;"></td></tr>
                      <tr>
                        <td style="padding:16px;background:#fff8f5;border-radius:12px;border-left:4px solid #F55200;">
                          <div style="font-size:22px;margin-bottom:6px;">✅</div>
                          <div style="font-size:14px;font-weight:700;color:#191919;margin-bottom:4px;">Paga depois</div>
                          <div style="font-size:13px;color:#777;line-height:1.5;">Só libera o pagamento quando estiver satisfeito.</div>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0 0 28px;font-size:15px;color:#555;line-height:1.7;">
                      Fique de olho no email — em breve traremos novidades exclusivas para quem está na lista.
                    </p>

                    <!-- CTA WhatsApp -->
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:linear-gradient(135deg,#25d366,#1aab52);border-radius:999px;padding:14px 28px;">
                          <a href="https://wa.me/5519994175385?text=${encodeURIComponent('Oi! Entrei na lista do Delega e quero saber mais 👋')}"
                             style="color:#fff;text-decoration:none;font-weight:700;font-size:15px;">
                            💬 Falar com a gente no WhatsApp
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td style="background:#f9f9f9;padding:24px 40px;border-top:1px solid #eee;text-align:center;">
                    <p style="margin:0 0 8px;font-size:13px;color:#999;">Delega · Passa a tarefa, a gente resolve.</p>
                    <p style="margin:0;font-size:12px;color:#bbb;">contato@ryancreator.dev</p>
                  </td>
                </tr>

              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Mail error:', err);
    return res.status(500).json({ error: 'Falha ao enviar email' });
  }
}
