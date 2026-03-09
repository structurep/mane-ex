// Resend email integration for transactional emails.
// Uses fetch API directly to avoid adding the Resend SDK dependency.

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "ManeExchange <noreply@maneexchange.com>";

// In-memory dedup cache: idempotency_key → timestamp.
// Prevents duplicate sends within a 60-second window (covers double-click / rapid retry).
// Entries auto-evict after 5 minutes to prevent memory growth.
const recentSends = new Map<string, number>();
const DEDUP_WINDOW_MS = 60_000;
const EVICT_AFTER_MS = 300_000;

function evictStaleEntries() {
  const now = Date.now();
  for (const [key, ts] of recentSends) {
    if (now - ts > EVICT_AFTER_MS) recentSends.delete(key);
  }
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  /** Optional idempotency key. If provided, duplicate sends within 60s are suppressed. */
  idempotencyKey?: string;
}

/**
 * Send an email via Resend API.
 * Supports idempotency keys to prevent double-sends on rapid retries.
 */
export async function sendEmail({ to, subject, html, replyTo, idempotencyKey }: SendEmailOptions): Promise<{ id?: string; error?: string; deduplicated?: boolean }> {
  if (!RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY not set, skipping email to:", to);
    return { error: "Email service not configured" };
  }

  // Dedup check: if an idempotency key is provided, skip if sent recently
  if (idempotencyKey) {
    evictStaleEntries();
    const lastSent = recentSends.get(idempotencyKey);
    if (lastSent && Date.now() - lastSent < DEDUP_WINDOW_MS) {
      console.info("[Email] Deduplicated send for key:", idempotencyKey);
      return { deduplicated: true };
    }
    // Mark as sent immediately (before the API call) to prevent races
    recentSends.set(idempotencyKey, Date.now());
  }

  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    };
    // Resend supports Idempotency-Key header natively
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers,
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
