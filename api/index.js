const { MongoClient, ObjectId } = require('mongodb');

// MongoDB connection (lazy initialized)
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const uri = process.env.MONGODB_URI_LOCAL;
  if (!uri) {
    console.warn('MONGODB_URI_LOCAL not set - running in demo mode');
    return { client: null, db: null };
  }

  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db();

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    return { client: null, db: null };
  }
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  // Health check endpoints
  if (path === '/healthz' || path === '/api/healthz') {
    return res.json({ status: 'ok' });
  }

  if (path === '/readyz' || path === '/api/readyz') {
    return res.json({ status: 'ready' });
  }

  // Root endpoint
  if (path === '/' || path === '/api') {
    return res.json({
      status: 'ok',
      service: 'CDT Engine API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/healthz',
        ready: '/readyz',
        consents: '/api/v1/consents',
        users: '/api/v1/users',
        partners: '/api/v1/partners'
      },
      mode: process.env.MONGODB_URI_LOCAL ? 'production' : 'demo'
    });
  }

  // API v1 routes
  const { db } = await connectToDatabase();

  // Demo mode responses when no database
  if (!db) {
    if (path.startsWith('/api/v1/consents')) {
      return res.json({
        message: 'CDT Consents API (demo mode)',
        demo: true,
        data: [
          {
            id: 'demo-consent-1',
            userId: 'user-123',
            partnerId: 'partner-abc',
            purpose: 'Marketing',
            status: 'ACTIVE',
            createdAt: new Date().toISOString()
          }
        ]
      });
    }

    if (path.startsWith('/api/v1/users')) {
      return res.json({
        message: 'CDT Users API (demo mode)',
        demo: true,
        data: [
          {
            id: 'demo-user-1',
            email: 'demo@example.com',
            firstName: 'Demo',
            lastName: 'User',
            role: 'USER'
          }
        ]
      });
    }

    if (path.startsWith('/api/v1/partners')) {
      return res.json({
        message: 'CDT Partners API (demo mode)',
        demo: true,
        data: [
          {
            id: 'demo-partner-1',
            name: 'Demo Partner',
            status: 'ACTIVE'
          }
        ]
      });
    }

    return res.json({
      status: 'ok',
      message: 'CDT API running in demo mode',
      path: path,
      demo: true
    });
  }

  // Production mode with MongoDB
  try {
    // GET consents
    if (req.method === 'GET' && path === '/api/v1/consents') {
      const consents = await db.collection('consents').find({}).limit(100).toArray();
      return res.json({ data: consents, total: consents.length });
    }

    // POST consent
    if (req.method === 'POST' && path === '/api/v1/consents') {
      let body = '';
      for await (const chunk of req) {
        body += chunk;
      }
      const consentData = JSON.parse(body);
      consentData.createdAt = new Date();
      consentData.status = 'ACTIVE';

      const result = await db.collection('consents').insertOne(consentData);
      return res.status(201).json({
        message: 'Consent created',
        id: result.insertedId
      });
    }

    // GET users
    if (req.method === 'GET' && path === '/api/v1/users') {
      const users = await db.collection('users').find({}).limit(100).toArray();
      return res.json({ data: users, total: users.length });
    }

    // GET partners
    if (req.method === 'GET' && path === '/api/v1/partners') {
      const partners = await db.collection('partners').find({}).limit(100).toArray();
      return res.json({ data: partners, total: partners.length });
    }

    // GET audit logs
    if (req.method === 'GET' && path === '/api/v1/audit') {
      const audits = await db.collection('audits').find({})
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray();
      return res.json({ data: audits, total: audits.length });
    }

    // Fallback
    return res.json({
      status: 'ok',
      message: 'CDT API',
      path: path,
      method: req.method
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
};
