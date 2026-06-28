// api/send-email.js
// ----------------------------------------------------------------------
// A Vercel serverless function that Supabase calls (via its "Send Email
// Hook") whenever it needs to email a login code. Instead of Supabase
// sending the email itself (which Gmail blocks), THIS function sends it
// through Gmail SMTP — and Gmail allows Vercel, so it works.
//
// Same idea as SmartBookingSystem's emailer, just wired to Supabase's hook.
// ----------------------------------------------------------------------
import nodemailer from "nodemailer";
import { Webhook } from "standardwebhooks";

// Read the raw request body (needed to verify the webhook signature).
async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function emailHtml(token) {
  return `
    <h2>Your CashCow login code 🐮</h2>
    <p>Hi! Here's your one-time code to log in:</p>
    <p style="font-size:30px;font-weight:bold;letter-spacing:6px;margin:16px 0;">${token}</p>
    <p>Type it into the app to finish logging in. This code expires in 1 hour.</p>
    <p style="color:#888;font-size:13px;">Didn't try to log in? You can safely ignore this email — no account changes were made.</p>
    <p>— CashCow 🐮💸</p>
  `;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const raw = await getRawBody(req);

    // 1) Verify the request really came from our Supabase project.
    const secret = (process.env.SEND_EMAIL_HOOK_SECRET || "").replace("v1,whsec_", "");
    const wh = new Webhook(secret);
    const payload = wh.verify(raw, {
      "webhook-id": req.headers["webhook-id"],
      "webhook-timestamp": req.headers["webhook-timestamp"],
      "webhook-signature": req.headers["webhook-signature"],
    });

    // 2) Pull out who to email and the one-time code.
    const toEmail = payload.user.email;
    const token = payload.email_data.token;

    // 3) Send it through Gmail.
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `CashCow <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: "Your CashCow code 🐮",
      html: emailHtml(token),
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("send-email error:", err);
    res.status(401).json({ error: err.message });
  }
}
