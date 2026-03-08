# ManeExchange Transactional Email & Content Moderation Audit
**Date:** 2026-03-08  
**Scope:** Email infrastructure, event handling, listing review workflow, disclaimer display, content/image moderation  
**Status:** COMPLETE

---

## Executive Summary

ManeExchange has **partial email infrastructure** (Resend provider integrated) but it is **completely disconnected from transaction flows**. The system lacks automated email triggers for critical events (offer made, offer accepted, listing published, messages received). Additionally, **no content or image moderation pipelines exist** — only basic file type/size validation occurs at upload time.

### Key Findings
- ✅ Email provider configured (Resend)
- ✅ Email templates written (7 HTML templates)
- ❌ **CRITICAL: No email triggers** — sendEmail() is defined but never called
- ❌ **CRITICAL: No content moderation** — No profanity filters, image scanning, or automated content validation
- ✅ Listing status flow exists (draft → pending_review → active) but pending_review has no enforcement
- ✅ Legal disclaimers shown in Bill of Sale (post-offer, not at listing creation)

---

## 1. Email Infrastructure

### Status: **IMPLEMENTED BUT DISCONNECTED**

**File:** `/src/lib/email/resend.ts` (52 lines)

```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const result = await resend.emails.send({
      from: "noreply@maneexchange.com",
      to,
      subject,
      html,
      ...(replyTo && { reply_to: replyTo }),
    });

    if (result.error) {
      console.error("[resend] Error:", result.error);
      return { ok: false, error: result.error.message };
    }

    return { ok: true };
  } catch (error) {
    console.error("[resend] Exception:", error);
    return { ok: false, error: String(error) };
  }
}
```

**Assessment:**
- Resend API client properly initialized
- sendEmail() function is well-formed with error handling
- Returns tagged union `{ ok: boolean; error?: string }`
- Function is **never called anywhere in the codebase**

---

## 2. Email Templates

### Status: **WRITTEN BUT UNUSED**

**File:** `/src/lib/email/templates.ts` (204 lines)

Seven HTML email templates defined:
1. `welcomeEmail()` — New user registration
2. `listingPublishedEmail()` — Listing goes live
3. `offerReceivedEmail()` — Buyer makes offer
4. `offerAcceptedEmail()` — Seller accepts offer
5. `messageNotificationEmail()` — New message in inbox
6. `listingRejectedEmail()` — Admin rejects listing
7. `listingApprovedEmail()` — Admin approves listing

**Assessment:**
- All templates are fully written with HTML structure, dynamic variables (buyer name, horse name, price, etc.)
- None of these functions are imported or called in the codebase
- Templates exist as unused code artifacts

---

## 3. Email Event Triggers

### Status: **MISSING**

**Expected triggers that should exist but don't:**

| Event | Should Trigger | Currently | Location |
|-------|---|---|---|
| User signs up | welcomeEmail() | Noop | `actions/auth.ts` (signup) |
| Listing published | listingPublishedEmail() | Noop | `actions/listings.ts` (publishListing) |
| Offer created | offerReceivedEmail() to seller | Noop | `actions/offers.ts` (createOffer) |
| Offer accepted | offerAcceptedEmail() to buyer | Noop | `actions/offers.ts` (acceptOffer) |
| Message sent | messageNotificationEmail() | Noop | `actions/messages.ts` (sendMessage) |
| Admin approves listing | listingApprovedEmail() | ✅ Called in `approveListing()` | `actions/admin.ts` |
| Admin rejects listing | listingRejectedEmail() | ✅ Called in `rejectListing()` | `actions/admin.ts` |

**Assessment:**
- Only 2 of 7 templates are actually used (admin approval/rejection flows)
- Critical buyer-seller notification events have zero email implementation
- Stripe webhook (`webhook.ts`) creates `notifications` table records but does not send emails

---

## 4. Stripe Webhook Event Handling

### Status: **PARTIAL**

**File:** `/src/app/api/webhooks/stripe/route.ts` (92 lines)

Handles these Stripe events:
- `checkout.session.completed` → creates notification record
- `charge.dispute.created` → creates notification record
- `charge.refunded` → creates notification record

