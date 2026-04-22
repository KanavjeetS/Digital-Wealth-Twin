import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { dashboardAPI, aiAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { StatCard, GlowCard, ProgressBar, Badge, fmt, pct } from '../components/UI';

const TREND = Array.from({ length: 12 }, (_, i) => ({
  m: ['May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr'][i],
  v: 320000 + i * 18500 + (Math.sin(i) * 8000),
}));

const DONUT_COLORS = ['#00D4FF','#8B5CF6','#10B981','#F59E0B'];

const TOOLTIP_STYLE = {
  contentStyle: { background: '#131D30', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#E8F0FE', fontSize: 12 },
  itemStyle: { color: '#E8F0FE' },
  labelStyle: { color: '#94A3B8' },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [intel, setIntel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getSummary()
      .then(r => setData(r.data))
      .catch(() => setData(MOCK_SUMMARY))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    Promise.all([aiAPI.networth({}), aiAPI.profileAnalyze({})])
      .then(([nw, pr]) => setIntel({ nw: nw.data, pr: pr.data }))
      .catch(() => setIntel(null));
  }, []);

  const d = data || MOCK_SUMMARY;
  const nwIntel = intel?.nw;
  const prIntel = intel?.pr;
  const donut = [
    { name: 'SIPs',    value: d.totalInvested * 0.53 || 185000 },
    { name: 'FD',      value: d.totalInvested * 0.35 || 100000 },
    { name: 'Savings', value: 120000 },
    { name: 'Other',   value: 45000 },
  ];

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>
          Good morning, {user?.name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>Here's your wealth snapshot for April 2026</p>
      </motion.div>

      {/* AI intelligence strip (POST /api/ai/networth + profile/analyze) */}
      {(nwIntel || prIntel) && (
        <GlowCard color="#06B6D4" style={{ padding: 22, marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 14, fontFamily: 'Syne, sans-serif' }}>AI financial health</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 20, alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Health score</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#10B981', fontFamily: 'DM Mono, monospace' }}>{nwIntel?.health_score ?? '—'}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>/ 100</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Archetype</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginTop: 4 }}>{prIntel?.archetype || user?.wealthArchetype || '—'}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 6, lineHeight: 1.45 }}>{prIntel?.summary}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Key insights</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--text2)', fontSize: 12, lineHeight: 1.65 }}>
                {(nwIntel?.insights || []).slice(0, 4).map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          </div>
        </GlowCard>
      )}

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Net Worth"     value={fmt(nwIntel?.net_worth ?? d.netWorth ?? 450000)}  sub="+₹18,000 this month"  color="#00D4FF" icon="◈" delay={0} />
        <StatCard label="Monthly Income" value={fmt(d.income || 55000)}   sub="Credited Apr 1"        color="#10B981" icon="↑" delay={0.05} />
        <StatCard label="Savings Rate"  value={`${d.savingsRate || 32}%`} sub="Above 30% target"      color="#8B5CF6" icon="★" delay={0.1} />
        <StatCard label="Goals Progress" value={`${pct(d.totalSaved || 585000, 1950000)}%`} sub="3 active goals" color="#F59E0B" icon="◎" delay={0.15} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <GlowCard color="#00D4FF" style={{ padding: 22 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 18, fontFamily: 'Syne, sans-serif' }}>Net Worth Trend (12M)</div>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={TREND}>
              <defs>
                <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="m" tick={{ fill: '#4B6080', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4B6080', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip {...TOOLTIP_STYLE} formatter={v => [fmt(v), 'Net Worth']} />
              <Line type="monotone" dataKey="v" stroke="#00D4FF" strokeWidth={2.5} dot={false} filter="url(#glow)" />
            </LineChart>
          </ResponsiveContainer>
        </GlowCard>

        <GlowCard color="#8B5CF6" style={{ padding: 22 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 18, fontFamily: 'Syne, sans-serif' }}>Asset Allocation</div>
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie data={donut} cx="45%" cy="50%" innerRadius={52} outerRadius={78} dataKey="value" paddingAngle={4} strokeWidth={0}>
                {donut.map((_, i) => (
                  <Cell key={i} fill={DONUT_COLORS[i]} style={{ filter: `drop-shadow(0 0 6px ${DONUT_COLORS[i]}88)` }} />
                ))}
              </Pie>
              <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ color: 'var(--text2)', fontSize: 11 }}>{v}</span>} />
              <Tooltip {...TOOLTIP_STYLE} formatter={v => [fmt(v)]} />
            </PieChart>
          </ResponsiveContainer>
        </GlowCard>
      </div>

      {/* Goals preview */}
      {d.goals?.length > 0 && (
        <GlowCard color="#10B981" style={{ padding: 22, marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 18, fontFamily: 'Syne, sans-serif' }}>Goal Progress</div>
          <div style={{ display: 'grid', gap: 14 }}>
            {d.goals.slice(0, 3).map((g, i) => {
              const colors = ['#00D4FF', '#10B981', '#F59E0B'];
              const progress = pct(g.currentSaved, g.targetAmount);
              return (
                <div key={g._id || i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{g.name}</span>
                    <span style={{ fontSize: 12, color: colors[i % 3], fontWeight: 700, fontFamily: 'DM Mono, monospace' }}>{progress}%</span>
                  </div>
                  <ProgressBar value={progress} color={colors[i % 3]} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>Saved {fmt(g.currentSaved)}</span>
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>Target {fmt(g.targetAmount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </GlowCard>
      )}

      {/* Recent Transactions */}
      <GlowCard color="#8B5CF6" style={{ padding: 22 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 18, fontFamily: 'Syne, sans-serif' }}>Recent Activity</div>
        {(d.recentTransactions || MOCK_TXS).slice(0, 6).map((t, i) => (
          <motion.div key={t._id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>
                {ICONS[t.category] || '💳'}
              </div>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{t.description}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>
                  {t.date ? new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Apr 2026'}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Badge text={t.category} />
              <span style={{ fontSize: 14, fontWeight: 700, color: t.isExpense ? '#EF4444' : '#10B981', fontFamily: 'DM Mono, monospace', minWidth: 90, textAlign: 'right' }}>
                {t.isExpense ? '−' : '+'}{fmt(t.amount)}
              </span>
            </div>
          </motion.div>
        ))}
      </GlowCard>
    </div>
  );
}

const ICONS = { Investment: '📊', Income: '💰', Food: '🍽️', Housing: '🏠', Entertainment: '🎬', Transport: '🚗', Utilities: '⚡' };

const MOCK_SUMMARY = {
  netWorth: 450000, totalInvested: 320000, totalSaved: 585000, income: 55000, expenses: 37000, savingsRate: 33,
  recentTransactions: [
    { description: 'SIP - Parag Parikh Flexi Cap', amount: 5000, category: 'Investment', isExpense: true },
    { description: 'Salary Credit', amount: 55000, category: 'Income', isExpense: false },
    { description: 'Rent', amount: 18000, category: 'Housing', isExpense: true },
    { description: 'Zomato / Swiggy', amount: 1800, category: 'Food', isExpense: true },
    { description: 'FD Maturity', amount: 25000, category: 'Investment', isExpense: false },
    { description: 'Netflix + Spotify', amount: 999, category: 'Entertainment', isExpense: true },
  ],
  goals: [
    { name: 'House Down Payment', targetAmount: 1500000, currentSaved: 420000 },
    { name: 'Emergency Fund', targetAmount: 300000, currentSaved: 120000 },
    { name: 'Europe Trip', targetAmount: 150000, currentSaved: 45000 },
  ],
};
const MOCK_TXS = MOCK_SUMMARY.recentTransactions;
