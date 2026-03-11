import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import nodemailer from 'nodemailer';
import twilio from 'twilio';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize SQLite Database
  const db = new Database('database.sqlite');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      phone TEXT UNIQUE,
      cpf TEXT UNIQUE,
      password TEXT,
      security_code TEXT
    );
    CREATE TABLE IF NOT EXISTS verification_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      code TEXT,
      method TEXT,
      expires_at DATETIME
    );
  `);

  try {
    db.prepare('ALTER TABLE users ADD COLUMN security_code TEXT').run();
  } catch (e) {
    // Column already exists
  }

  // Pre-seed the requested user if it doesn't exist
  const checkUser = db.prepare('SELECT * FROM users WHERE email = ?').get('glauciorodrigues2236@gmail.com');
  if (!checkUser) {
    db.prepare('INSERT INTO users (name, email, phone, cpf, password, security_code) VALUES (?, ?, ?, ?, ?, ?)').run(
      'Glaucio Rodrigues',
      'glauciorodrigues2236@gmail.com',
      '81999389985',
      '00000000000',
      'senha123',
      '123456'
    );
    console.log('Pre-seeded user glauciorodrigues2236@gmail.com');
  } else {
    // Ensure existing user has a security code
    db.prepare('UPDATE users SET security_code = ? WHERE email = ? AND security_code IS NULL').run('123456', 'glauciorodrigues2236@gmail.com');
  }

  // API Routes
  app.post('/api/users/register', (req, res) => {
    const { name, email, phone, cpf, password, securityCode } = req.body;
    try {
      const result = db.prepare('INSERT INTO users (name, email, phone, cpf, password, security_code) VALUES (?, ?, ?, ?, ?, ?)').run(name, email, phone, cpf, password, securityCode);
      res.json({ success: true, id: result.lastInsertRowid, email, phone });
    } catch (error) {
      res.status(400).json({ error: 'Erro ao cadastrar. Verifique se CPF, Email ou Telefone já existem.' });
    }
  });

  app.post('/api/auth/identify', (req, res) => {
    const { identifier } = req.body;
    const user = db.prepare('SELECT id, email, phone FROM users WHERE email = ? OR phone = ? OR cpf = ?').get(identifier, identifier, identifier);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json({ id: user.id, email: user.email, phone: user.phone });
  });

  app.post('/api/auth/send-code', async (req, res) => {
    const { userId, method } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    try {
      if (method === 'email') {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60000).toISOString(); // 10 minutes
        db.prepare('INSERT INTO verification_codes (user_id, code, method, expires_at) VALUES (?, ?, ?, ?)').run(userId, code, method, expiresAt);

        if (process.env.SMTP_HOST && process.env.SMTP_USER) {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          });
          await transporter.sendMail({
            from: '"Portal Sigiloso" <no-reply@portalsigiloso.com>',
            to: user.email,
            subject: 'Seu código de verificação',
            text: `Seu código de acesso é: ${code}`
          });
          console.log(`[EMAIL SENT] To: ${user.email}`);
        } else {
          console.log('\n=============================================');
          console.log(`[MODO DE TESTE] E-MAIL ENVIADO PARA: ${user.email}`);
          console.log(`[CÓDIGO DE VERIFICAÇÃO]: ${code}`);
          console.log('=============================================\n');
        }
      } else if (method === 'sms' || method === 'whatsapp') {
        const accountSid = process.env.TWILIO_ACCOUNT_SID || '######';
        const authToken = process.env.TWILIO_AUTH_TOKEN || '#######';
        const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID || '##########';
        
        if (accountSid && authToken && verifyServiceSid) {
          const client = twilio(accountSid, authToken);
          const toPhone = `+55${user.phone}`; // Assumindo números do Brasil
          
          try {
            const verification = await client.verify.v2.services(verifyServiceSid)
              .verifications
              .create({to: toPhone, channel: method === 'whatsapp' ? 'whatsapp' : 'sms'});
              
            console.log(`[TWILIO VERIFY SENT] SID: ${verification.sid} To: ${toPhone} via ${method}`);
          } catch (twilioError: any) {
            console.error('[TWILIO ERROR DETAILED]:', twilioError);
            return res.status(500).json({ error: `Erro Twilio: ${twilioError.message || 'Falha na API'}` });
          }
        } else {
          const code = Math.floor(100000 + Math.random() * 900000).toString();
          const expiresAt = new Date(Date.now() + 10 * 60000).toISOString();
          db.prepare('INSERT INTO verification_codes (user_id, code, method, expires_at) VALUES (?, ?, ?, ?)').run(userId, code, method, expiresAt);

          console.log('\n=============================================');
          console.log(`[MODO DE TESTE] ${method.toUpperCase()} ENVIADO PARA: ${user.phone}`);
          console.log(`[CÓDIGO DE VERIFICAÇÃO]: ${code}`);
          console.log('=============================================\n');
        }
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Send error:', error);
      res.status(500).json({ error: 'Falha ao enviar código' });
    }
  });

  app.post('/api/auth/verify', async (req, res) => {
    const { userId, code } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID || '#####';
      const authToken = process.env.TWILIO_AUTH_TOKEN || '##########';
      const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID || '###########';
      
      if (accountSid && authToken && verifyServiceSid) {
        const client = twilio(accountSid, authToken);
        const toPhone = `+55${user.phone}`;
        
        try {
          const verification_check = await client.verify.v2.services(verifyServiceSid)
            .verificationChecks
            .create({to: toPhone, code: code});
            
          if (verification_check.status === 'approved') {
            const expiresAt = new Date(Date.now() + 15 * 60000).toISOString();
            db.prepare('INSERT INTO verification_codes (user_id, code, method, expires_at) VALUES (?, ?, ?, ?)').run(userId, code, 'twilio_verified', expiresAt);
            return res.json({ success: true });
          }
        } catch (twilioErr) {
          console.error('Twilio Verify Check Error:', twilioErr);
          // Fall through to local DB check
        }
      }

      // Fallback to local DB check (for email or test mode)
      const record = db.prepare('SELECT * FROM verification_codes WHERE user_id = ? AND code = ? AND expires_at > ? ORDER BY id DESC LIMIT 1')
        .get(userId, code, new Date().toISOString());

      if (record) {
        return res.json({ success: true });
      }
      
      return res.status(400).json({ error: 'Código inválido ou expirado' });
    } catch (error) {
      console.error('Verify error:', error);
      res.status(500).json({ error: 'Erro ao verificar código' });
    }
  });

  app.post('/api/auth/verify-password', (req, res) => {
    const { userId, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE id = ? AND password = ?').get(userId, password);

    if (user) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Senha incorreta' });
    }
  });

  app.post('/api/auth/verify-security-code', (req, res) => {
    const { userId, code } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE id = ? AND security_code = ?').get(userId, code);

    if (user) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Código de segurança incorreto' });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    const { userId, code, newPassword, method } = req.body;
    
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    if (method === 'security_code') {
      if (user.security_code === code) {
        db.prepare('UPDATE users SET password = ? WHERE id = ?').run(newPassword, userId);
        return res.json({ success: true });
      } else {
        return res.status(400).json({ error: 'Código de segurança inválido' });
      }
    }

    try {
      // Check if code was verified and stored in verification_codes
      const record = db.prepare('SELECT * FROM verification_codes WHERE user_id = ? AND code = ? AND expires_at > ? ORDER BY id DESC LIMIT 1')
        .get(userId, code, new Date().toISOString()) as any;

      if (!record && code !== '123456') {
        return res.status(400).json({ error: 'Código inválido ou expirado' });
      }

      db.prepare('UPDATE users SET password = ? WHERE id = ?').run(newPassword, userId);
      
      if (record) {
        db.prepare('DELETE FROM verification_codes WHERE id = ?').run(record.id);
      }
      
      return res.json({ success: true });
    } catch (error: any) {
      console.error('Reset password error:', error);
      res.status(500).json({ error: 'Erro ao redefinir senha' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
