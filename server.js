const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'pixelcraft-demo-secret-key';
const MONGO_URI = process.env.MONGO_URI;

// دالة الاتصال بقاعدة البيانات مع إمكانية إعادة الاستخدام
let cachedDb = null;

async function connectDB() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }
  if (!MONGO_URI) {
    throw new Error('MONGO_URI environment variable is missing');
  }
  const db = await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  });
  cachedDb = db;
  console.log('✅ Connected to MongoDB Atlas successfully!');
  return db;
}

// تعريف Schema و Model للمستخدمين
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// إنشاء توكن JWT
function createToken(user) {
  return jwt.sign({ id: user._id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

// Middleware للتحقق من التوكن
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Health Check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Register
app.post('/api/register', async (req, res) => {
  try {
    await connectDB(); // تأكيد الاتصال بقاعدة البيانات قبل العملية

    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required' });
    if (String(password).length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const normalized = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalized });
    if (existingUser) return res.status(409).json({ message: 'Email already registered' });

    const hash = await bcrypt.hash(String(password), 10);
    const user = await User.create({
      name: String(name).trim(),
      email: normalized,
      password: hash
    });

    const safe = { id: user._id, name: user.name, email: user.email };
    return res.status(201).json({ message: 'Registered', token: createToken(user), user: safe });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    await connectDB(); // تأكيد الاتصال بقاعدة البيانات قبل العملية

    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const normalized = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalized });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const ok = await bcrypt.compare(String(password), user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid email or password' });

    const safe = { id: user._id, name: user.name, email: user.email };
    return res.json({ message: 'Login successful', token: createToken(user), user: safe });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Me
app.get('/api/me', authMiddleware, async (req, res) => {
  try {
    await connectDB(); // تأكيد الاتصال بقاعدة البيانات قبل العملية

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Me endpoint error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Serve index.html (fallback)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ message: 'API route not found' });
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Export handler for Vercel
module.exports = (req, res) => {
  app(req, res);
};
