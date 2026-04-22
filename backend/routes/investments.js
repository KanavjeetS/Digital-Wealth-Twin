const router = require('express').Router();
const auth = require('../middleware/auth');
const { Investment } = require('../models');

router.get('/', auth, async (req, res) => {
  try { res.json(await Investment.find({ userId: req.userId })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', auth, async (req, res) => {
  try { res.status(201).json(await Investment.create({ ...req.body, userId: req.userId })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