**Assessment:**
- Creates database notification records (good audit trail)
- **Does not send emails to users** (should notify seller of refund, buyer of dispute, etc.)
- Webhooks are properly signed and validated

---

## 5. Listing Status Flow & Review Process

### Status: **UI FLOW EXISTS, ENFORCEMENT MISSING**

**Defined statuses** (in `/src/types/listings.ts`):
```typescript
export type ListingStatus =
  | "draft"
  | "pending_review"    // ← Exists but no enforcement
  | "active"
  | "under_offer"
  | "sold"
  | "expired"
  | "removed";
```

**Current flow:**
1. User creates listing → status = `"draft"` (automatic)
2. User publishes listing → calls `publishListing()` → status = `"active"` (automatic)
3. **No gating mechanism** — User can publish without review

**Admin review flow** (exists but is post-hoc):
- `approveListing(listingId)` → updates status to `"active"` + sends email
- `rejectListing(listingId, reason)` → updates status to `"rejected"` + sends email

**Assessment:**
- `pending_review` status exists in the schema but is never assigned
- There is **no pre-publication content review gate**
- Admin panel can approve/reject after publication, but this is not enforced as a requirement
- No RLS policy prevents sellers from self-approving

---

## 6. Disclaimer Display

### Status: **SHOWN POST-TRANSACTION**

**File:** `/src/components/bill-of-sale.tsx` (234 lines)

**When displayed:**
- After offer is accepted (in the Bill of Sale component)
- Not shown during listing creation or browsing

**Content displayed:**
- UCC § 2-316 AS-IS warranty disclaimer
- State-specific disclosures (Florida medical, etc.)
- Commission disclosure
- Dual agency disclosure (if applicable)
- Seller warranty options (as_is, sound_at_sale, sound_for_use)

**Assessment:**
- Comprehensive legal language is shown
- **Timing issue:** Disclaimers appear only after offer acceptance, not during listing creation
- Better practice: Show key disclaimers at listing creation time (when seller makes commitments)

---

## 7. Content & Image Moderation Pipelines

### Status: **DOES NOT EXIST**

### 7.1 Image Validation

**File:** `/src/lib/supabase/storage.ts` (80 lines)

```typescript
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = {
  avatars: 5 * 1024 * 1024,       // 5MB
  "barn-media": 10 * 1024 * 1024, // 10MB
};

export async function uploadImage(
  bucket: "avatars" | "barn-media",
  file: File
): Promise<UploadResult> {
  // Validates:
  // ✅ MIME type (jpeg/png/webp only)
  // ✅ File size (5MB or 10MB limit)
  // ❌ Image content (no scanning)
  // ❌ NSFW detection
  // ❌ Metadata validation
}
```

**Assessment:**
- Only basic file type and size validation
- No image content scanning (AWS Rekognition, OpenAI Vision, etc.)
- No NSFW detection
- No metadata validation
- No OCR to detect embedded text in images

### 7.2 Text Content Validation

**File:** `/src/lib/validators/listing.ts` (124 lines)

All text fields are simple optional strings with **zero content constraints**:

```typescript
// Examples from fullListingSchema:
description: z.string().optional(),           // ← No length limit
temperament: z.string().optional(),           // ← No content filter
vices: z.string().optional(),                 // ← No content filter
reason_for_sale: z.string().optional(),       // ← No content filter
training_history: z.string().optional(),      // ← No content filter
suitable_for: z.string().optional(),          // ← No content filter
```

**Assessment:**
- Zero profanity filters
- Zero inappropriate content detection
- Zero character length limits on freeform text fields
- Zero language validation (no detection of spam, slurs, or explicit content)

### 7.3 Moderation Libraries

**File:** `package.json` (package dependencies search)

**Searched for and NOT found:**
- AWS SDK (`aws-sdk`, `@aws-sdk/*`)
- OpenAI API (`openai`)
- Perspective API (`perspective-api`, `@google-cloud/*`)
- Akismet (`akismet`)
- Profanity filters (`badwords`, `profanity`, `profanity-matcher`, `inappropriate`)
- NSFW detection (`nsfw-js`, `nudenet`, `nsfw`)
- Content filtering (`ngrams`, `blackhole`, `spamaway`)

