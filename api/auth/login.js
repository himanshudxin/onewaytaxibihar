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
  const name = (body.name || '').trim() || 'Valued Passenger';

  if (!cleanPhone || cleanPhone.length !== 10) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: false, message: 'Valid 10-digit mobile number required.' }));
  }

  const token = 'otb_sess_' + crypto.randomBytes(16).toString('hex');
  let user = {
    id: `usr_${cleanPhone}`,
    name: name,
    phone: `+91 ${cleanPhone}`,
    email: (body.email || '').trim().toLowerCase(),
    walletBalance: 100,
    isPhoneVerified: true,
    memberSince: new Date().getFullYear().toString(),
    createdAt: new Date().toISOString()
  };

  try {
    const db = await connectToDatabase();
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
  } catch(e) {
    console.warn('[MongoDB login note]:', e.message);
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify({
    success: true,
    token: token,
    user: user,
    message: `Welcome back, ${user.name}!`
  }));
};
