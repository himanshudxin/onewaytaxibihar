/**
 * OneWayTaxiBihar Shared Formatters and Utility Functions
 */

export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  return '₹' + Math.round(amount).toLocaleString('en-IN');
}

export function formatDistance(km: number): string {
  if (isNaN(km) || km === null || km === undefined) return '0 km';
  return `${Math.round(km)} km`;
}

export function sanitizePhoneNumber(phone: string): string {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.substring(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.substring(1);
  }
  return digits;
}

export function isValidIndianMobile(phone: string): boolean {
  if (!phone) return false;
  // If original string has letters, reject immediately
  if (/[a-zA-Z]/.test(phone)) return false;
  const clean = sanitizePhoneNumber(phone);
  return clean.length === 10 && /^[6-9]/.test(clean);
}

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length < 5 || trimmed.length > 254) return false;
  if (trimmed.includes('..') || trimmed.endsWith('.') || /\s/.test(trimmed)) return false;
  const atIndex = trimmed.indexOf('@');
  if (atIndex <= 0 || atIndex === trimmed.length - 1) return false;
  const domain = trimmed.slice(atIndex + 1);
  if (!domain.includes('.') || domain.startsWith('.') || domain.endsWith('.')) return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(trimmed);
}

export function isValidOtp(otp: string, length: number = 4): boolean {
  if (!otp || typeof otp !== 'string') return false;
  const trimmed = otp.trim();
  if (!/^\d+$/.test(trimmed)) return false;
  return trimmed.length === length;
}

export function isValidUtr(utr: string): boolean {
  if (!utr || typeof utr !== 'string') return false;
  const trimmed = utr.trim();
  return /^\d{12}$/.test(trimmed);
}

export function isValidIndianVehicleNumber(vehicleNo: string): boolean {
  if (!vehicleNo || typeof vehicleNo !== 'string') return false;
  const clean = vehicleNo.replace(/[\s-]/g, '').toUpperCase();
  // Standard Indian RTO format: 2 letters state code + 2 digits district + optional 1-3 series letters + 4 digits
  const plateRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$/;
  return plateRegex.test(clean);
}

export function formatUserErrorMessage(error: any): string {
  if (!error) return 'An unexpected error occurred. Please try again.';

  if (typeof error === 'string') {
    const lower = error.toLowerCase();
    if (lower.includes('network') || lower.includes('fetch') || lower.includes('failed to fetch') || lower.includes('timeout')) {
      return 'Unable to reach the OneWayTaxi server. Please check your internet connection.';
    }
    return error;
  }

  const status = error.status || error.statusCode;
  if (status === 429) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  if (status === 401 || status === 403) {
    return 'Your session has expired. Please sign in again.';
  }
  if (status === 404) {
    return 'The requested resource or trip could not be found.';
  }
  if (status >= 500) {
    return 'Our Bihar Dispatch servers are momentarily busy. Please retry shortly.';
  }

  const rawMsg = error.message || error.error || '';
  if (rawMsg) {
    const lower = String(rawMsg).toLowerCase();
    if (lower.includes('network request failed') || lower.includes('timeout') || lower.includes('econnrefused')) {
      return 'Unable to reach the OneWayTaxi server. Please check your internet connection.';
    }
    if (lower.includes('rate limit')) {
      return 'Too many requests. Please wait a moment and try again.';
    }
    // Remove technical stack traces or TypeError keywords
    if (lower.includes('typeerror') || lower.includes('syntaxerror') || lower.includes('referenceerror')) {
      return 'A temporary processing issue occurred. Please try again.';
    }
    return rawMsg;
  }

  return 'An unexpected error occurred. Please try again.';
}

export function generateIdempotencyKey(prefix: string = 'req'): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${ts}_${rand}`;
}

export function formatDateTimeLabel(dateStr: string, timeStr?: string): string {
  if (!dateStr) return 'Select Date';
  try {
    const d = new Date(dateStr);
    const day = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    return timeStr ? `${day} at ${timeStr}` : day;
  } catch (e) {
    return dateStr;
  }
}
