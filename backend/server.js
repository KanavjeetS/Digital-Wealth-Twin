require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');

const app = express();

function corsOriginOption() {
  const multi = process.env.FRONTEND_URLS;
  if (multi) return multi.split(',').map((s) => s.trim()).filter(Boolean);
  if (process.env.FRONTEND_URL) return process.env.FRONTEND_URL;
  return ['http://localhost:3000', 'http://localhost:3001'];
}

// ─── Security & Middleware ────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: corsOriginOption(), credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', limiter);

// ─── Database ─────────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/securewealth';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/user',         require('./routes/user'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/goals',        require('./routes/goals'));
app.use('/api/investments',  require('./routes/investments'));
app.use('/api/risk',         require('./routes/risk'));
app.use('/api/dashboard',    require('./routes/dashboard'));
app.use('/api/ai',           require('./routes/ai'));
app.use('/api/execute',      require('./routes/execute'));
app.use('/api/chat',         require('./routes/chat'));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({
  status: 'ok',
  timestamp: new Date().toISOString(),
  mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
}));

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 SecureWealth backend running on http://localhost:${PORT}`));
