import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { from, to, subject, text, html } = req.body;

    await resend.emails.send({
      from: 'contato@ryancreator.dev',
      to: ['ryanviana002@gmail.com'],
      replyTo: from,
      subject: subject || '(sem assunto)',
      html: html || `<pre style="font-family:sans-serif;">${text || ''}</pre>`,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Inbound forward error:', err);
    return res.status(500).json({ error: err.message });
  }
}
