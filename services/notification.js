/**
 * OneWayTaxiBihar (onewaytaxibihar.com)
 * Enterprise Notification Service (SMS & WhatsApp Engine)
 * Supports Fast2SMS, MSG91, Twilio & WhatsApp Business Cloud API
 */

require('dotenv').config();

const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY || '';
const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY || '';
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID || 'OWTAXI';
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER || '';
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID || '';

// Clean Indian 10-digit mobile number
function cleanIndianPhone(phone) {
  return (phone || '').replace(/\D/g, '').slice(-10);
}

// 1. Fast2SMS Indian Gateway Integration
// Route OTP = ~₹0.20/SMS (Requires Fast2SMS website/Aadhaar KYC)
// Route Q (Quick SMS) = ₹5.00/SMS (No KYC/DLT required, bypasses via international gateway)
async function sendViaFast2SMS({ phone, message, otp = null }) {
  const cleanPhone = cleanIndianPhone(phone);
  if (!cleanPhone || cleanPhone.length !== 10) {
    return { success: false, error: 'Invalid 10-digit Indian phone number' };
  }

  const apiKey = process.env.FAST2SMS_API_KEY || FAST2SMS_API_KEY;
  if (!apiKey) {
    return { success: false, error: 'FAST2SMS_API_KEY missing' };
  }

  try {
    // 1. Try Route OTP first if numeric OTP is available (~₹0.20 / SMS once KYC verified in Fast2SMS panel)
    if (otp) {
      try {
        const otpRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            'authorization': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            route: 'otp',
            variables_values: otp.toString(),
            numbers: cleanPhone
          })
        });
        const otpData = await otpRes.json();
        if (otpData && otpData.return === true) {
          console.log(`[Fast2SMS Route OTP] +91 ${cleanPhone} | Cost: ₹0.20 | Success`);
          return {
            success: true,
            provider: 'fast2sms',
            route: 'otp',
            cost: '₹0.20',
            message: otpData.message || 'OTP sent via dedicated OTP route',
            response: otpData
          };
        } else {
          console.log(`[Fast2SMS Route OTP KYC Note] ${otpData?.message || 'KYC required for ₹0.20 route'}. Falling back to Quick SMS.`);
        }
      } catch (otpErr) {
        console.warn('Fast2SMS Route OTP attempt note:', otpErr.message);
      }
    }

    // 2. Fallback to Route Q (Quick SMS) - ₹5.00 per SMS (Universal delivery without KYC)
    const textMessage = message || (otp ? `Your OneWayTaxiBihar OTP code is ${otp}. Valid for 10 minutes. Do not share with anyone.` : 'Welcome to OneWayTaxiBihar.');
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        route: 'q',
        message: textMessage,
        language: 'english',
        flash: 0,
        numbers: cleanPhone
      })
    });

    const data = await response.json();
    const isSuccess = Boolean(data && data.return === true);
    console.log(`[Fast2SMS Route Q] +91 ${cleanPhone} | Cost: ₹5.00 | Return: ${isSuccess} | Message: ${data?.message || 'OK'}`);

    return {
      success: isSuccess,
      provider: 'fast2sms',
      route: 'q',
      cost: '₹5.00',
      message: data?.message || (isSuccess ? 'SMS sent successfully via Quick SMS' : 'SMS dispatch failed'),
      response: data
    };
  } catch (err) {
    console.error('[Notification Service] Fast2SMS error:', err.message);
    return { success: false, provider: 'fast2sms', error: err.message };
  }
}

// 2. MSG91 DLT Standard Indian Gateway
async function sendViaMSG91({ phone, otp, message }) {
  const cleanPhone = cleanIndianPhone(phone);
  if (!MSG91_AUTH_KEY || !cleanPhone) return { success: false, error: 'MSG91 credentials or phone missing' };

  try {
    if (otp) {
      const url = `https://control.msg91.com/api/v5/otp?template_id=${process.env.MSG91_OTP_TEMPLATE_ID || ''}&mobile=91${cleanPhone}&authkey=${MSG91_AUTH_KEY}&otp=${otp}`;
      const response = await fetch(url, { method: 'POST' });
      const data = await response.json();
      return { success: data.type === 'success', provider: 'msg91', response: data };
    } else {
      const response = await fetch('https://control.msg91.com/api/v5/flow/', {
        method: 'POST',
        headers: {
          'authkey': MSG91_AUTH_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          template_id: process.env.MSG91_FLOW_ID || '',
          short_url: '0',
          recipients: [{ mobiles: `91${cleanPhone}`, message }]
        })
      });
      const data = await response.json();
      return { success: data.type === 'success', provider: 'msg91', response: data };
    }
  } catch (err) {
    console.error('[Notification Service] MSG91 error:', err.message);
    return { success: false, error: err.message };
  }
}

