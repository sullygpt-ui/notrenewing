import * as OTPAuth from 'otpauth';
import * as QRCode from 'qrcode';
import { createHash, randomBytes } from 'crypto';

const APP_NAME = 'NotRenewing';

// Generate a new TOTP secret for a user
export function generateTOTPSecret(): string {
  // Generate 20 random bytes and encode as base32
  const bytes = randomBytes(20);
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < bytes.length; i++) {
    secret += base32Chars[bytes[i] % 32];
  }
  return secret;
}

// Generate a QR code for the TOTP secret
export async function generateQRCode(secret: string, email: string): Promise<string> {
  const totp = new OTPAuth.TOTP({
    issuer: APP_NAME,
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: secret,
  });
  return QRCode.toDataURL(totp.toString());
}

// Verify a TOTP token
export function verifyTOTP(token: string, secret: string): boolean {
  try {
    const totp = new OTPAuth.TOTP({
      issuer: APP_NAME,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secret,
    });
    const delta = totp.validate({ token, window: 1 });
    return delta !== null;
  } catch {
    return false;
  }
}

// Generate backup codes
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric codes
    const code = randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  return codes;
}

// Hash a backup code for storage
export function hashBackupCode(code: string): string {
  return createHash('sha256').update(code.toUpperCase()).digest('hex');
}

// Verify a backup code
export function verifyBackupCode(code: string, hash: string): boolean {
  const codeHash = hashBackupCode(code);
  return codeHash === hash;
}

// Format backup code for display (add dash in middle)
export function formatBackupCode(code: string): string {
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}

// Parse backup code (remove dash)
export function parseBackupCode(code: string): string {
  return code.replace(/-/g, '').toUpperCase();
}
