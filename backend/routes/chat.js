const router = require('express').Router();
const auth = require('../middleware/auth');
const { ChatHistory, User } = require('../models');

// POST /api/chat/message
router.post('/message', auth, async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Message required' });

    const user = await User.findById(req.userId);

    // Try OpenAI
    const OPENAI_KEY = process.env.OPENAI_API_KEY;
    if (OPENAI_KEY && !OPENAI_KEY.includes('placeholder') && !OPENAI_KEY.includes('your-')) {
      try {
        const OpenAI = require('openai');
        const openai = new OpenAI({ apiKey: OPENAI_KEY });

        const systemPrompt = `You are SecureWealth AI, a personal financial advisor for ${user?.name || 'the user'}.
User Profile: Age ${user?.age || 28}, Monthly Income ₹${user?.income || 55000}, Risk Appetite: ${user?.riskAppetite || 'medium'}, Goal: ${user?.primaryGoal || 'wealth building'}.
You provide concise, actionable, personalised Indian financial advice. Always mention specific Indian funds, schemes, or financial products when relevant (SEBI-regulated). Keep responses under 150 words. End with one concrete next step.`;

        const messages = [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.slice(-8).map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: message },
        ];

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages,
          max_tokens: 300,
          temperature: 0.7,
        });

        const reply = completion.choices[0].message.content;

        // Save to DB
        await ChatHistory.findOneAndUpdate(
          { userId: req.userId },
          { $push: { messages: [{ role: 'user', content: message }, { role: 'assistant', content: reply }] } },
          { upsert: true, new: true }
        );

        return res.json({ reply, model: 'gpt-4o-mini' });
      } catch (err) {
        console.error('OpenAI error:', err.message);
      }
    }

    // Smart mock fallback
    const lc = message.toLowerCase();
    let reply = '';

    if (lc.includes('sip') || lc.includes('mutual fund')) {
      reply = `For your profile (₹${Number(user?.income || 55000).toLocaleString('en-IN')} income, medium risk), I'd recommend:\n\n• **Parag Parikh Flexi Cap** — ₹3,000/mo (diversified, global exposure)\n• **HDFC Mid Cap Opportunities** — ₹2,000/mo (growth potential)\n\nStart with a 6-month FD as emergency fund first. **Next step:** Open a Zerodha or Groww account and activate your KYC today.`;
    } else if (lc.includes('tax') || lc.includes('80c')) {
      reply = `Great timing! For FY2026 tax saving:\n\n• **ELSS Funds** — ₹1.5L limit under 80C, 3yr lock-in, ~14% avg returns\n• **PPF** — ₹1.5L limit, 7.1% risk-free, 15yr tenure\n• **NPS** — Extra ₹50K deduction under 80CCD(1B)\n\n**Next step:** Invest ₹12,500/mo in ELSS to max out 80C by March.`;
    } else if (lc.includes('house') || lc.includes('home') || lc.includes('property')) {
      reply = `For your 7-year house goal:\n\n• Need: ~₹15L down payment (20% of ₹75L property)\n• Current savings: ₹${Number(user?.currentSavings || 120000).toLocaleString('en-IN')}\n• Gap: ~₹10.3L in 7 years = ₹8,200/mo SIP at 12% CAGR\n\n**Next step:** Start a dedicated ₹8,500/mo SIP in a balanced advantage fund labelled "House Goal".`;
    } else if (lc.includes('emergency') || lc.includes('fund')) {
      reply = `Your emergency fund target: 6× monthly expenses ≈ ₹${Number((user?.income || 55000) * 0.7 * 6).toLocaleString('en-IN')}.\n\nBest options:\n• **Liquid mutual fund** (Mirae Asset Liquid) — instant redemption\n• **High-yield savings** — Kotak 811, 4-5% interest\n\n**Next step:** Auto-debit ₹5,000/mo to a liquid fund until emergency fund is complete.`;
    } else {
      reply = `I'm here to help with your wealth journey, ${user?.name?.split(' ')[0] || 'friend'}! 🎯\n\nI can advise on:\n• SIPs and mutual funds\n• Tax saving strategies (80C, NPS)\n• Emergency fund planning\n• Your ₹15L house goal\n• Risk portfolio optimization\n\nWhat would you like to explore?`;
    }

    await ChatHistory.findOneAndUpdate(
      { userId: req.userId },
      { $push: { messages: [{ role: 'user', content: message }, { role: 'assistant', content: reply }] } },
      { upsert: true, new: true }
    );

    res.json({ reply, model: 'mock' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/chat/history
router.get('/history', auth, async (req, res) => {
  try {
    const hist = await ChatHistory.findOne({ userId: req.userId });
    res.json(hist?.messages?.slice(-50) || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
