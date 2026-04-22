const router = require('express').Router();
const auth = require('../middleware/auth');
const axios = require('axios');
const { evaluateLocalRisk } = require('../lib/riskEngine');
const { User, Investment, Goal, Transaction } = require('../models');

const AI_URL = () => process.env.AI_SERVICE_URL || 'http://localhost:8000';

function buildSimulation(monthly_amount = 5000, years = 10, annual_rate = 12.0) {
  const r = annual_rate / 100 / 12;
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

/** Parse rupee amount from natural language (demo / fallback). */
function parseInvestAmount(message) {
  const m = String(message).toLowerCase();
  let amt = null;
  const lakh = m.match(/(\d+(?:\.\d+)?)\s*lakh/);
  if (lakh) amt = Math.round(parseFloat(lakh[1], 10) * 100000);
  const cr = m.match(/(\d+(?:\.\d+)?)\s*(crore|cr)\b/);
  if (cr) amt = Math.round(parseFloat(cr[1], 10) * 10000000);
  const plain = m.match(/(?:₹|rs\.?|inr)\s*(\d{1,3}(?:,\d{2,3})*)/);
  if (plain) amt = parseInt(plain[1].replace(/,/g, ''), 10);
  const digits = m.match(/\b(\d{4,})\b/);
  if (amt == null && digits) amt = parseInt(digits[1], 10);
  if (/\bone\s+lakh\b|\b1\s+lakh\b/.test(m)) amt = 100000;
  if (/\bhalf\s+lakh\b/.test(m)) amt = 50000;
  return amt;
}

function riskSignalsFromMessage(message) {
  const msg = String(message).toLowerCase();
  return {
    is_new_device: /\bnew device|new phone|different phone|unknown device\b/.test(msg),
    seconds_since_login: /\bjust logged|right after login|immediately after login|seconds after\b/.test(msg) ? 25 : 400,
    otp_retry_count: /\botp failed|wrong otp|multiple otp|otp retry\b/.test(msg) ? 3 : 0,
    is_first_investment_type: /\bfirst investment|first time investing|never invested before\b/.test(msg),
    avg_amount: 18000,
  };
}

function wantsSimulationAdvice(message) {
  const msg = String(message).toLowerCase();
  return /\bsimulat|what if i delay|delay starting|start later|opportunity cost|compound|projection\b/.test(msg);
}

function wantsInvestAction(message) {
  const msg = String(message).toLowerCase();
  return /\binvest|put\s+₹|put\s+rs|transfer\s+₹|allocate\s+₹|buy\s+mf|lump\s*sum|sip\b/.test(msg) && (parseInvestAmount(message) != null || /\binvest\b/.test(msg));
}

function normalizeUpstreamChat(data) {
  if (!data || typeof data !== 'object') return { type: 'chat', reply: 'No response from AI service.', reason: null };
  if (data.type && ['chat', 'simulation_advice', 'action_response'].includes(data.type)) return data;
  const reply = data.reply ?? data.message ?? data.content ?? data.text;
  const reason = data.reason ?? data.why ?? data.explanation ?? null;
  if (reply) return { type: data.type || 'chat', reply, reason, ...data };
  return { type: 'chat', reply: JSON.stringify(data), reason: null };
}

// ─── Wealth Coach — typed responses for unified UI ─────────────────────────
router.post('/chat', auth, async (req, res) => {
  try {
    const { message = '', user_profile = {} } = req.body;
    const msg = String(message);

    try {
      const aiRes = await axios.post(`${AI_URL()}/api/ai/chat`, req.body, { timeout: 12000 });
      return res.json(normalizeUpstreamChat(aiRes.data));
    } catch (e) {
      console.warn('AI chat proxy:', e.message);
    }

    // ── Local intelligent agents (fallback when :8000 unavailable) ──
    if (wantsSimulationAdvice(msg)) {
      const sim = buildSimulation(5000, 10, 12);
      return res.json({
        type: 'simulation_advice',
        reply: `If you stay consistent with **₹5,000/month** at **12% p.a.**, delaying by one year leaves about **${sim.summary.nudge_message.replace(/^Starting 1 year later costs you /, '₹')}** on the table. Use the Simulator to tune amounts.`,
        reason: 'Compound growth is modelled as monthly SIP with the same rate for “start now” vs “start after 12 months”.',
        simulation: sim,
      });
    }

    if (wantsInvestAction(msg)) {
      const amount = parseInvestAmount(msg) || 100000;
      const sig = riskSignalsFromMessage(msg);
      const risk = evaluateLocalRisk({
        action_type: 'INVESTMENT',
        amount,
        avg_amount: sig.avg_amount,
        is_new_device: sig.is_new_device,
        seconds_since_login: sig.seconds_since_login,
        is_first_investment_type: sig.is_first_investment_type,
        otp_retry_count: sig.otp_retry_count,
      });
      const monthly = Math.min(50000, Math.max(500, Math.round(amount / 36)));
      const sim = risk.decision === 'BLOCK' ? null : buildSimulation(monthly, 10, 12);
      const reply =
        risk.decision === 'BLOCK'
          ? `I cannot recommend proceeding with **₹${amount.toLocaleString('en-IN')}** right now — our risk engine returned **BLOCK** (score **${risk.risk_score}/100**). Please verify device and activity, then try again or contact support.`
          : risk.decision === 'WARN'
            ? `**Risk: WARN** (score **${risk.risk_score}/100**) for **₹${amount.toLocaleString('en-IN')}**. You may proceed after a short cooling-off and OTP confirmation. Below is a long-term projection if you invest steadily (~**${monthly.toLocaleString('en-IN')}**/mo SIP).`
            : `**Risk: ALLOW** (score **${risk.risk_score}/100**) for **₹${amount.toLocaleString('en-IN')}**. Pattern looks consistent with your profile. Suggested next step: set up a disciplined SIP; preview compounding below.`;

      return res.json({
        type: 'action_response',
        reply,
        reason: 'Signals evaluated: device trust, time since login, amount vs baseline, OTP behaviour, and investment familiarity — same engine as POST /api/risk/check.',
        suggested_amount: amount,
        risk: {
          risk_score: risk.risk_score,
          level: risk.level,
          decision: risk.decision,
          reason: risk.reason,
          signals: risk.signals,
        },
        simulation_preview: sim,
      });
    }

    const lc = msg.toLowerCase();
    let reply; let reason;
    if (lc.includes('sip') || lc.includes('mutual fund')) {
      reply = `Given your ${user_profile.income ? '₹' + Number(user_profile.income).toLocaleString('en-IN') + '/mo' : ''} income and **${user_profile.goal || 'wealth goal'}**, a diversified equity SIP (Flexi + Mid-cap blend) fits a **${user_profile.risk_appetite || 'medium'}** profile.`;
      reason = 'Rule-based suggestion from income, goal horizon, and stated risk appetite (local coach).';
    } else if (lc.includes('saving') || lc.includes('emergency')) {
      reply = 'Aim for **6× monthly expenses** in liquid funds before scaling equity. Automate a monthly sweep on salary day.';
      reason = 'Standard emergency-fund heuristic used by planners for Indian households.';
    } else {
      reply = `Hi **${user_profile.name || 'there'}** — I have your profile (income **₹${Number(user_profile.income || 55000).toLocaleString('en-IN')}**, goal: **${user_profile.goal || 'build wealth'}**). Ask about investing, simulation, or risk — try *“I want to invest 1 lakh”*.`;
      reason = 'Personalised opener from onboarding fields stored in SecureWealth.';
    }
    return res.json({ type: 'chat', reply, reason });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/simulate', auth, async (req, res) => {
  try {
    const aiRes = await axios.post(`${AI_URL()}/api/ai/simulate`, req.body, { timeout: 8000 });
    return res.json(aiRes.data);
  } catch (e) {
    console.warn('AI simulate proxy:', e.message);
    const { monthly_amount = 5000, years = 10, annual_rate = 12.0 } = req.body;
    return res.json(buildSimulation(monthly_amount, years, annual_rate));
  }
});

// ─── Multi-bank aggregator (proxy or demo) ──────────────────────────────────
router.post('/aggregate', auth, async (req, res) => {
  try {
    const aiRes = await axios.post(`${AI_URL()}/api/ai/aggregate`, req.body, { timeout: 8000 });
    return res.json(aiRes.data);
  } catch (e) {
    console.warn('AI aggregate proxy:', e.message);
    const banks = [
      { id: 'hdfc', name: 'HDFC Bank', balance: 245000, currency: 'INR' },
      { id: 'sbi', name: 'SBI', balance: 118000, currency: 'INR' },
      { id: 'icici', name: 'ICICI Bank', balance: 87000, currency: 'INR' },
    ];
    const total = banks.reduce((s, b) => s + b.balance, 0);
    res.json({
      total_balance: total,
      banks,
      distribution: banks.map(b => ({ name: b.name, value: b.balance })),
      insights: [
        total > 400000 && 'About 32% of cash sits idle in low-yield savings — consider liquid funds for emergency buffer only.',
        'Salary inflow detected monthly from HDFC — good consistency for SIP auto-debit.',
      ],
    });
  }
});

// ─── Net worth + financial health ─────────────────────────────────────────────
router.post('/networth', auth, async (req, res) => {
  try {
    const aiRes = await axios.post(`${AI_URL()}/api/ai/networth`, req.body, { timeout: 8000 });
    return res.json(aiRes.data);
  } catch (e) {
    console.warn('AI networth proxy:', e.message);
    const [user, investments, goals, txs] = await Promise.all([
      User.findById(req.userId).lean(),
      Investment.find({ userId: req.userId }).lean(),
      Goal.find({ userId: req.userId }).lean(),
      Transaction.find({ userId: req.userId }).sort({ date: -1 }).limit(30).lean(),
    ]);
    const totalInvested = investments.reduce((s, i) => s + (i.amount || 0), 0);
    const totalSaved = goals.reduce((s, g) => s + (g.currentSaved || 0), 0);
    const income = txs.filter(t => !t.isExpense).reduce((s, t) => s + t.amount, 0);
    const expenses = txs.filter(t => t.isExpense).reduce((s, t) => s + t.amount, 0);
    const netWorth = Math.round(totalInvested * 1.14 + totalSaved + 120000);
    const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 28;
    const healthScore = Math.min(100, Math.max(35, Math.round(
      38 + savingsRate * 0.45 + (totalSaved > 200000 ? 12 : 0) + (totalInvested > 50000 ? 10 : 0),
    )));
    res.json({
      net_worth: netWorth,
      health_score: healthScore,
      assets: [
        { label: 'Investments (marked to model)', value: Math.round(totalInvested * 1.14) },
        { label: 'Goal savings', value: totalSaved },
        { label: 'Liquid & other', value: 120000 },
      ],
      liabilities: [{ label: 'Credit / loans (demo)', value: 0 }],
      insights: [
        `Savings rate ~**${savingsRate}%** — ${savingsRate >= 30 ? 'strong discipline.' : 'consider pushing toward 30%.'}`,
        user?.primaryGoal && `Primary goal “**${user.primaryGoal}**” — align SIPs to this bucket.`,
      ].filter(Boolean),
    });
  }
});

// ─── Profile archetype ───────────────────────────────────────────────────────
router.post('/profile/analyze', auth, async (req, res) => {
  try {
    const aiRes = await axios.post(`${AI_URL()}/api/ai/profile/analyze`, req.body, { timeout: 8000 });
    return res.json(aiRes.data);
  } catch (e) {
    console.warn('AI profile proxy:', e.message);
    const user = await User.findById(req.userId).lean();
    const archetype = user?.wealthArchetype || 'Balanced Accumulator';
    res.json({
      archetype,
      summary: `${user?.name || 'You'} — **${archetype}** with **${user?.riskAppetite || 'medium'}** risk appetite and focus on **${user?.primaryGoal || 'long-term wealth'}**.`,
      traits: ['Goal-oriented', 'Digital-first', 'Moderate volatility tolerance'],
    });
  }
});

module.exports = router;
