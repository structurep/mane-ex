// Resend email integration for transactional emails.
// Uses fetch API directly to avoid adding the Resend SDK dependency.

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "ManeExchange <noreply@maneexchange.com>";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * Send an email via Resend API.
 */
export async function sendEmail({ to, subject, html, replyTo }: SendEmailOptions): Promise<{ id?: string; error?: string }> {
  if (!RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY not set, skipping email to:", to);
    return { error: "Email service not configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html,
        reply_to: replyTo,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[Email] Send failed:", res.status, text);
      return { error: `Email send failed: ${res.status}` };
    }

    const data = await res.json();
    return { id: data.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Email] Send error:", message);
    return { error: message };
  }
}
