import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || 'NotRenewing <noreply@notrenewing.com>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export interface EmailResult {
  success: boolean;
  error?: string;
}

// Seller: Domain submitted, needs verification
export async function sendVerificationEmail(
  to: string,
  domainName: string,
  verificationToken: string,
  listingId: string
): Promise<EmailResult> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Verify your domain: ${domainName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #111827;">Verify Your Domain</h1>
          <p style="color: #4b5563; font-size: 16px;">
            You've submitted <strong>${domainName}</strong> for listing on NotRenewing.
          </p>

          <h2 style="color: #111827; font-size: 18px;">Add this DNS TXT record:</h2>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0 0 8px 0;"><strong>Host/Name:</strong> _notrenewing.${domainName}</p>
            <p style="margin: 0 0 8px 0;"><strong>Type:</strong> TXT</p>
            <p style="margin: 0;"><strong>Value:</strong> notrenewing-verify=${verificationToken}</p>
          </div>

          <p style="color: #4b5563; font-size: 14px;">
            DNS changes can take up to 48 hours to propagate, but usually complete within a few minutes.
          </p>

          <a href="${APP_URL}/listings/${listingId}/verify"
             style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px;
                    border-radius: 8px; text-decoration: none; margin-top: 16px;">
            Verify Domain
          </a>

          <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">
            This listing will expire in 30 days if not verified.
          </p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

// Seller: Domain verified and live
export async function sendListingLiveEmail(
  to: string,
  domainName: string
): Promise<EmailResult> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Your domain is live: ${domainName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #111827;">Your Domain is Live!</h1>
          <p style="color: #4b5563; font-size: 16px;">
            Great news! <strong>${domainName}</strong> is now listed on NotRenewing and visible to buyers.
          </p>

          <div style="background: #ecfdf5; border: 1px solid #10b981; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; color: #065f46;">
              Your listing is active for 30 days. If it sells, you'll receive $99 minus our processing fee.
            </p>
          </div>

          <a href="${APP_URL}/domain/${domainName}"
             style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px;
                    border-radius: 8px; text-decoration: none; margin-top: 16px;">
            View Your Listing
          </a>

          <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">
            You can manage your listings from your dashboard.
          </p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send listing live email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

// Seller: Domain sold notification
export async function sendDomainSoldEmail(
  to: string,
  domainName: string,
  buyerEmail: string,
  payoutAmount: number
): Promise<EmailResult> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Your domain sold: ${domainName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #111827;">Congratulations! Your Domain Sold!</h1>
          <p style="color: #4b5563; font-size: 16px;">
            <strong>${domainName}</strong> has been purchased.
          </p>

          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0 0 8px 0;"><strong>Buyer:</strong> ${buyerEmail}</p>
            <p style="margin: 0;"><strong>Your payout:</strong> $${(payoutAmount / 100).toFixed(2)}</p>
          </div>

          <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin: 0 0 8px 0; color: #92400e;">Action Required: Transfer Domain</h3>
            <p style="margin: 0; color: #92400e;">
              You have <strong>72 hours</strong> to initiate the domain transfer to the buyer.
              Your payout will be released once the buyer confirms receipt.
            </p>
          </div>

          <a href="${APP_URL}/dashboard"
             style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px;
                    border-radius: 8px; text-decoration: none; margin-top: 16px;">
            View Transfer Details
          </a>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send domain sold email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

// Buyer: Purchase confirmation
export async function sendPurchaseConfirmationEmail(
  to: string,
  domainName: string,
  sellerEmail: string
): Promise<EmailResult> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Purchase confirmed: ${domainName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #111827;">Purchase Confirmed!</h1>
          <p style="color: #4b5563; font-size: 16px;">
            You've successfully purchased <strong>${domainName}</strong> for $99.
          </p>

          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin: 0 0 12px 0; color: #111827;">What happens next?</h3>
            <ol style="margin: 0; padding-left: 20px; color: #4b5563;">
              <li style="margin-bottom: 8px;">The seller has been notified and has 72 hours to initiate the transfer</li>
              <li style="margin-bottom: 8px;">You'll receive transfer instructions from the seller</li>
              <li style="margin-bottom: 8px;">Once you receive the domain, confirm the transfer on our site</li>
              <li>The seller gets paid after your confirmation (or automatically after 7 days)</li>
            </ol>
          </div>

          <div style="background: #dbeafe; border: 1px solid #3b82f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; color: #1e40af;">
              <strong>Your payment is protected.</strong> If the seller doesn't transfer the domain,
              you can open a dispute and receive a full refund.
            </p>
          </div>

          <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">
            Questions? Reply to this email or contact support.
          </p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send purchase confirmation email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

// Buyer: Transfer confirmed, domain is yours
export async function sendTransferCompleteEmail(
  to: string,
  domainName: string
): Promise<EmailResult> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Transfer complete: ${domainName} is yours!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #111827;">The Domain is Yours!</h1>
          <p style="color: #4b5563; font-size: 16px;">
            The transfer of <strong>${domainName}</strong> has been confirmed.
            The domain is now officially yours.
          </p>

          <div style="background: #ecfdf5; border: 1px solid #10b981; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; color: #065f46;">
              Thank you for using NotRenewing! We hope you enjoy your new domain.
            </p>
          </div>

          <a href="${APP_URL}/browse"
             style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px;
                    border-radius: 8px; text-decoration: none; margin-top: 16px;">
            Browse More Domains
          </a>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send transfer complete email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

// Seller: Payout sent
export async function sendPayoutEmail(
  to: string,
  amount: number,
  domainName: string
): Promise<EmailResult> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Payout sent: $${(amount / 100).toFixed(2)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #111827;">Payout Sent!</h1>
          <p style="color: #4b5563; font-size: 16px;">
            Your payout for <strong>${domainName}</strong> has been processed.
          </p>

          <div style="background: #ecfdf5; border: 1px solid #10b981; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; color: #065f46; font-size: 24px; font-weight: bold;">
              $${(amount / 100).toFixed(2)}
            </p>
            <p style="margin: 8px 0 0 0; color: #065f46;">
              Funds should arrive in your account within 2-3 business days.
            </p>
          </div>

          <a href="${APP_URL}/dashboard"
             style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px;
                    border-radius: 8px; text-decoration: none; margin-top: 16px;">
            View Payout History
          </a>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send payout email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}
