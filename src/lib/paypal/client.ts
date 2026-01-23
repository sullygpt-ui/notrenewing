// PayPal Payouts API client

interface PayPalTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface PayoutItem {
  recipient_type: 'EMAIL';
  receiver: string;
  amount: {
    value: string;
    currency: string;
  };
  note?: string;
  sender_item_id: string;
}

interface PayoutResponse {
  batch_header: {
    payout_batch_id: string;
    batch_status: string;
  };
}

const PAYPAL_API_URL = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

// Get PayPal access token
async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PayPal auth failed: ${error}`);
  }

  const data: PayPalTokenResponse = await response.json();
  return data.access_token;
}

// Send a payout to a PayPal email
export async function sendPayPalPayout(
  recipientEmail: string,
  amountCents: number,
  senderItemId: string,
  note?: string
): Promise<{ success: boolean; payoutBatchId?: string; error?: string }> {
  try {
    const accessToken = await getAccessToken();
    const amountDollars = (amountCents / 100).toFixed(2);

    const payoutData = {
      sender_batch_header: {
        sender_batch_id: `payout_${Date.now()}_${senderItemId}`,
        email_subject: 'You have received a payment from NotRenewing',
        email_message: 'Your domain sale payout has been processed.',
      },
      items: [
        {
          recipient_type: 'EMAIL',
          receiver: recipientEmail,
          amount: {
            value: amountDollars,
            currency: 'USD',
          },
          note: note || 'Domain sale payout from NotRenewing',
          sender_item_id: senderItemId,
        },
      ],
    };

    const response = await fetch(`${PAYPAL_API_URL}/v1/payments/payouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payoutData),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('PayPal payout error:', error);
      return {
        success: false,
        error: error.message || 'PayPal payout failed',
      };
    }

    const data: PayoutResponse = await response.json();

    return {
      success: true,
      payoutBatchId: data.batch_header.payout_batch_id,
    };
  } catch (error) {
    console.error('PayPal payout error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Verify PayPal email exists (optional validation)
export async function verifyPayPalEmail(email: string): Promise<boolean> {
  // PayPal doesn't have a direct email verification API
  // We'll just validate the email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
