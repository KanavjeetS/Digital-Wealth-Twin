const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Transaction, Goal, Investment } = require('../models');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'dev_secret', {
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, age, income, riskAppetite, primaryGoal, currentSavings } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email and password required' });

    if (await User.findOne({ email }))
      return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash, age, income, riskAppetite, primaryGoal, currentSavings });

    // Seed demo data
    await seedDemoData(user._id);

    res.status(201).json({ token: sign(user._id), user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return res.status(401).json({ error: 'Invalid credentials' });

    res.json({ token: sign(user._id), user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function sanitize(u) {
  const obj = u.toObject();
  delete obj.passwordHash;
  return obj;
}

async function seedDemoData(userId) {
  await Transaction.insertMany([
    { userId, description: 'SIP - Parag Parikh Flexi Cap', amount: 5000, category: 'Investment', isExpense: true },
    { userId, description: 'Salary Credit', amount: 55000, category: 'Income', isExpense: false },
    { userId, description: 'Rent', amount: 18000, category: 'Housing', isExpense: true },
    { userId, description: 'Zomato / Swiggy', amount: 1800, category: 'Food', isExpense: true },
    { userId, description: 'Netflix + Spotify', amount: 999, category: 'Entertainment', isExpense: true },
    { userId, description: 'FD Maturity', amount: 25000, category: 'Investment', isExpense: false },
  ]);
  await Goal.insertMany([
    { userId, name: 'House Down Payment', targetAmount: 1500000, currentSaved: 420000, monthlyTarget: 12500, color: '#00D4FF' },
    { userId, name: 'Emergency Fund', targetAmount: 300000, currentSaved: 120000, monthlyTarget: 7500, color: '#10B981' },
    { userId, name: 'Europe Trip', targetAmount: 150000, currentSaved: 45000, monthlyTarget: 5000, color: '#F59E0B' },
  ]);
  await Investment.insertMany([
    { userId, type: 'SIP', name: 'Parag Parikh Flexi Cap', amount: 5000, returns: 14.2 },
    { userId, type: 'FD', name: 'SBI Fixed Deposit', amount: 100000, returns: 7.1 },
    { userId, type: 'SIP', name: 'HDFC Mid Cap Opportunities', amount: 3000, returns: 16.8 },
  ]);
}

module.exports = router;
