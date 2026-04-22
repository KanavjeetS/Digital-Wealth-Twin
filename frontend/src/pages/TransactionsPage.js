import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { transactionAPI } from '../utils/api';
import { Badge, GlowCard, PageHeader, fmt } from '../components/UI';

const ICONS = { Investment:'📊', Income:'💰', Food:'🍽️', Housing:'🏠', Entertainment:'🎬', Transport:'🚗', Utilities:'⚡', Other:'💳' };
const CATS = ['All','Investment','Income','Food','Housing','Entertainment','Transport','Utilities'];
const MOCK_TXS = [
  { description:'SIP - Parag Parikh Flexi Cap', amount:5000, category:'Investment', isExpense:true,  date:'2026-04-20' },
  { description:'Salary Credit',                amount:55000,category:'Income',     isExpense:false, date:'2026-04-01' },
  { description:'Rent',                         amount:18000,category:'Housing',    isExpense:true,  date:'2026-04-05' },
  { description:'Zomato / Swiggy',              amount:1800, category:'Food',       isExpense:true,  date:'2026-04-18' },
  { description:'FD Maturity',                  amount:25000,category:'Investment', isExpense:false, date:'2026-04-15' },
  { description:'Netflix + Spotify',            amount:999,  category:'Entertainment',isExpense:true,date:'2026-04-10' },
  { description:'Petrol / Commute',             amount:2200, category:'Transport',  isExpense:true,  date:'2026-04-12' },
  { description:'Electricity Bill',             amount:1100, category:'Utilities',  isExpense:true,  date:'2026-04-08' },
  { description:'SIP - HDFC Mid Cap',           amount:3000, category:'Investment', isExpense:true,  date:'2026-04-01' },
  { description:'Freelance Income',             amount:18000,category:'Income',     isExpense:false, date:'2026-04-14' },
];