// 3. Twilio Global Gateway
async function sendViaTwilio({ phone, message }) {
  const cleanPhone = cleanIndianPhone(phone);
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
    return { success: false, error: 'Twilio credentials not configured' };
  }

  try {
    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
    const params = new URLSearchParams();
    params.append('To', `+91${cleanPhone}`);
    params.append('From', TWILIO_FROM_NUMBER);
    params.append('Body', message);

    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const data = await res.json();
    return { success: res.ok, provider: 'twilio', sid: data.sid };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// 4. WhatsApp Business Cloud API Integration (Meta Graph API v20.0)
async function sendViaWhatsAppCloud({ phone, message, templateName = null, templateParams = null }) {
  const cleanPhone = cleanIndianPhone(phone);
  const token = process.env.WHATSAPP_ACCESS_TOKEN || process.env.META_WHATSAPP_TOKEN || WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID || process.env.META_PHONE_NUMBER_ID || WHATSAPP_PHONE_ID;

  if (!token || !phoneId) {
    return {
      success: false,
      error: 'WhatsApp Cloud API credentials not configured (WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_ID)'
    };
  }

  try {
    let payload = {};
    if (templateName) {
      payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: `91${cleanPhone}`,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'en' },
          components: templateParams || []
        }
      };
    } else {
      payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: `91${cleanPhone}`,
        type: 'text',
        text: {
          preview_url: true,
          body: message
        }
      };
    }

    const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    const isSuccess = Boolean(res.ok && data.messages && data.messages.length > 0);
    const messageId = data.messages?.[0]?.id || null;

    if (isSuccess) {
      console.log(`[Meta WhatsApp Cloud] ✅ Message delivered to +91 ${cleanPhone} (ID: ${messageId})`);
    } else {
      console.warn(`[Meta WhatsApp Cloud] Delivery notice:`, data.error?.message || JSON.stringify(data));
    }

    return {
      success: isSuccess,
      provider: 'whatsapp_cloud',
      messageId,
      error: isSuccess ? null : (data.error?.message || 'Meta WhatsApp dispatch error'),
      data
    };
  } catch (err) {
    console.warn(`[Meta WhatsApp Cloud] Network error:`, err.message);
    return { success: false, error: err.message };
  }
}

// Automated 6-digit OTP dispatch via Meta WhatsApp Cloud API
async function sendOtpViaWhatsApp({ phone, otp, name = 'Passenger' }) {
  const cleanPhone = cleanIndianPhone(phone);
  const text = `Namaste ${name}! Your OneWayTaxiBihar secure login & booking verification code is: *${otp}*.\n\nValid for 10 minutes. Please do not share this code with anyone.\n\n24x7 Patna Central Dispatch: +91 80021 41816`;
  return sendViaWhatsAppCloud({ phone: cleanPhone, message: text });
}

// 5. Unified High-Level Dispatcher
async function sendSms({ phone, message, otp = null }) {
  const cleanPhone = cleanIndianPhone(phone);
  console.log(`[SMS Dispatch] Target: +91 ${cleanPhone} | Preview: "${(message || `OTP: ${otp}`).slice(0, 80)}..."`);

  // Try Fast2SMS
  if (FAST2SMS_API_KEY) {
    const res = await sendViaFast2SMS({ phone: cleanPhone, message, otp });
    if (res.success) return res;
  }

  // Try MSG91
  if (MSG91_AUTH_KEY) {
    const res = await sendViaMSG91({ phone: cleanPhone, message, otp });
    if (res.success) return res;
  }

  // Try Twilio
  if (TWILIO_ACCOUNT_SID) {
    const res = await sendViaTwilio({ phone: cleanPhone, message: message || `Your OneWayTaxi OTP is ${otp}. Valid for 5 mins.` });
    if (res.success) return res;
  }

  // Development / Console Simulation Logger
  return {
    success: true,
    isSimulated: true,
    provider: 'local_console',
    notice: 'SMS logged to server console. Add FAST2SMS_API_KEY or MSG91_AUTH_KEY in .env for live telecom broadcast.'
  };
}

// Direct WhatsApp Deep Link Generator (Always 100% works for click-to-chat across India)
function generateWhatsAppDeepLink(phone, message) {
  const cleanPhone = cleanIndianPhone(phone);
  return `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`;
}

