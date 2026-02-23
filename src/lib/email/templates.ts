// Email templates for ManeExchange transactional emails.
// All templates follow the ManeExchange brand: warm, professional, equestrian.

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://maneexchange.com";

function layout(content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Inter', -apple-system, sans-serif; background: #FAFAF8; color: #1A1A1A; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #FFFFFF; border: 1px solid #EDE9E0; border-radius: 8px; padding: 32px; }
    .logo { font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 700; color: #1A1A1A; text-decoration: none; }
    .btn { display: inline-block; background: #E10600; color: #FFFFFF; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; }
    .btn-outline { display: inline-block; border: 1px solid #1A1A1A; color: #1A1A1A; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 14px; }
    .footer { margin-top: 32px; text-align: center; font-size: 12px; color: #999; }
    .footer a { color: #999; }
    h1 { font-family: 'Space Grotesk', sans-serif; font-size: 24px; margin: 0 0 16px; }
    p { font-size: 15px; line-height: 1.6; color: #555; margin: 0 0 16px; }
    .highlight { background: #F5F2EC; border-radius: 6px; padding: 16px; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${BASE_URL}" class="logo">ManeExchange</a>
    </div>
    <div class="card">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ManeExchange. All rights reserved.</p>
      <p>
        <a href="${BASE_URL}/dashboard/settings">Notification Settings</a> &middot;
        <a href="${BASE_URL}/terms">Terms</a> &middot;
        <a href="${BASE_URL}/privacy">Privacy</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

export function welcomeEmail(name: string): { subject: string; html: string } {
  return {
    subject: "Welcome to ManeExchange!",
    html: layout(`
      <h1>Welcome, ${name}!</h1>
      <p>You're now part of the most trusted equestrian marketplace. Here's how to get started:</p>
      <div class="highlight">
        <p style="margin:0"><strong>1.</strong> Complete your profile to build trust</p>
        <p style="margin:8px 0 0"><strong>2.</strong> Browse horses or list your own</p>
        <p style="margin:8px 0 0"><strong>3.</strong> Use ManeVault escrow for secure transactions</p>
      </div>
      <p style="text-align: center; margin-top: 24px;">
        <a href="${BASE_URL}/dashboard" class="btn">Go to Dashboard</a>
      </p>
    `),
  };
}

export function offerReceivedEmail(
  sellerName: string,
  horseName: string,
  offerAmount: string,
  offerId: string
): { subject: string; html: string } {
  return {
    subject: `New offer on ${horseName}`,
    html: layout(`
      <h1>You received an offer!</h1>
      <p>Hi ${sellerName}, a buyer made an offer on <strong>${horseName}</strong>.</p>
      <div class="highlight">
        <p style="margin:0; font-size: 24px; font-weight: 700; color: #1A1A1A;">${offerAmount}</p>
        <p style="margin:4px 0 0; font-size: 13px;">Offer expires in 72 hours</p>
      </div>
      <p style="text-align: center; margin-top: 24px;">
        <a href="${BASE_URL}/dashboard/offers/${offerId}" class="btn">Review Offer</a>
      </p>
      <p style="font-size: 13px; color: #999;">You can accept, counter, or decline from your dashboard.</p>
    `),
  };
}

export function escrowFundedEmail(
  name: string,
  horseName: string,
  amount: string,
  escrowId: string
): { subject: string; html: string } {
  return {
    subject: `Payment secured for ${horseName}`,
    html: layout(`
      <h1>Funds secured in ManeVault</h1>
      <p>Hi ${name}, <strong>${amount}</strong> has been deposited into ManeVault escrow for <strong>${horseName}</strong>.</p>
      <div class="highlight">
        <p style="margin:0"><strong>What happens next:</strong></p>
        <p style="margin:8px 0 0">The seller will arrange transport. Once you confirm delivery and inspect the horse, funds will be released.</p>
      </div>
      <p style="text-align: center; margin-top: 24px;">
        <a href="${BASE_URL}/dashboard/offers/${escrowId}" class="btn">View Transaction</a>
      </p>
    `),
  };
}

export function escrowReleasedEmail(
  sellerName: string,
  horseName: string,
  amount: string
): { subject: string; html: string } {
  return {
    subject: `Funds released for ${horseName}`,
    html: layout(`
      <h1>Congratulations on the sale!</h1>
      <p>Hi ${sellerName}, <strong>${amount}</strong> has been released to your account for the sale of <strong>${horseName}</strong>.</p>
      <div class="highlight">
        <p style="margin:0">Funds will appear in your connected bank account within 2-3 business days.</p>
      </div>
      <p style="text-align: center; margin-top: 24px;">
        <a href="${BASE_URL}/dashboard" class="btn">Go to Dashboard</a>
      </p>
    `),
  };
}

export function reviewRequestEmail(
  buyerName: string,
  horseName: string,
  sellerName: string,
  listingSlug: string
): { subject: string; html: string } {
  return {
    subject: `How was your experience with ${sellerName}?`,
    html: layout(`
      <h1>Leave a review</h1>
      <p>Hi ${buyerName}, you recently purchased <strong>${horseName}</strong> from ${sellerName}. How was your experience?</p>
      <p>Your review helps other buyers make informed decisions and helps sellers improve their service.</p>
      <p style="text-align: center; margin-top: 24px;">
        <a href="${BASE_URL}/horses/${listingSlug}#reviews" class="btn">Write a Review</a>
      </p>
      <p style="font-size: 13px; color: #999;">Reviews are public and help build trust in the community.</p>
    `),
  };
}

export function priceDropEmail(
  buyerName: string,
  horseName: string,
  oldPrice: string,
  newPrice: string,
  listingSlug: string
): { subject: string; html: string } {
  return {
    subject: `Price drop on ${horseName}!`,
    html: layout(`
      <h1>Price drop alert!</h1>
      <p>Hi ${buyerName}, a horse in your Dream Barn just got a price drop.</p>
      <div class="highlight">
        <p style="margin:0; font-size: 18px;"><strong>${horseName}</strong></p>
        <p style="margin:4px 0 0;"><span style="text-decoration: line-through; color: #999;">${oldPrice}</span> &rarr; <strong style="color: #E10600;">${newPrice}</strong></p>
      </div>
      <p style="text-align: center; margin-top: 24px;">
        <a href="${BASE_URL}/horses/${listingSlug}" class="btn">View Listing</a>
      </p>
    `),
  };
}

export function weeklyDigestEmail(
  name: string,
  stats: {
    newListings: number;
    views: number;
    messages: number;
    newFavorites: number;
  }
): { subject: string; html: string } {
  return {
    subject: "Your ManeExchange Weekly",
    html: layout(`
      <h1>Your Weekly Roundup</h1>
      <p>Hi ${name}, here's what happened on ManeExchange this week:</p>
      <div class="highlight">
        <table width="100%" cellpadding="8" cellspacing="0" style="font-size: 14px;">
          <tr>
            <td><strong>${stats.newListings}</strong> new listings</td>
            <td><strong>${stats.views}</strong> profile views</td>
          </tr>
          <tr>
            <td><strong>${stats.messages}</strong> messages</td>
            <td><strong>${stats.newFavorites}</strong> new saves</td>
          </tr>
        </table>
      </div>
      <p style="text-align: center; margin-top: 24px;">
        <a href="${BASE_URL}/dashboard" class="btn">Open Dashboard</a>
      </p>
    `),
  };
}