export default function TransactionsPage() {
  const [txs, setTxs]       = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ description:'', amount:'', category:'Food', isExpense:true });

  useEffect(() => {
    transactionAPI.getAll()
      .then(r => setTxs(r.data))
      .catch(() => setTxs(MOCK_TXS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'All' ? txs : txs.filter(t => t.category === filter);

  const totalIncome  = txs.filter(t => !t.isExpense).reduce((s,t) => s + t.amount, 0);
  const totalExpense = txs.filter(t => t.isExpense).reduce((s,t) => s + t.amount, 0);

  const addTx = async () => {
    if (!form.description || !form.amount) return;
    try {
      const { data } = await transactionAPI.create({ ...form, amount: +form.amount });
      setTxs(t => [data, ...t]);
    } catch {
      setTxs(t => [{ ...form, amount: +form.amount, _id: Date.now(), date: new Date().toISOString() }, ...t]);
    }
    setForm({ description:'', amount:'', category:'Food', isExpense:true });
    setShowAdd(false);
  };

  return (
    <div>
      <PageHeader
        title="Transaction History"
        subtitle="All your financial activity in one place"
        action={
          <button onClick={() => setShowAdd(s => !s)} style={{ background:'linear-gradient(135deg,#00D4FF,#0066CC)', color:'#000', border:'none', borderRadius:10, padding:'9px 18px', cursor:'pointer', fontWeight:700, fontSize:13, boxShadow:'0 4px 20px rgba(0,212,255,0.35)' }}>
            + Add Transaction
          </button>
        }
      />

      {/* Summary pills */}
      <div style={{ display:'flex', gap:12, marginBottom:20 }}>
        {[
          { label:'Total Income',   value: fmt(totalIncome),  color:'#10B981' },
          { label:'Total Expenses', value: fmt(totalExpense), color:'#EF4444' },
          { label:'Net',            value: fmt(totalIncome - totalExpense), color: totalIncome >= totalExpense ? '#10B981' : '#EF4444' },
        ].map(s => (
          <div key={s.label} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'12px 20px', display:'flex', gap:10, alignItems:'center' }}>
            <span style={{ fontSize:11, color:'var(--text3)', textTransform:'uppercase', letterSpacing:0.8 }}>{s.label}</span>
            <span style={{ fontSize:16, fontWeight:800, color:s.color, fontFamily:'DM Mono, monospace' }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showAdd && (
        <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}>
          <div style={{ background:'rgba(0,212,255,0.05)', border:'1px solid rgba(0,212,255,0.25)', borderRadius:14, padding:22, marginBottom:20 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr auto', gap:12, alignItems:'end' }}>
              <div>
                <label style={{ fontSize:11, color:'var(--text2)', textTransform:'uppercase', letterSpacing:0.8, fontWeight:600, display:'block', marginBottom:5 }}>Description</label>
                <input value={form.description} onChange={e => setForm(f => ({...f, description:e.target.value}))} placeholder="Salary Credit" className="input" />
              </div>
              <div>
                <label style={{ fontSize:11, color:'var(--text2)', textTransform:'uppercase', letterSpacing:0.8, fontWeight:600, display:'block', marginBottom:5 }}>Amount (₹)</label>
                <input type="number" value={form.amount} onChange={e => setForm(f => ({...f, amount:e.target.value}))} placeholder="5000" className="input" />
              </div>
              <div>
                <label style={{ fontSize:11, color:'var(--text2)', textTransform:'uppercase', letterSpacing:0.8, fontWeight:600, display:'block', marginBottom:5 }}>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({...f, category:e.target.value}))} className="input">
                  {CATS.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                <label style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', fontSize:12, color:'var(--text2)' }}>
                  <input type="checkbox" checked={!form.isExpense} onChange={e => setForm(f => ({...f, isExpense:!e.target.checked}))} />
                  Income?
                </label>
                <button onClick={addTx} style={{ background:'linear-gradient(135deg,#00D4FF,#0066CC)', color:'#000', border:'none', borderRadius:9, padding:'9px 14px', cursor:'pointer', fontWeight:700, fontSize:13 }}>Add</button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Category filters */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{ background: filter === c ? 'linear-gradient(135deg,#00D4FF,#0066CC)' : 'rgba(255,255,255,0.04)', color: filter === c ? '#000' : 'var(--text2)', border:`1px solid ${filter === c ? 'transparent' : 'rgba(255,255,255,0.07)'}`, borderRadius:20, padding:'5px 16px', cursor:'pointer', fontSize:12, fontWeight:600, transition:'all 0.2s', boxShadow: filter === c ? '0 4px 15px rgba(0,212,255,0.3)' : 'none' }}>
            {c}
          </button>
        ))}
      </div>

      {/* Table */}
      <GlowCard color="#A78BFA" style={{ overflow:'hidden', padding:0 }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:'rgba(255,255,255,0.03)' }}>
              {['Description','Category','Date','Amount'].map(h => (
                <th key={h} style={{ padding:'14px 20px', textAlign:'left', fontSize:10, color:'var(--text3)', textTransform:'uppercase', letterSpacing:1, fontWeight:600, borderBottom:'1px solid rgba(255,255,255,0.05)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => (
              <motion.tr key={t._id || i} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay: i * 0.025 }}
                style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', cursor:'default', transition:'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding:'13px 20px', color:'var(--text)', fontSize:13 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:17 }}>{ICONS[t.category] || '💳'}</span>
                    {t.description}
                  </div>
                </td>
                <td style={{ padding:'13px 20px' }}><Badge text={t.category} /></td>
                <td style={{ padding:'13px 20px', color:'var(--text3)', fontSize:12 }}>
                  {t.date ? new Date(t.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : 'Apr 2026'}
                </td>
                <td style={{ padding:'13px 20px', fontSize:14, fontWeight:700, color: t.isExpense ? '#EF4444' : '#10B981', fontFamily:'DM Mono, monospace' }}>
                  {t.isExpense ? '−' : '+'}{fmt(t.amount)}
                </td>
              </motion.tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} style={{ padding:'40px', textAlign:'center', color:'var(--text3)', fontSize:14 }}>No transactions found</td></tr>
            )}
          </tbody>
        </table>
      </GlowCard>
    </div>
  );
}
