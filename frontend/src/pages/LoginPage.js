import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // login | register
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', age: '', income: '', riskAppetite: 'medium', primaryGoal: '', currentSavings: '' });
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.email || !form.password) return toast.error('Email and password required');
    if (mode === 'register' && !form.name) return toast.error('Name required');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back!');
      } else {
        await register({ ...form, age: +form.age || 25, income: +form.income || 0, currentSavings: +form.currentSavings || 0 });
        toast.success('Account created! Welcome to SecureWealth.');
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const fields = mode === 'login'
    ? [
        { key: 'email', label: 'Email', type: 'email', placeholder: 'priya@example.com' },
        { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
      ]
    : [
        { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Priya Sharma' },
        { key: 'email', label: 'Email', type: 'email', placeholder: 'priya@example.com' },
        { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
        { key: 'age', label: 'Age', type: 'number', placeholder: '28' },
        { key: 'income', label: 'Monthly Income (₹)', type: 'number', placeholder: '55000' },
        { key: 'currentSavings', label: 'Current Savings (₹)', type: 'number', placeholder: '120000' },
        { key: 'primaryGoal', label: 'Primary Goal', type: 'text', placeholder: 'Buy a house in 7 years' },
      ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24, position: 'relative', overflow: 'hidden' }}>
      {/* Ambient orbs */}
      <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)', animation: 'float 8s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', animation: 'float 10s ease-in-out infinite reverse' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.2, 0.64, 1] }}
        style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <motion.div whileHover={{ scale: 1.05 }} style={{ display: 'inline-flex', width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #00D4FF, #0066CC)', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, color: '#000', boxShadow: '0 0 40px rgba(0,212,255,0.5)', marginBottom: 16 }}>
            S
          </motion.div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>SecureWealth Twin</h1>
          <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 6 }}>AI-Powered Digital Wealth Intelligence</p>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(19,29,48,0.8)', backdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 24, padding: '32px 32px', boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset' }}>
          {/* Tab */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 4, marginBottom: 28 }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s', background: mode === m ? 'linear-gradient(135deg, #00D4FF, #0066CC)' : 'transparent', color: mode === m ? '#000' : 'var(--text2)', boxShadow: mode === m ? '0 4px 15px rgba(0,212,255,0.3)' : 'none' }}>
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Fields */}
          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity: 0, x: mode === 'register' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div style={{ display: 'grid', gap: 16 }}>
                {fields.map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600, display: 'block', marginBottom: 6 }}>{f.label}</label>
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      value={form[f.key]}
                      onChange={set(f.key)}
                      onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                      className="input"
                    />
                  </div>
                ))}

                {mode === 'register' && (
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600, display: 'block', marginBottom: 6 }}>Risk Appetite</label>
                    <select value={form.riskAppetite} onChange={set('riskAppetite')} className="input">
                      <option value="low">Low — Capital preservation</option>
                      <option value="medium">Medium — Balanced growth</option>
                      <option value="high">High — Aggressive growth</option>
                    </select>
                  </div>
                )}
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01 }}
                onClick={handleSubmit}
                disabled={loading}
                style={{ marginTop: 24, width: '100%', padding: '13px', border: 'none', borderRadius: 12, background: 'linear-gradient(135deg, #00D4FF, #0066CC)', color: '#000', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 6px 30px rgba(0,212,255,0.4)', fontFamily: 'Syne, sans-serif' }}
              >
                {loading ? '...' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 11, marginTop: 20 }}>
          PSBs Hackathon 2026 · Cyber Security & Fraud in Wealth Management
        </p>
      </motion.div>
    </div>
  );
}
