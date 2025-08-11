import nodemailer from 'nodemailer';

function hasTwilioEnv() {
  return !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM);
}

function hasSmtpEnv() {
  return !!(process.env.SMTP_URL && process.env.SMTP_FROM);
}

export async function sendSMS({ to, body }) {
  if (!hasTwilioEnv()) return { ok: false, reason: 'twilio_not_configured' };
  const { default: twilio } = await import('twilio');
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  await client.messages.create({ from: process.env.TWILIO_FROM, to, body });
  return { ok: true };
}

export async function sendEmail({ to, subject, text }) {
  if (!hasSmtpEnv()) return { ok: false, reason: 'smtp_not_configured' };
  const transporter = nodemailer.createTransport(process.env.SMTP_URL);
  await transporter.sendMail({ from: process.env.SMTP_FROM, to, subject, text });
  return { ok: true };
}