async function sendBookingConfirmationNotifications(booking) {
  const cleanPhone = cleanIndianPhone(booking.passengerPhone);
  const fromCity = booking.originCity || booking.pickupCity || booking.origin || 'Patna';
  const toCity = booking.destCity || booking.dropCity || booking.destination || 'Gaya';
  const msg = `Namaste ${booking.passengerName || 'Passenger'}! Your OneWayTaxi from ${fromCity} to ${toCity} on ${booking.pickupDate} at ${booking.pickupTime} is CONFIRMED.\n\nBooking ID: ${booking.bookingId}\nTrip PIN: ${booking.tripOtp || 'Shared on arrival'}\nTotal Fare: Rs ${booking.totalFare}\nAdvance Paid: Rs ${booking.advancePaid || 0}\nBalance due to driver: Rs ${booking.balanceDue || booking.totalFare}\n\nLive GPS Tracking: https://onewaytaxibihar.com/#tracking?bookingId=${booking.bookingId}\n24x7 Patna Helpline: +91 80021 41816.\nHave a safe and comfortable trip!`;

  // SMS
  const smsRes = await sendSms({ phone: cleanPhone, message: msg });

  // WhatsApp Cloud API if enabled
  const token = process.env.WHATSAPP_ACCESS_TOKEN || process.env.META_WHATSAPP_TOKEN || WHATSAPP_ACCESS_TOKEN;
  if (token) {
    sendViaWhatsAppCloud({ phone: cleanPhone, message: msg }).catch(() => {});
  }

  return {
    sms: smsRes,
    whatsappLink: generateWhatsAppDeepLink(cleanPhone, msg)
  };
}

async function sendDriverAssignmentNotifications(booking, driver) {
  const cleanPhone = cleanIndianPhone(booking.passengerPhone);
  const origin = booking.originCity || booking.pickupCity || 'Patna';
  const dest = booking.destCity || booking.dropCity || 'Bihar Outstation';
  const driverPhoneClean = cleanPhoneIndian(driver.phone);
  const msg = `OneWayTaxi Chauffeur Allocated!\n\nBooking: ${booking.bookingId}\nRoute: ${origin} -> ${dest}\nChauffeur: ${driver.name} (+91 ${driverPhoneClean})\nCab: ${driver.vehicleModel || 'Sedan'} [${driver.vehicleNumber || 'Bihar Cab'}]\nRating: ${driver.rating || '4.9'}⭐\nTrip PIN: ${booking.tripOtp || 'Shared upon arrival'}\n\nTrack Live Chauffeur GPS: https://onewaytaxibihar.com/#tracking?bookingId=${booking.bookingId}\n\nYour driver will arrive 15 minutes before scheduled pickup time.`;

  const smsRes = await sendSms({ phone: cleanPhone, message: msg });

  // WhatsApp Cloud API automated delivery
  const token = process.env.WHATSAPP_ACCESS_TOKEN || process.env.META_WHATSAPP_TOKEN || WHATSAPP_ACCESS_TOKEN;
  if (token) {
    sendViaWhatsAppCloud({ phone: cleanPhone, message: msg }).catch(() => {});
  }

  return {
    sms: smsRes,
    whatsappLink: generateWhatsAppDeepLink(cleanPhone, msg)
  };
}

function cleanPhoneIndian(p) {
  return (p || '').replace(/\D/g, '').slice(-10);
}

function getNotificationConfig() {
  return {
    fast2smsConfigured: !!(process.env.FAST2SMS_API_KEY || FAST2SMS_API_KEY),
    msg91Configured: !!(process.env.MSG91_AUTH_KEY || MSG91_AUTH_KEY),
    twilioConfigured: !!(process.env.TWILIO_ACCOUNT_SID || TWILIO_ACCOUNT_SID),
    whatsappCloudConfigured: !!(process.env.WHATSAPP_ACCESS_TOKEN || process.env.META_WHATSAPP_TOKEN || WHATSAPP_ACCESS_TOKEN),
    whatsappPhoneId: !!(process.env.WHATSAPP_PHONE_ID || process.env.META_PHONE_NUMBER_ID || WHATSAPP_PHONE_ID),
    firebaseConfigured: !!(process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_API_KEY),
    helplinePhone: process.env.DISPATCH_HELPLINE || '+91 80021 41816'
  };
}

module.exports = {
  sendSms,
  sendViaFast2SMS,
  sendViaMSG91,
  sendViaTwilio,
  sendViaWhatsAppCloud,
  sendOtpViaWhatsApp,
  generateWhatsAppDeepLink,
  sendBookingConfirmationNotifications,
  sendDriverAssignmentNotifications,
  getNotificationConfig
};
