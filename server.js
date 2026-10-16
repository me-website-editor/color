const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'pixelcraft-demo-secret-key';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Demo in-memory user store (ephemeral)
const users = [];

// Create JWT token
function createToken(user) {
  return jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

// Auth middleware
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

// Health
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required' });
    if (String(password).length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const normalized = String(email).trim().toLowerCase();
    if (users.find(u => u.email === normalized)) return res.status(409).json({ message: 'Email already registered' });

    const hash = await bcrypt.hash(String(password), 10);
    const user = { id: Date.now(), name: String(name).trim(), email: normalized, password: hash };
    users.push(user);

    const safe = { id: user.id, name: user.name, email: user.email };
    return res.status(201).json({ message: 'Registered', token: createToken(safe), user: safe });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const normalized = String(email).trim().toLowerCase();
    const user = users.find(u => u.email === normalized);
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const ok = await bcrypt.compare(String(password), user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid email or password' });

    const safe = { id: user.id, name: user.name, email: user.email };
    return res.json({ message: 'Login successful', token: createToken(safe), user: safe });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Me
app.get('/api/me', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === Number(req.user.id));
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json({ user: { id: user.id, name: user.name, email: user.email } });
});

// Serve index.html (fallback for client-side routes)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ message: 'API route not found' });
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Export handler for Vercel
module.exports = (req, res) => {
  app(req, res);
};