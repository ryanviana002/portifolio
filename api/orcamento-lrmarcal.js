import nodemailer from 'nodemailer'
import formidable from 'formidable'
import fs from 'fs'

export const config = { api: { bodyParser: false } }

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
})

function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: true, maxFileSize: 10 * 1024 * 1024 })
    form.parse(req, (err, fields, files) => {
      if (err) reject(err)
      else resolve({ fields, files })
    })
  })
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { fields, files } = await parseForm(req)

    const nome     = Array.isArray(fields.nome)     ? fields.nome[0]     : fields.nome     || ''
    const telefone = Array.isArray(fields.telefone) ? fields.telefone[0] : fields.telefone || ''
    const email    = Array.isArray(fields.email)    ? fields.email[0]    : fields.email    || ''
    const modelo   = Array.isArray(fields.modelo)   ? fields.modelo[0]   : fields.modelo   || ''
    const ano      = Array.isArray(fields.ano)      ? fields.ano[0]      : fields.ano      || ''
    const chassi   = Array.isArray(fields.chassi)   ? fields.chassi[0]   : fields.chassi   || ''
    const avarias  = Array.isArray(fields.avarias)  ? fields.avarias[0]  : fields.avarias  || ''

    if (!nome || !telefone) {
      return res.status(400).json({ error: 'Nome e telefone são obrigatórios' })
    }

    // Prepara anexos de fotos
    const attachments = []
    const fotosRaw = files.fotos
    if (fotosRaw) {
      const fotos = Array.isArray(fotosRaw) ? fotosRaw : [fotosRaw]
      for (const foto of fotos) {
        if (foto.size > 0) {
          attachments.push({
            filename: foto.originalFilename || foto.newFilename || 'foto.jpg',
            content: fs.readFileSync(foto.filepath),
            contentType: foto.mimetype || 'image/jpeg',
          })
        }
      }
    }

    const linhaTabela = (label, valor) => valor ? `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.45);font-size:12px;width:160px;">${label}</td>
        <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);color:#fff;font-weight:600;">${valor}</td>
      </tr>` : ''

    await transporter.sendMail({
      from: 'LRMARÇAL Site <contato@ryancreator.dev>',
      to: 'contato@ryancreator.dev',
      replyTo: email || undefined,
      subject: `Novo orçamento: ${nome} — ${modelo || 'veículo não informado'}`,
      html: `
        <div style="font-family:sans-serif;max-width:640px;margin:0 auto;padding:32px;background:#0e0e0e;color:#fff;border-radius:12px;">
          <div style="margin-bottom:24px;">
            <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#00B8F0;margin-bottom:8px;">Novo orçamento pelo site</div>
            <h1 style="font-size:28px;font-weight:900;color:#fff;margin:0;">${nome}</h1>
          </div>

          <table style="width:100%;border-collapse:collapse;">
            ${linhaTabela('Telefone / WhatsApp', telefone)}
            ${linhaTabela('E-mail', email)}
            ${linhaTabela('Modelo do veículo', modelo)}
            ${linhaTabela('Ano', ano)}
            ${linhaTabela('Chassi', chassi)}
          </table>

          ${avarias ? `
          <div style="margin-top:24px;background:rgba(255,255,255,0.04);border:1px solid rgba(0,184,240,0.2);border-radius:10px;padding:20px;">
            <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:10px;">Descrição das avarias</div>
            <p style="color:rgba(255,255,255,0.85);line-height:1.7;margin:0;white-space:pre-wrap;">${avarias}</p>
          </div>` : ''}

          ${attachments.length > 0 ? `
          <div style="margin-top:20px;background:rgba(0,184,240,0.06);border:1px solid rgba(0,184,240,0.2);border-radius:10px;padding:16px 20px;">
            <div style="font-size:12px;color:#00B8F0;">📎 ${attachments.length} foto(s) anexada(s)</div>
          </div>` : ''}

          <div style="margin-top:28px;display:flex;gap:12px;flex-wrap:wrap;">
            <a href="https://wa.me/55${telefone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${nome}! Recebemos seu pedido de orçamento pelo site. Em breve retornaremos.`)}"
               style="display:inline-block;background:linear-gradient(135deg,#25d366,#1aab52);color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:700;font-size:13px;">
              💬 Responder no WhatsApp
            </a>
            ${email ? `<a href="mailto:${email}" style="display:inline-block;background:rgba(255,255,255,0.08);color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:700;font-size:13px;border:1px solid rgba(255,255,255,0.15);">
              ✉ Responder por e-mail
            </a>` : ''}
          </div>

          <div style="margin-top:32px;font-size:11px;color:rgba(255,255,255,0.2);border-top:1px solid rgba(255,255,255,0.06);padding-top:16px;">
            LRMARÇAL Funilaria e Pintura · lrmarcal.com.br<br>
            ⚠️ Este é um orçamento prévio online. O valor final pode variar após vistoria presencial.
          </div>
        </div>
      `,
      attachments,
    })

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('orcamento-lrmarcal error:', err)
    return res.status(500).json({ error: err.message })
  }
}
