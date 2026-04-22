const router = require('express').Router();
const auth = require('../middleware/auth');
const { RiskLog } = require('../models');
const axios = require('axios');
const { evaluateLocalRisk } = require('../lib/riskEngine');

// POST /api/risk/check
router.post('/check', auth, async (req, res) => {
  try {
    const { action_type, amount } = req.body;

    // Try forwarding to Python AI service first
    const AI_URL = process.env.AI_SERVICE_URL;
    if (AI_URL) {
      try {
        const aiRes = await axios.post(`${AI_URL}/api/risk/check`, req.body, { timeout: 3000 });
        const result = aiRes.data;
        await RiskLog.create({
          userId: req.userId,
          actionType: action_type,
          amount,
          riskScore: Number(result.risk_score ?? result.riskScore ?? 0),
          level: result.level,
          decision: result.decision,
          reason: result.reason,
          signals: result.signals || [],
        });
        return res.json(result);
      } catch { /* fallback to local engine */ }
    }

    const r = evaluateLocalRisk(req.body);
    await RiskLog.create({
      userId: req.userId,
      actionType: action_type || 'UNKNOWN',
      amount: amount || 0,
      riskScore: r.risk_score,
      level: r.level,
      decision: r.decision,
      reason: r.reason,
      signals: r.signals,
    });
    res.json({ risk_score: r.risk_score, level: r.level, decision: r.decision, reason: r.reason, signals: r.signals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/risk/history
router.get('/history', auth, async (req, res) => {
  try {
    const logs = await RiskLog.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
