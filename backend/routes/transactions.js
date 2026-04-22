const router = require('express').Router();
const auth = require('../middleware/auth');
const { Transaction } = require('../models');

router.get('/', auth, async (req, res) => {
  try {
    const { category, limit = 50 } = req.query;
    const filter = { userId: req.userId };
    if (category) filter.category = category;
    const txs = await Transaction.find(filter).sort({ date: -1 }).limit(+limit);
    res.json(txs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const tx = await Transaction.create({ ...req.body, userId: req.userId });
    res.status(201).json(tx);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
