import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { aiAPI } from '../utils/api';
import { GlowCard, GlowButton, StatCard, PageHeader, fmt } from '../components/UI';

export default function SimulatorPage() {
  const [params, setParams] = useState({ monthly_amount: 5000, years: 10, annual_rate: 12 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const set = k => v => setParams(p => ({ ...p, [k]: v }));

  const runSim = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await aiAPI.simulate(params);
      setResult(data);
    } catch { setResult(mockSim(params)); }
    finally { setLoading(false); }
  }, [params]);

  useEffect(() => { runSim(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const chartData = result
    ? result.start_now.filter((_, i) => i % 3 === 0).map((d, idx) => {
        const laterIdx = Math.min(idx * 3, result.start_later.length - 1);
        return { month: `M${d.month}`, 'Start Now': d.value, 'Start 1yr Later': result.start_later[laterIdx]?.value || 0 };
      })
    : [];

  const SLIDERS = [
    { key: 'monthly_amount', label: 'Monthly SIP Amount', min: 500, max: 50000, step: 500, format: v => fmt(v) },
    { key: 'years', label: 'Duration', min: 1, max: 30, step: 1, format: v => `${v} years` },
    { key: 'annual_rate', label: 'Expected Returns', min: 6, max: 24, step: 0.5, format: v => `${v}% p.a.` },
  ];

  return (
    <div>
      <PageHeader title="Scenario Simulator" subtitle="Model your wealth with compound growth" />

      {/* Controls */}
      <GlowCard color="#F59E0B" style={{ padding: 28, marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28, marginBottom: 24 }}>
          {SLIDERS.map(s => (
            <div key={s.key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600 }}>{s.label}</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#F59E0B', fontFamily: 'DM Mono, monospace', textShadow: '0 0 16px rgba(245,158,11,0.5)' }}>{s.format(params[s.key])}</span>
              </div>
              <input type="range" min={s.min} max={s.max} step={s.step} value={params[s.key]}
                onChange={e => set(s.key)(+e.target.value)}
                style={{ accentColor: '#F59E0B' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 10, color: 'var(--text3)' }}>{s.format(s.min)}</span>
                <span style={{ fontSize: 10, color: 'var(--text3)' }}>{s.format(s.max)}</span>
              </div>
            </div>
          ))}
        </div>
        <GlowButton onClick={runSim} disabled={loading} variant="cyan" size="lg">
          {loading ? '⟳ Calculating...' : '▶ Run Simulation'}
        </GlowButton>
      </GlowCard>

      {result && (
        <>
          {/* Nudge box */}
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.35)', borderRadius: 14, padding: '16px 22px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 26 }}>⏰</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#F59E0B', fontFamily: 'Syne, sans-serif' }}>{result.summary.nudge_message}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 3 }}>Every year of delay compounds your opportunity cost</div>
            </div>
          </motion.div>

          {/* Chart */}
          <GlowCard color="#00D4FF" style={{ padding: 24, marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 20, fontFamily: 'Syne, sans-serif' }}>Wealth Projection Comparison</div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <defs>
                  <filter id="glow-cyan">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: '#4B6080', fontSize: 11 }} axisLine={false} tickLine={false}
                  interval={Math.max(1, Math.floor(chartData.length / 6))} />
                <YAxis tick={{ fill: '#4B6080', fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `₹${(v / 100000).toFixed(1)}L`} />
                <Tooltip
                  contentStyle={{ background: '#131D30', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#E8F0FE', fontSize: 12 }}
                  formatter={v => [fmt(v)]} />
                <Legend formatter={v => <span style={{ color: 'var(--text2)', fontSize: 12 }}>{v}</span>} />
                <Line type="monotone" dataKey="Start Now" stroke="#00D4FF" strokeWidth={2.5} dot={false} filter="url(#glow-cyan)" />
                <Line type="monotone" dataKey="Start 1yr Later" stroke="#EF4444" strokeWidth={2} dot={false} strokeDasharray="6 3" />
              </LineChart>
            </ResponsiveContainer>
          </GlowCard>

          {/* Summary KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            <StatCard label="Final Value (Now)"   value={fmt(result.summary.final_value_now)}   color="#00D4FF" delay={0} />
            <StatCard label="Final Value (Later)"  value={fmt(result.summary.final_value_later)} color="#EF4444" delay={0.05} />
            <StatCard label="Opportunity Cost"     value={fmt(result.summary.opportunity_cost)}  color="#F59E0B" delay={0.1} />
          </div>
        </>
      )}
    </div>
  );
}

function mockSim({ monthly_amount, years, annual_rate }) {
  const r = annual_rate / 100 / 12, months = years * 12;
  const startNow = Array.from({ length: months + 1 }, (_, m) => ({ month: m, value: m === 0 ? 0 : Math.round(monthly_amount * ((Math.pow(1 + r, m) - 1) / r) * (1 + r)) }));
  const startLater = Array.from({ length: months + 1 }, (_, m) => ({ month: m, value: m < 12 ? 0 : Math.round(monthly_amount * ((Math.pow(1 + r, m - 12) - 1) / r) * (1 + r)) }));
  const fNow = startNow[months].value, fLater = startLater[months].value;
  return { start_now: startNow, start_later: startLater, summary: { final_value_now: fNow, final_value_later: fLater, opportunity_cost: fNow - fLater, nudge_message: `Starting 1 year later costs you ₹${(fNow - fLater).toLocaleString('en-IN')}` } };
}
