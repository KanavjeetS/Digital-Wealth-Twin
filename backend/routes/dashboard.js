const router = require('express').Router();
const auth = require('../middleware/auth');
const { Transaction, Goal, Investment, RiskLog } = require('../models');

router.get('/summary', auth, async (req, res) => {
  try {
    const [transactions, goals, investments, riskLogs] = await Promise.all([
      Transaction.find({ userId: req.userId }).sort({ date: -1 }).limit(10),
      Goal.find({ userId: req.userId }),
      Investment.find({ userId: req.userId }),
      RiskLog.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(5),
    ]);

    const totalInvested = investments.reduce((s, i) => s + i.amount, 0);
    const totalSaved = goals.reduce((s, g) => s + g.currentSaved, 0);
    const netWorth = totalInvested * 1.14 + totalSaved + 120000;

    const income = transactions.filter(t => !t.isExpense).reduce((s, t) => s + t.amount, 0);
    const expenses = transactions.filter(t => t.isExpense).reduce((s, t) => s + t.amount, 0);

    res.json({
      netWorth: Math.round(netWorth),
      totalInvested,
      totalSaved,
      income,
      expenses,
      savingsRate: income > 0 ? Math.round(((income - expenses) / income) * 100) : 0,
      recentTransactions: transactions,
      goals,
      investments,
      recentRiskEvents: riskLogs,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
