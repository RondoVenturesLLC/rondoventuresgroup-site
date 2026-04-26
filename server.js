const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Page routes (clean URLs)
app.get('/',            (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/about',       (req, res) => res.sendFile(path.join(__dirname, 'public', 'about.html')));
app.get('/clientbridge',(req, res) => res.sendFile(path.join(__dirname, 'public', 'clientbridge.html')));
app.get('/contact',     (req, res) => res.sendFile(path.join(__dirname, 'public', 'contact.html')));

// Contact form
// Requires Railway env vars: SMTP_USER (Gmail address), SMTP_PASS (Gmail App Password)
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) return res.redirect('/contact?error=missing');

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    await transporter.sendMail({
      from: `"RVG Website" <${process.env.SMTP_USER}>`,
      to: 'rondo@rondoventuresgroup.com',
      replyTo: email,
      subject: `[RVG Contact] ${subject || `Message from ${name}`}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject || 'N/A'}\n\n${message}`,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Subject:</strong> ${subject || 'N/A'}</p><br><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br>')}</p>`
    });
    res.redirect('/contact?sent=1');
  } catch (err) {
    console.error('Contact form error:', err.message);
    res.redirect('/contact?error=1');
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
