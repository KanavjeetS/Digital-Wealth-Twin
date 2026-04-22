// routes/user.js
const router = require('express').Router();
const auth = require('../middleware/auth');
const { User } = require('../models');

router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const allowed = ['name','age','income','riskAppetite','primaryGoal','currentSavings','onboardingDone','wealthArchetype'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select('-passwordHash');
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
