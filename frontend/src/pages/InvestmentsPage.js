import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { investmentAPI, riskAPI } from '../utils/api';
import { GlowCard, GlowButton, RiskShield, Badge, PageHeader, fmt } from '../components/UI';
import toast from 'react-hot-toast';

const TYPE_ICONS = { SIP: '📊', FD: '🏦', Stock: '📈', MF: '💹', Other: '💼' };
const TYPE_COLORS = { SIP: '#00D4FF', FD: '#10B981', Stock: '#F59E0B', MF: '#8B5CF6', Other: '#94A3B8' };

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState([]);
  const [riskResult, setRiskResult] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ type: 'SIP', name: '', amount: '', isNewDevice: false });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target?.value ?? e }));

  useEffect(() => {
    investmentAPI.getAll()
      .then(r => setInvestments(r.data))
      .catch(() => setInvestments(MOCK_INV));
  }, []);

  const handleAdd = async () => {
    if (!form.name || !form.amount) return toast.error('Name and amount required');
    setLoading(true);
    try {
      const risk = await riskAPI.check({
        action_type: 'SIP_START',
        amount: +form.amount,
        avg_amount: 5000,
        is_new_device: form.isNewDevice,
        seconds_since_login: 120,
        is_first_investment_type: false,
        otp_retry_count: 0,
      });
      setRiskResult(risk.data);
      if (risk.data.decision !== 'BLOCK') {
        const { data } = await investmentAPI.create({ type: form.type, name: form.name, amount: +form.amount });
        setInvestments(i => [...i, data]);
        setForm({ type: 'SIP', name: '', amount: '', isNewDevice: false });
        setShowAdd(false);
        toast.success('Investment added!');
      } else {
        toast.error('Transaction blocked by Risk Engine');
      }
    } catch {
      toast.error('Failed to add investment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Investments" subtitle="Manage your SIPs, FDs and stocks"
        action={<GlowButton onClick={() => { setShowAdd(s => !s); setRiskResult(null); }} variant="cyan">+ Add Investment</GlowButton>} />

      {/* Risk Banner */}
      <AnimatePresence>
        {riskResult && riskResult.decision !== 'ALLOW' && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginBottom: 20 }}>
            {riskResult.decision === 'WARN' && (
              <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <RiskShield level="MEDIUM" size={32} />
                <div>
                  <div style={{ color: '#F59E0B', fontWeight: 700, fontSize: 14 }}>Risk Warning — Score: {riskResult.risk_score}</div>
                  <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 3 }}>{riskResult.reason}</div>
                </div>
                <button onClick={() => setRiskResult(null)} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 18 }}>✕</button>
              </div>
            )}
            {riskResult.decision === 'BLOCK' && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 14, padding: '24px', textAlign: 'center' }}>
                <RiskShield level="HIGH" size={44} />
                <div style={{ color: '#EF4444', fontWeight: 800, fontSize: 18, marginTop: 12, fontFamily: 'Syne, sans-serif' }}>Transaction Blocked</div>
                <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 6, maxWidth: 400, margin: '6px auto 0' }}>{riskResult.reason}</div>
                <GlowButton onClick={() => setRiskResult(null)} variant="ghost" style={{ marginTop: 16 }}>Dismiss</GlowButton>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <GlowCard color="#8B5CF6" style={{ padding: 24, marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 16, fontFamily: 'Syne, sans-serif' }}>New Investment</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600, display: 'block', marginBottom: 6 }}>Type</label>
                  <select value={form.type} onChange={set('type')} className="input">
                    {['SIP','FD','Stock','MF','Other'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600, display: 'block', marginBottom: 6 }}>Fund / Name</label>
                  <input value={form.name} onChange={set('name')} placeholder="Parag Parikh Flexi Cap" className="input" />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600, display: 'block', marginBottom: 6 }}>Amount (₹)</label>
                  <input type="number" value={form.amount} onChange={set('amount')} placeholder="5000" className="input" />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text2)' }}>
                  <input type="checkbox" checked={form.isNewDevice} onChange={e => setForm(f => ({ ...f, isNewDevice: e.target.checked }))} />
                  Simulate new device (test risk engine)
                </label>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <GlowButton onClick={handleAdd} disabled={loading} variant="cyan">{loading ? 'Risk checking...' : '🛡 Add & Risk Check'}</GlowButton>
                <GlowButton onClick={() => setShowAdd(false)} variant="ghost">Cancel</GlowButton>
              </div>
            </GlowCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Investment list */}
      <div style={{ display: 'grid', gap: 12 }}>
        {investments.map((inv, i) => {
          const color = TYPE_COLORS[inv.type] || '#94A3B8';
          return (
            <motion.div key={inv._id || i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <GlowCard color={color} style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }} animate={false}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, boxShadow: `0 0 16px ${color}22` }}>
                  {TYPE_ICONS[inv.type] || '💼'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{inv.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                    Started {inv.startDate ? new Date(inv.startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Apr 2024'} · <Badge text={inv.type} />
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: 'DM Mono, monospace', textShadow: `0 0 16px ${color}55` }}>
                    {fmt(inv.amount)}<span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 400 }}>{inv.type === 'SIP' ? '/mo' : ''}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#10B981', marginTop: 3 }}>▲ {inv.returns || 12}% returns</div>
                </div>
                <Badge text={inv.status || 'Active'} />
              </GlowCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

const MOCK_INV = [
  { _id:'1', type:'SIP', name:'Parag Parikh Flexi Cap', amount:5000, startDate:'2024-01-01', status:'Active', returns:14.2 },
  { _id:'2', type:'FD',  name:'SBI Fixed Deposit 3Yr', amount:100000, startDate:'2023-06-01', status:'Active', returns:7.1 },
  { _id:'3', type:'SIP', name:'HDFC Mid Cap Opportunities', amount:3000, startDate:'2024-03-01', status:'Active', returns:16.8 },
];
