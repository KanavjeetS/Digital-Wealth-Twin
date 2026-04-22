import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { aiAPI } from '../utils/api';
import { GlowCard, PageHeader, StatCard, fmt } from '../components/UI';

const COLORS = ['#00D4FF', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899'];

export default function AggregatorPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    aiAPI.aggregate({})
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const dist = data?.distribution || [];

  return (
    <div>
      <PageHeader title="Multi-bank view" subtitle="Balances, distribution, and AI insights (POST /api/ai/aggregate)" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total balance" value={fmt(data?.total_balance || 0)} sub="Linked accounts (demo)" color="#00D4FF" delay={0} />
        <StatCard label="Banks linked" value={`${data?.banks?.length || 0}`} sub="Read-only aggregation" color="#8B5CF6" delay={0.05} />
        <StatCard label="Idle cash signal" value={data?.total_balance > 400000 ? 'Review' : 'OK'} sub="Liquid vs invested" color="#F59E0B" delay={0.1} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 16 }}>
        <GlowCard color="#00D4FF" style={{ padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 18, fontFamily: 'Syne, sans-serif' }}>Balance by bank</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(data?.banks || []).map((b, i) => (
              <motion.div key={b.id || i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{b.name}</span>
                <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, color: '#00D4FF' }}>{fmt(b.balance)}</span>
              </motion.div>
            ))}
            {loading && <div style={{ color: 'var(--text3)', fontSize: 13 }}>Loading…</div>}
            {!loading && !(data?.banks?.length) && <div style={{ color: 'var(--text3)', fontSize: 13 }}>No data — check API.</div>}
          </div>
        </GlowCard>

        <GlowCard color="#8B5CF6" style={{ padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 18, fontFamily: 'Syne, sans-serif' }}>Distribution</div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dist} cx="50%" cy="50%" innerRadius={58} outerRadius={88} dataKey="value" paddingAngle={3}>
                  {dist.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: '#131D30', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }} />
                <Legend formatter={(v) => <span style={{ color: 'var(--text2)', fontSize: 11 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlowCard>
      </div>

      <GlowCard color="#10B981" style={{ padding: 22, marginTop: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, fontFamily: 'Syne, sans-serif' }}>Insights</div>
        <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--text2)', fontSize: 13, lineHeight: 1.7 }}>
          {(data?.insights || ['Connect your Python service at port 8000 for live bank feeds.']).map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </GlowCard>
    </div>
  );
}
