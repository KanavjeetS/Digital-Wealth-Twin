// goals.js
const router = require('express').Router();
const auth = require('../middleware/auth');
const { Goal } = require('../models');

router.get('/', auth, async (req, res) => {
  try { res.json(await Goal.find({ userId: req.userId })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', auth, async (req, res) => {
  try { res.status(201).json(await Goal.create({ ...req.body, userId: req.userId })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/:id', auth, async (req, res) => {
  try { res.json(await Goal.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, req.body, { new: true })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/:id', auth, async (req, res) => {
  try { await Goal.findOneAndDelete({ _id: req.params.id, userId: req.userId }); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
