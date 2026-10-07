const { MongoClient } = require('mongodb');
const crypto = require('crypto');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://himanshudu255_db_user:Himanshu%40123@cluster0.7pf5pvc.mongodb.net/onewaytaxibihar?retryWrites=true&w=majority&appName=Cluster0';

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
  const inputCode = (body.otp || '').toString().trim();
  const name = (body.name || '').trim() || 'Valued Passenger';

  if (!cleanPhone || cleanPhone.length !== 10) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: false, message: 'Valid 10-digit mobile number required.' }));
  }

  if (!inputCode) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: false, message: 'Please enter the verification OTP code.' }));
  }

  let db = null;
  let activeRecord = null;

  try {
    db = await connectToDatabase();
    activeRecord = await db.collection('otps').findOne({ phone: cleanPhone });
  } catch (dbErr) {
    console.warn('[MongoDB verify note]:', dbErr.message);
  }

  // Validate OTP
  let isValid = false;
  if (activeRecord && activeRecord.code && activeRecord.code.toString().trim() === inputCode) {
    if (new Date() <= new Date(activeRecord.expiresAt)) {
      isValid = true;
    }
  }

  if (!isValid && activeRecord && activeRecord.code !== inputCode) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: false,
      message: 'Invalid verification code. Please check your SMS or re-enter.'
    }));
  }

  // Clean up used OTP
  if (db) {
    try {
      await db.collection('otps').deleteOne({ phone: cleanPhone });
    } catch(e) {}
  }

  // Find or Create User
  const token = 'otb_sess_' + crypto.randomBytes(16).toString('hex');
  let user = {
    id: `usr_${cleanPhone}`,
    name: name || activeRecord?.name || 'Valued Passenger',
    phone: `+91 ${cleanPhone}`,
    email: (body.email || '').trim().toLowerCase(),
    walletBalance: 100,
    rewardClaimed: true,
    isPhoneVerified: true,
    memberSince: new Date().getFullYear().toString(),
    createdAt: new Date().toISOString()
  };

  if (db) {
    try {
      const existing = await db.collection('users').findOne({ phone: { $regex: cleanPhone } });
      if (existing) {
        user = { ...existing, isPhoneVerified: true };
        if (name && name !== 'Valued Passenger') user.name = name;
        await db.collection('users').updateOne({ _id: existing._id }, { $set: user });
      } else {
        await db.collection('users').insertOne(user);
      }

      await db.collection('sessions').insertOne({
        token: token,
        userId: user.id,
        phone: user.phone,
        role: 'customer',
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('[MongoDB user update note]:', e.message);
    }
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify({
    success: true,
    token: token,
    user: user,
    isFirstTimeUser: true,
    rewardGranted: true,
    rewardAmount: 100,
    message: 'Mobile verified successfully! ₹100 Welcome Reward credited to your wallet.'
  }));
};