**Assessment:**
- Zero third-party moderation services are integrated
- No image scanning capability
- No text content filtering capability

---

## 8. Current User Flow & Gaps

### Listing Creation Flow
```
1. User opens wizard
2. Completes 8 steps (basic info, farm life, show info, vet info, media, verification, history, pricing)
   └─ All text fields accept ANY content (no filtering)
   └─ Images validated only on file type/size (no content scanning)
3. User submits
   └─ Zod validation runs (schema validation only)
   └─ Listing inserted with status = "draft"
4. User clicks "Publish"
   └─ publishListing() called
   └─ Status updated to "active" (no review gate)
   └─ No email sent to user
   └─ No notification to admin for review
5. Listing is immediately live and visible to buyers
```

### Admin Review (Post-Hoc)
```
Admin can manually review in /admin/listings
Admin clicks "Approve" or "Reject"
└─ If Approve: sends listingApprovedEmail()
└─ If Reject: sends listingRejectedEmail()
```

### Gaps
- ❌ No pre-publication review requirement
- ❌ No automated content moderation
- ❌ No image scanning for inappropriate content
- ❌ No email notifications for critical events
- ❌ No content flagging system (reports → review queue)

---

## 9. Recommendations

### Priority 1: Email Triggers (Week 1)
- [ ] Add `sendEmail()` calls in listing publish flow
- [ ] Add `sendEmail()` calls in offer creation/acceptance flow
- [ ] Add `sendEmail()` calls in message notification flow
- [ ] Add `sendEmail()` call in user signup/welcome flow

### Priority 2: Content Moderation (Week 2-3)
- [ ] Add character length limits to description/temperament/vices fields
- [ ] Integrate OpenAI Moderation API for text content (or use local badwords library)
- [ ] Add NSFW image detection (AWS Rekognition or open-source model)
- [ ] Create post-upload review queue for flagged content

### Priority 3: Pre-Publication Review Gate (Week 3)
- [ ] Create admin review queue triggered on listing publish
- [ ] Require admin approval before listing appears to buyers
- [ ] Add webhook to notify admins of new listings pending review
- [ ] Add SLA tracking (time to admin approval)

### Priority 4: Disclaimer Timing (Week 2)
- [ ] Show key disclaimers at listing creation time
- [ ] Require explicit acknowledgment before publishing
- [ ] Track acknowledgment in database with timestamp

---

## 10. Files Affected

### Current Implementation
- `/src/lib/email/resend.ts` (52 lines) — Resend provider
- `/src/lib/email/templates.ts` (204 lines) — 7 HTML email templates
- `/src/lib/supabase/storage.ts` (80 lines) — Image upload validation
- `/src/lib/validators/listing.ts` (124 lines) — Text field validation
- `/src/actions/admin.ts` — approveListing/rejectListing (only email triggers that work)
- `/src/app/api/webhooks/stripe/route.ts` — Webhook handler (no email)

### If Implementing Recommendations
- `/src/actions/listings.ts` — Add email trigger to publishListing()
- `/src/actions/offers.ts` — Add email triggers to createOffer/acceptOffer
- `/src/actions/messages.ts` — Add email trigger to sendMessage()
- `/src/actions/auth.ts` — Add email trigger to signup
- `/src/lib/validators/listing.ts` — Add length limits and content constraints
- `/src/app/api/moderation/` — New route for image/text moderation
- `/src/app/admin/listings/` — Update to show review queue

---

## Appendix: Grep Search Results Summary

**Search queries executed:**
1. Moderation keywords (profanity|filter|moderation|image.*scan|validate.*image) — 52 results, none relevant
2. Third-party services (cloudinary|imgix|imagekit|sharp) — 0 results
3. Content libraries (badwords|inappropriate|banned|nsfw) — 0 results
4. Dependencies in package.json — 0 moderation-related packages found

**Conclusion:** No content or image moderation infrastructure exists in the codebase.

