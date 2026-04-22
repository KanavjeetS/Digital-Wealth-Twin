const router = require('express').Router();
const auth = require('../middleware/auth');
const axios = require('axios');
const { evaluateLocalRisk } = require('../lib/riskEngine');
const { RiskLog } = require('../models');

const AI_URL = () => process.env.AI_SERVICE_URL || '';

function buildSimulationPreview(monthlyAmount, years = 10, annualRate = 12) {
  const monthly_amount = Math.max(500, Math.round(monthlyAmount));
  const r = annualRate / 100 / 12;
  const months = years * 12;
  const startNow = Array.from({ length: months + 1 }, (_, m) => ({
    month: m,
    value: m === 0 ? 0 : Math.round(monthly_amount * ((Math.pow(1 + r, m) - 1) / r) * (1 + r)),
  }));
  const startLater = Array.from({ length: months + 1 }, (_, m) => ({
    month: m,
    value: m < 12 ? 0 : Math.round(monthly_amount * ((Math.pow(1 + r, m - 12) - 1) / r) * (1 + r)),
  }));
  const finalNow = startNow[months].value;
  const finalLater = startLater[months].value;
  const diff = finalNow - finalLater;
  return {
    start_now: startNow,
    start_later: startLater,
    summary: {
      final_value_now: finalNow,
      final_value_later: finalLater,
      opportunity_cost: diff,
      nudge_message: `Starting 1 year later costs you ₹${diff.toLocaleString('en-IN')}`,
    },
  };
}

// POST /api/execute — master decision engine (risk + optional projection)
router.post('/', auth, async (req, res) => {
  try {
    const url = AI_URL();
    if (url) {
      try {
        const aiRes = await axios.post(`${url}/api/execute`, { ...req.body, user_id: req.userId }, { timeout: 8000 });
        const data = aiRes.data;
        await RiskLog.create({
          userId: req.userId,
          actionType: req.body.action_type || 'EXECUTE',
          amount: req.body.amount || 0,
          riskScore: data.risk_score ?? data.riskScore ?? data.risk?.risk_score,
          level: data.level ?? data.risk?.level,
          decision: data.decision ?? data.risk?.decision,
          reason: data.reason ?? data.risk?.reason,
          signals: data.signals ?? data.risk?.signals ?? [],
        }).catch(() => {});
        return res.json(data);
      } catch (e) {
        console.warn('execute proxy failed:', e.message);
      }
    }

    const risk = evaluateLocalRisk({
      action_type: req.body.action_type || 'INVESTMENT',
      amount: req.body.amount || 0,
      avg_amount: req.body.avg_amount ?? 20000,
      is_new_device: !!req.body.is_new_device,
      seconds_since_login: req.body.seconds_since_login ?? 300,
      is_first_investment_type: !!req.body.is_first_investment_type,
      otp_retry_count: req.body.otp_retry_count ?? 0,
    });

    await RiskLog.create({
      userId: req.userId,
      actionType: req.body.action_type || 'INVESTMENT',
      amount: req.body.amount || 0,
      riskScore: risk.risk_score,
      level: risk.level,
      decision: risk.decision,
      reason: risk.reason,
      signals: risk.signals,
    }).catch(() => {});

    const monthlySip = Math.min(50000, Math.max(500, Math.round((req.body.amount || 100000) / 24)));
    const simulation = (risk.decision === 'BLOCK')
      ? null
      : buildSimulationPreview(monthlySip, 10, 12);

    res.json({
      decision: risk.decision,
      risk_score: risk.risk_score,
      level: risk.level,
      reason: risk.reason,
      signals: risk.signals,
      simulation,
      message:
        risk.decision === 'BLOCK'
          ? 'This action cannot proceed until risk signals are cleared.'
          : risk.decision === 'WARN'
            ? 'Proceed with caution after cooling-off verification.'
            : 'Risk checks passed. Projection shows long-term benefit of disciplined investing.',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
