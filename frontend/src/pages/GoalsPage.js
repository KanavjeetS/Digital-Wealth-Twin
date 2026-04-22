// ════════════════════════════════════════════════════════════════════════════
// GoalsPage.js
// ════════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { goalAPI } from '../utils/api';
import { GlowCard, GlowButton, ProgressBar, PageHeader, fmt, pct } from '../components/UI';
import toast from 'react-hot-toast';

export function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', targetAmount: '', currentSaved: '', monthlyTarget: '', deadline: '' });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const COLORS = ['#00D4FF', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#F97316'];

  useEffect(() => {
    goalAPI.getAll()
      .then(r => setGoals(r.data))
      .catch(() => setGoals(MOCK_GOALS));
  }, []);

  const addGoal = async () => {
    if (!form.name || !form.targetAmount) return toast.error('Name and target amount required');
    try {
      const { data } = await goalAPI.create({ ...form, targetAmount: +form.targetAmount, currentSaved: +form.currentSaved || 0, monthlyTarget: +form.monthlyTarget || 0 });
      setGoals(g => [...g, data]);
      setForm({ name: '', targetAmount: '', currentSaved: '', monthlyTarget: '', deadline: '' });
      setShowAdd(false);
      toast.success('Goal created!');
    } catch {
      toast.error('Failed to create goal');
    }
  };

  const deleteGoal = async (id) => {
    try {
      await goalAPI.delete(id);
      setGoals(g => g.filter(x => x._id !== id));
      toast.success('Goal removed');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <PageHeader title="Financial Goals" subtitle="Track your wealth milestones"
        action={<GlowButton onClick={() => setShowAdd(s => !s)} variant="cyan">+ New Goal</GlowButton>} />

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <GlowCard color="#00D4FF" style={{ padding: 24, marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 16, fontFamily: 'Syne, sans-serif' }}>New Financial Goal</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                {[
                  { k: 'name', label: 'Goal Name', type: 'text', placeholder: 'House Down Payment' },
                  { k: 'targetAmount', label: 'Target Amount (₹)', type: 'number', placeholder: '1500000' },
                  { k: 'currentSaved', label: 'Already Saved (₹)', type: 'number', placeholder: '0' },
                  { k: 'monthlyTarget', label: 'Monthly Contribution (₹)', type: 'number', placeholder: '10000' },
                  { k: 'deadline', label: 'Target Date', type: 'date', placeholder: '' },
                ].map(f => (
                  <div key={f.k}>
                    <label style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600, display: 'block', marginBottom: 6 }}>{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder} value={form[f.k]} onChange={set(f.k)} className="input" />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <GlowButton onClick={addGoal} variant="cyan">Save Goal</GlowButton>
                <GlowButton onClick={() => setShowAdd(false)} variant="ghost">Cancel</GlowButton>
              </div>
            </GlowCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'grid', gap: 16 }}>
        {goals.map((g, i) => {
          const progress = pct(g.currentSaved, g.targetAmount);
          const color = COLORS[i % COLORS.length];
          const months = g.monthlyTarget > 0 ? Math.ceil((g.targetAmount - g.currentSaved) / g.monthlyTarget) : '—';
          return (
            <GlowCard key={g._id || i} color={color} style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{g.name}</h3>
                  {g.deadline && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>Target: {new Date(g.deadline).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 30, fontWeight: 900, color, fontFamily: 'DM Mono, monospace', textShadow: `0 0 20px ${color}66`, lineHeight: 1 }}>{progress}%</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>complete</div>
                  </div>
                  <button onClick={() => deleteGoal(g._id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#EF4444', cursor: 'pointer', padding: '6px 8px', fontSize: 12 }}>✕</button>
                </div>
              </div>
              <ProgressBar value={progress} color={color} height={8} />
              <div style={{ display: 'flex', gap: 20, marginTop: 12, flexWrap: 'wrap' }}>
                {[
                  ['Saved', fmt(g.currentSaved), color],
                  ['Remaining', fmt(g.targetAmount - g.currentSaved), 'var(--text2)'],
                  ['Monthly', fmt(g.monthlyTarget), '#F59E0B'],
                  ['Months left', typeof months === 'number' ? months : '—', '#8B5CF6'],
                ].map(([label, val, c]) => (
                  <div key={label}>
                    <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: c, fontFamily: 'DM Mono, monospace', marginTop: 2 }}>{val}</div>
                  </div>
                ))}
              </div>
            </GlowCard>
          );
        })}
      </div>
    </div>
  );
}

const MOCK_GOALS = [
  { _id: '1', name: 'House Down Payment', targetAmount: 1500000, currentSaved: 420000, monthlyTarget: 12500, deadline: '2033-01-01' },
  { _id: '2', name: 'Emergency Fund', targetAmount: 300000, currentSaved: 120000, monthlyTarget: 7500, deadline: '2027-01-01' },
  { _id: '3', name: 'Europe Trip', targetAmount: 150000, currentSaved: 45000, monthlyTarget: 5000, deadline: '2027-06-01' },
];

export default GoalsPage;
