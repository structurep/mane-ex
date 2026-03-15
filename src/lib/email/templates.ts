// Email templates for ManeExchange transactional emails.
// All templates follow the ManeExchange institutional brand.

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://maneexchange.com";

function layout(content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Inter', -apple-system, sans-serif; background: #F8F6F1; color: #0F1A12; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #FFFFFF; border: 1px solid #DDD8CE; border-radius: 8px; padding: 32px; }
    .logo { font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 700; color: #0F1A12; text-decoration: none; }
    .btn { display: inline-block; background: #7A3139; color: #FFFFFF; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; }
    .btn-outline { display: inline-block; border: 1px solid #0F1A12; color: #0F1A12; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 14px; }
    .footer { margin-top: 32px; text-align: center; font-size: 12px; color: #8E9B91; }
    .footer a { color: #8E9B91; }
    h1 { font-family: 'Space Grotesk', sans-serif; font-size: 24px; margin: 0 0 16px; }
    p { font-size: 15px; line-height: 1.6; color: #4A5D4E; margin: 0 0 16px; }
    .highlight { background: #F2EFE8; border-radius: 6px; padding: 16px; margin: 16px 0; }
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
    subject: "Welcome to ManeExchange",
    html: layout(`
      <h1>Welcome, ${name}.</h1>
      <p>Your account is ready. Here is how to get started:</p>
      <div class="highlight">
        <p style="margin:0"><strong>1.</strong> Complete your profile to establish trust</p>
        <p style="margin:8px 0 0"><strong>2.</strong> Browse current offerings or list your horse</p>
        <p style="margin:8px 0 0"><strong>3.</strong> Use ManeVault escrow for secured transactions</p>
      </div>
      <p style="text-align: center; margin-top: 24px;">
        <a href="${BASE_URL}/dashboard" class="btn">Go to Dashboard</a>
      </p>
    `),
  };
}

export function newMessageEmail(
  recipientName: string,
  senderName: string,
  messagePreview: string,
  conversationId: string
): { subject: string; html: string } {
  return {
    subject: `New message from ${senderName}`,
    html: layout(`
      <h1>You have a new message.</h1>
      <p>Hi ${recipientName}, <strong>${senderName}</strong> sent you a message:</p>
      <div class="highlight">
        <p style="margin:0; font-style: italic;">"${messagePreview.slice(0, 200)}${messagePreview.length > 200 ? "..." : ""}"</p>
      </div>
      <p style="text-align: center; margin-top: 24px;">
        <a href="${BASE_URL}/dashboard/messages/${conversationId}" class="btn">View Conversation</a>
      </p>
      <p style="font-size: 13px; color: #8E9B91;">Do not share personal financial information in messages.</p>
    `),
  };
}

export function inquirySentEmail(
  buyerName: string,
  horseName: string,
  sellerName: string,
  conversationId: string
): { subject: string; html: string } {
  return {
    subject: `Your inquiry about ${horseName}`,
    html: layout(`
      <h1>Inquiry sent.</h1>
      <p>Hi ${buyerName}, your message about <strong>${horseName}</strong> has been sent to ${sellerName}.</p>
      <div class="highlight">
        <p style="margin:0">The seller will typically respond within 24 hours. You can continue the conversation from your dashboard.</p>
      </div>
      <p style="text-align: center; margin-top: 24px;">
        <a href="${BASE_URL}/dashboard/messages/${conversationId}" class="btn">View Conversation</a>
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
      <h1>You received an offer.</h1>
      <p>Hi ${sellerName}, a buyer has submitted an offer on <strong>${horseName}</strong>.</p>
      <div class="highlight">
        <p style="margin:0; font-size: 24px; font-weight: 700; color: #0F1A12;">${offerAmount}</p>
        <p style="margin:4px 0 0; font-size: 13px;">Offer expires in 72 hours</p>
      </div>
      <p style="text-align: center; margin-top: 24px;">
        <a href="${BASE_URL}/dashboard/offers/${offerId}" class="btn">Review Offer</a>
      </p>
      <p style="font-size: 13px; color: #8E9B91;">You can accept, counter, or decline from your dashboard.</p>
    `),
  };
}

export function offerStatusEmail(
  buyerName: string,
  horseName: string,
  status: "accepted" | "rejected" | "countered",
  offerId: string,
  counterAmount?: string
): { subject: string; html: string } {
  const statusText = {
    accepted: "Your offer has been accepted",
    rejected: "Your offer has been declined",
    countered: `The seller has countered with ${counterAmount}`,
  }[status];

  const nextStep = {
    accepted: "Proceed to payment to secure the transaction via ManeVault escrow.",
    rejected: "You can browse other listings or submit a new offer.",
    countered: "Review the counter-offer and decide whether to accept.",
  }[status];

  return {
    subject: `Offer update: ${horseName}`,
    html: layout(`
      <h1>${statusText}.</h1>
      <p>Hi ${buyerName}, regarding your offer on <strong>${horseName}</strong>:</p>
      <div class="highlight">
        <p style="margin:0">${nextStep}</p>
      </div>
      <p style="text-align: center; margin-top: 24px;">
        <a href="${BASE_URL}/dashboard/offers/${offerId}" class="btn">View Offer</a>
      </p>
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
      <h1>Funds secured in ManeVault.</h1>
      <p>Hi ${name}, <strong>${amount}</strong> has been deposited into ManeVault escrow for <strong>${horseName}</strong>.</p>
      <div class="highlight">
        <p style="margin:0"><strong>Next steps:</strong></p>
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
      <h1>Transaction complete.</h1>
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
      <h1>Leave a review.</h1>
      <p>Hi ${buyerName}, you recently purchased <strong>${horseName}</strong> from ${sellerName}. How was your experience?</p>
      <p>Your review helps other buyers make informed decisions and helps sellers build their reputation.</p>
      <p style="text-align: center; margin-top: 24px;">
        <a href="${BASE_URL}/horses/${listingSlug}#reviews" class="btn">Write a Review</a>
      </p>
      <p style="font-size: 13px; color: #8E9B91;">Reviews are public and contribute to seller scoring.</p>
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
    subject: `Price adjustment on ${horseName}`,
    html: layout(`
      <h1>Price adjustment.</h1>
      <p>Hi ${buyerName}, a horse in your Dream Barn has had a price change.</p>
      <div class="highlight">
        <p style="margin:0; font-size: 18px;"><strong>${horseName}</strong></p>
        <p style="margin:4px 0 0;"><span style="text-decoration: line-through; color: #8E9B91;">${oldPrice}</span> &rarr; <strong style="color: #7A3139;">${newPrice}</strong></p>
      </div>
      <p style="text-align: center; margin-top: 24px;">
        <a href="${BASE_URL}/horses/${listingSlug}" class="btn">View Listing</a>
      </p>
    `),
  };
}

export function transportRequestEmail(
  sellerName: string,
  horseName: string,
  destinationState: string,
  listingSlug: string
): { subject: string; html: string } {
  return {
    subject: `New transport request for ${horseName}`,
    html: layout(`
      <h1>Transport request received.</h1>
      <p>Hi ${sellerName}, a buyer has requested help arranging transport for <strong>${horseName}</strong>.</p>
      <div class="highlight">
        <p style="margin:0"><strong>Destination:</strong> ${destinationState}</p>
        <p style="margin:8px 0 0; font-size: 13px;">The buyer is interested in your listing and needs shipping assistance. You can reach out to discuss options.</p>
      </div>
      <p style="text-align: center; margin-top: 24px;">
        <a href="${BASE_URL}/horses/${listingSlug}" class="btn">View Listing</a>
      </p>
      <p style="font-size: 13px; color: #8E9B91;">Transport estimates are approximate. Final arrangements are between buyer, seller, and carrier.</p>
    `),
  };
}

export function transportProviderLeadEmail(
  providerName: string,
  horseName: string,
  originState: string,
  destinationState: string,
  distanceMiles: number,
  listingSlug: string
): { subject: string; html: string } {
  return {
    subject: `New horse transport lead: ${originState} → ${destinationState}`,
    html: layout(`
      <h1>New transport lead.</h1>
      <p>Hi ${providerName}, a buyer on ManeExchange needs transport for a horse.</p>
      <div class="highlight">
        <p style="margin:0"><strong>Horse:</strong> ${horseName}</p>
        <p style="margin:8px 0 0"><strong>Route:</strong> ${originState} → ${destinationState}</p>
        <p style="margin:8px 0 0"><strong>Est. Distance:</strong> ${distanceMiles.toLocaleString()} miles</p>
      </div>
      <p style="text-align: center; margin-top: 24px;">
        <a href="${BASE_URL}/horses/${listingSlug}" class="btn">View Listing</a>
      </p>
      <p style="font-size: 13px; color: #8E9B91;">This lead was matched based on your service regions. Contact the seller through the listing page to discuss arrangements.</p>
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
      <h1>Weekly Summary</h1>
      <p>Hi ${name}, here is your activity for the week:</p>
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
