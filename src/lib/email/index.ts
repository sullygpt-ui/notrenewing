import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || 'NotRenewing <noreply@notrenewing.com>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Generic email interface for template-based sending
interface SendEmailOptions {
  to: string;
  template: string;
  data: Record<string, any>;
}

// Generic email sending function
export async function sendEmail({ to, template, data }: SendEmailOptions): Promise<EmailResult> {
  const emailContent = getEmailTemplate(template, data);
  if (!emailContent) {
    console.error(`Unknown email template: ${template}`);
    return { success: false, error: `Unknown template: ${template}` };
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: emailContent.subject,
      html: emailContent.html,
    });
    return { success: true };
  } catch (error) {
    console.error(`Failed to send ${template} email:`, error);
    return { success: false, error: 'Failed to send email' };
  }
}

function getEmailTemplate(template: string, data: Record<string, any>): { subject: string; html: string } | null {
  switch (template) {
    case 'transfer_deadline_refund_buyer':
      return {
        subject: `Refund processed: ${data.domainName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #111827;">Refund Processed</h1>
            <p style="color: #4b5563; font-size: 16px;">
              Hi ${data.buyerName},
            </p>
            <p style="color: #4b5563; font-size: 16px;">
              The seller did not complete the transfer of <strong>${data.domainName}</strong> within the required 72-hour timeframe.
              Your payment of <strong>${data.refundAmount}</strong> has been automatically refunded.
            </p>
            <div style="background: #dbeafe; border: 1px solid #3b82f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0; color: #1e40af;">
                The refund should appear in your account within 5-10 business days, depending on your bank.
              </p>
            </div>
            <a href="${APP_URL}/browse"
               style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px;
                      border-radius: 8px; text-decoration: none; margin-top: 16px;">
              Browse Other Domains
            </a>
          </div>
        `,
      };

    case 'transfer_deadline_refund_seller':
      return {
        subject: `Transfer deadline missed: ${data.domainName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #dc2626;">Transfer Deadline Missed</h1>
            <p style="color: #4b5563; font-size: 16px;">
              Hi ${data.sellerName},
            </p>
            <p style="color: #4b5563; font-size: 16px;">
              The 72-hour transfer deadline for <strong>${data.domainName}</strong> has passed without completion.
            </p>
            <div style="background: #fef2f2; border: 1px solid #dc2626; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0; color: #991b1b;">
                The buyer has been automatically refunded. Your listing has been reactivated.
              </p>
            </div>
            <p style="color: #4b5563; font-size: 14px;">
              To avoid this in the future, please ensure you initiate domain transfers promptly after a sale.
              If you had technical difficulties, please contact support.
            </p>
            <a href="${APP_URL}/dashboard"
               style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px;
                      border-radius: 8px; text-decoration: none; margin-top: 16px;">
              View Dashboard
            </a>
          </div>
        `,
      };

    default:
      return null;
  }
}

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

// Buyer: Transfer initiated by seller with auth code
export async function sendTransferInitiatedEmail(
  to: string,
  domainName: string,
  authCode: string,
  notes: string | null,
  confirmationDeadline: Date,
  purchaseId: string
): Promise<EmailResult> {
  const deadlineStr = confirmationDeadline.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Transfer ready: ${domainName} - Auth code inside`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #111827;">Your Domain Transfer is Ready!</h1>
          <p style="color: #4b5563; font-size: 16px;">
            The seller has initiated the transfer for <strong>${domainName}</strong>.
          </p>

          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin: 0 0 12px 0; color: #111827;">Authorization Code</h3>
            <p style="font-family: monospace; font-size: 18px; background: white; padding: 12px;
                      border: 2px dashed #d1d5db; border-radius: 4px; margin: 0; word-break: break-all;">
              ${authCode}
            </p>
          </div>

          ${notes ? `
          <div style="background: #fffbeb; border: 1px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin: 0 0 8px 0; color: #92400e;">Seller Notes</h3>
            <p style="margin: 0; color: #92400e;">${notes}</p>
          </div>
          ` : ''}

          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin: 0 0 12px 0; color: #111827;">How to Complete the Transfer</h3>
            <ol style="margin: 0; padding-left: 20px; color: #4b5563;">
              <li style="margin-bottom: 8px;">Log into your domain registrar (GoDaddy, Namecheap, etc.)</li>
              <li style="margin-bottom: 8px;">Start a domain transfer for ${domainName}</li>
              <li style="margin-bottom: 8px;">Enter the authorization code above when prompted</li>
              <li style="margin-bottom: 8px;">Complete any approval steps (check your email)</li>
              <li>Once the domain is in your account, confirm receipt below</li>
            </ol>
          </div>

          <div style="background: #fef2f2; border: 1px solid #dc2626; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; color: #991b1b;">
              <strong>Important:</strong> Please confirm receipt by <strong>${deadlineStr}</strong>.
              After this date, payment will be automatically released to the seller.
            </p>
          </div>

          <a href="${APP_URL}/transfer/${purchaseId}"
             style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px;
                    border-radius: 8px; text-decoration: none; margin-top: 16px;">
            Confirm Transfer Receipt
          </a>

          <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">
            Having trouble? You can open a dispute from the transfer page if you don't receive the domain.
          </p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send transfer initiated email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

// Buyer: Auto-release notification
export async function sendAutoReleaseEmail(
  to: string,
  domainName: string
): Promise<EmailResult> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Payment released: ${domainName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #111827;">Payment Auto-Released</h1>
          <p style="color: #4b5563; font-size: 16px;">
            The 7-day confirmation period for <strong>${domainName}</strong> has ended.
          </p>

          <div style="background: #dbeafe; border: 1px solid #3b82f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; color: #1e40af;">
              Since no dispute was opened, payment has been automatically released to the seller.
              This is standard procedure to ensure sellers receive timely payment.
            </p>
          </div>

          <p style="color: #4b5563; font-size: 16px;">
            If you did not receive the domain and believe this is an error, please contact support
            immediately at support@notrenewing.com.
          </p>

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
    console.error('Failed to send auto-release email:', error);
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
