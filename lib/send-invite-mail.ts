import { Resend } from "resend";
import nodemailer from "nodemailer";

export type SendMailInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

function getFrom(): string {
  const from = process.env.EMAIL_FROM?.trim();
  if (!from) {
    throw new Error("EMAIL_FROM is not set (e.g. KG App <onboarding@resend.dev>)");
  }
  return from;
}

/**
 * Sends one transactional email. Prefers Resend when RESEND_API_KEY is set;
 * otherwise uses SMTP_* + nodemailer.
 */
export async function sendInviteMail(input: SendMailInput): Promise<void> {
  const from = getFrom();

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
    if (error) {
      throw new Error(error.message || "Resend send failed");
    }
    if (!data) {
      throw new Error("Resend returned no data");
    }
    return;
  }

  const host = process.env.SMTP_HOST?.trim();
  if (!host) {
    throw new Error(
      "No mail transport configured. Set RESEND_API_KEY or SMTP_HOST (and EMAIL_FROM)."
    );
  }

  const port = Number(process.env.SMTP_PORT || "587");
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS ?? "";

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user ? { user, pass } : undefined,
  });

  await transporter.sendMail({
    from,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });
}
