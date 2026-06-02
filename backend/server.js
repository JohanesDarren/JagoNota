import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from parent directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase Admin Client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase URL or Service Role Key in .env!");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'jagonota@gmail.com',
    pass: 'krsp kixx dftu xyhe'
  }
});

app.post('/api/reset-password', async (req, res) => {
  const { email, redirectTo } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // 1. Generate password recovery link using Supabase Admin API
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: redirectTo || 'http://localhost:5173/#update-password'
      }
    });

    if (error) {
      console.error("Error generating link:", error);
      // We don't expose internal errors for security, just fail gracefully
      return res.status(400).json({ error: 'Gagal membuat tautan reset. Pastikan email terdaftar.' });
    }

    const resetLink = data.properties.action_link;

    // 2. Send the email using Nodemailer
    const mailOptions = {
      from: '"JagoNota Support" <jagonota@gmail.com>',
      to: email,
      subject: 'Pemulihan Password Akun JagoNota Anda',
      text: `Halo,\n\nKami menerima permintaan untuk mereset password akun JagoNota Anda.\n\nKlik tautan berikut untuk membuat password baru:\n${resetLink}\n\nTautan ini akan kedaluwarsa dalam 1 jam.\n\nJika Anda tidak merasa meminta reset password, silakan abaikan email ini.\n\n© 2026 JagoNota. All rights reserved.`,
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pemulihan Password JagoNota</title>
</head>
<body style="margin:0; padding:0; background-color:#f3f4f6; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e5e7eb; max-width:600px; width:100%;">
          <!-- Header -->
          <tr>
            <td style="background-color:#1800ad; padding:32px 40px; text-align:center;">
              <h1 style="color:#ffffff; margin:0; font-size:24px; font-weight:bold; letter-spacing:1px;">JagoNota</h1>
              <p style="color:#c7d2fe; margin:8px 0 0 0; font-size:14px;">Platform Nota & Kwitansi Digital</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="color:#111827; margin:0 0 16px 0; font-size:20px;">Pulihkan Password Anda</h2>
              <p style="color:#6b7280; margin:0 0 12px 0; font-size:15px; line-height:1.6;">Halo,</p>
              <p style="color:#6b7280; margin:0 0 12px 0; font-size:15px; line-height:1.6;">Kami menerima permintaan untuk mengatur ulang password akun JagoNota Anda.</p>
              <p style="color:#6b7280; margin:0 0 32px 0; font-size:15px; line-height:1.6;">Klik tombol di bawah ini untuk membuat password baru. Tautan ini akan kedaluwarsa dalam <strong>1 jam</strong>.</p>
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:0 0 32px 0;">
                    <a href="${resetLink}" style="display:inline-block; background-color:#1800ad; color:#ffffff; text-decoration:none; padding:14px 32px; border-radius:8px; font-size:16px; font-weight:bold;">
                      Atur Ulang Password
                    </a>
                  </td>
                </tr>
              </table>
              <!-- Fallback link -->
              <p style="color:#9ca3af; font-size:13px; margin:0 0 8px 0;">Jika tombol tidak berfungsi, salin dan tempel tautan berikut ke browser Anda:</p>
              <p style="word-break:break-all; font-size:12px; color:#1800ad; margin:0 0 32px 0;">${resetLink}</p>
              <hr style="border:none; border-top:1px solid #e5e7eb; margin:0 0 24px 0;" />
              <p style="color:#9ca3af; font-size:12px; margin:0; line-height:1.6;">Jika Anda tidak merasa meminta reset password, abaikan email ini. Password Anda tidak akan berubah.</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb; padding:20px 40px; text-align:center; border-top:1px solid #e5e7eb;">
              <p style="color:#9ca3af; font-size:12px; margin:0;">© 2026 JagoNota. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Tautan reset password berhasil dikirim.' });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan internal server saat mengirim email.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
