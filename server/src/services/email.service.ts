import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter =
  env.SMTP_HOST && env.SMTP_USER
    ? nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: Number(env.SMTP_PORT) || 587,
        secure: false,
        auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
      })
    : null;

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  if (transporter) {
    await transporter.sendMail({ from: env.EMAIL_FROM, to, subject, html });
    return;
  }

  console.log('\n📧 Email (dev mode)');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(html.replace(/<[^>]+>/g, ' ').trim());
  console.log('---\n');
};

export const sendVerificationEmail = async (email: string, token: string): Promise<void> => {
  const url = `${env.CLIENT_URL}/verify-email?token=${token}`;
  await sendEmail(
    email,
    'Verify your Smart Leads account',
    `<p>Click to verify your email:</p><p><a href="${url}">${url}</a></p><p>Link expires in 24 hours.</p>`
  );
};

export const sendPasswordResetEmail = async (email: string, token: string): Promise<void> => {
  const url = `${env.CLIENT_URL}/reset-password?token=${token}`;
  await sendEmail(
    email,
    'Reset your Smart Leads password',
    `<p>Click to reset your password:</p><p><a href="${url}">${url}</a></p><p>Link expires in 1 hour.</p>`
  );
};
