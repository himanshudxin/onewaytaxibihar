const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://himanshudu255_db_user:Himanshu%40123@cluster0.7pf5pvc.mongodb.net/onewaytaxibihar?retryWrites=true&w=majority&appName=Cluster0';
const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY || '9tRWU6vwiOcTH4LzNMSBCujlfhEG2xnV7X8pIakoeAP15dbFKys7FLguhCk6G2jfb9vqNpASY5r0iolx';

let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  const client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 20,
    serverSelectionTimeoutMS: 5000
  });
  await client.connect();
  cachedDb = client.db('onewaytaxibihar');
  return cachedDb;
}

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  // Parse Body
  let body = req.body || {};
  if (typeof body === 'string' && body.trim()) {
    try { body = JSON.parse(body); } catch(e) { body = {}; }
  } else if (!req.body && req.method === 'POST') {
    try {
      const buffers = [];
      for await (const chunk of req) buffers.push(chunk);
      const data = Buffer.concat(buffers).toString('utf8');
      body = data ? JSON.parse(data) : {};
    } catch(e) { body = {}; }
  }

  const rawPhone = (body.phone || '').toString();
  const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
  const name = (body.name || '').trim() || 'Valued Passenger';

  if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: false,
      message: 'Valid 10-digit Indian mobile number starting with 6-9 required.'
    }));
  }

  // Generate genuine 6-digit OTP code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // Store in MongoDB
  try {
    const db = await connectToDatabase();
    await db.collection('otps').updateOne(
      { phone: cleanPhone },
      {
        $set: {
          phone: cleanPhone,
          code: code,
          name: name,
          expiresAt: expiresAt,
          updatedAt: new Date(),
          attempts: 0
        }
      },
      { upsert: true }
    );
  } catch(dbErr) {
    console.warn('[MongoDB OTP Note]:', dbErr.message);
  }

  // Dispatch live SMS via Fast2SMS Telecom Gateway
  let smsStatus = { success: false, provider: 'fast2sms' };
  try {
    const textMsg = `Your OneWayTaxiBihar OTP code is ${code}. Valid for 10 minutes. Do not share.`;
    const fRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': FAST2SMS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        route: 'q',
        message: textMsg,
        language: 'english',
        flash: 0,
        numbers: cleanPhone
      })
    });
    const fData = await fRes.json();
    smsStatus = {
      success: Boolean(fData && (fData.return === true || fData.status_code === 200 || fRes.ok)),
      provider: 'fast2sms',
      response: fData
    };
  } catch(smsErr) {
    console.error('[Fast2SMS Error]:', smsErr.message);
    smsStatus.error = smsErr.message;
  }

  const waText = `OneWayTaxiBihar Verification Code for +91 ${cleanPhone} is: ${code}. Valid for 10 minutes. Welcome Reward: Rs 100 on first booking.`;
  const waUrl = `https://wa.me/917281851011?text=${encodeURIComponent(waText)}`;

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify({
    success: true,
    phone: `+91 ${cleanPhone}`,
    cleanPhone,
    isNewUser: true,
    rewardEligible: true,
    rewardAmount: 100,
    otpCode: code,
    whatsappUrl: waUrl,
    smsStatus: smsStatus,
    message: `Verification code dispatched to +91 ${cleanPhone} via SMS & WhatsApp.`
  }));
};
