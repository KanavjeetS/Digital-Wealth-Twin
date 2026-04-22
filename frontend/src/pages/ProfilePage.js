import { useState } from 'react';
import { motion } from 'framer-motion';
import { userAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { Toggle, GlowCard, GlowButton, PageHeader, fmt } from '../components/UI';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [consent, setConsent]   = useState({ dataSharing:true, nudges:true, riskAlerts:true, twoFactor:true });
  const [form, setForm]         = useState({
    name:        user?.name || '',
    age:         user?.age  || '',
    income:      user?.income || '',
    primaryGoal: user?.primaryGoal || '',
    riskAppetite:user?.riskAppetite || 'medium',
    currentSavings: user?.currentSavings || '',
  });
  const set = k => e => setForm(f => ({...f, [k]: e.target.value}));

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await userAPI.updateProfile({ ...form, age:+form.age, income:+form.income, currentSavings:+form.currentSavings });
      updateUser(data);
      setEditing(false);
      toast.success('Profile updated!');
    } catch {
      // Optimistic update on fail (demo mode)
      updateUser({ ...form, age:+form.age, income:+form.income });
      setEditing(false);
      toast.success('Profile updated (demo mode)');
    } finally { setSaving(false); }
  };

  const ARCHETYPE_COLOR = { 'Conservative Builder':'#00D4FF', 'Aggressive Investor':'#EF4444', 'Balanced Planner':'#10B981', 'Goal-Driven Saver':'#F59E0B' };
  const archColor = ARCHETYPE_COLOR[user?.wealthArchetype] || '#8B5CF6';

  return (
    <div>
      <PageHeader title="Profile & Settings" subtitle="Manage your account, privacy and preferences" />

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

        {/* ── Profile Card ── */}
        <GlowCard color="#8B5CF6" style={{ padding:28 }}>
          {/* Avatar */}
          <div style={{ display:'flex', alignItems:'center', gap:18, marginBottom:24 }}>
            <div style={{ width:66, height:66, borderRadius:'50%', background:'linear-gradient(135deg,#8B5CF6,#EC4899)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, fontWeight:800, color:'#fff', boxShadow:'0 0 28px rgba(139,92,246,0.55)', flexShrink:0 }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div style={{ fontSize:19, fontWeight:800, color:'var(--text)', fontFamily:'Syne, sans-serif' }}>{user?.name || 'User'}</div>
              <div style={{ fontSize:12, color:'var(--text3)', marginTop:2 }}>{user?.email || '—'}</div>
              <span style={{ display:'inline-block', marginTop:7, background:`${archColor}18`, color:archColor, border:`1px solid ${archColor}33`, padding:'3px 12px', borderRadius:20, fontSize:11, fontWeight:600 }}>
                🏗 {user?.wealthArchetype || 'Conservative Builder'}
              </span>
            </div>
          </div>

          {/* Fields */}
          {editing ? (
            <div style={{ display:'grid', gap:13 }}>
              {[
                { k:'name',          label:'Full Name',              type:'text'   },
                { k:'age',           label:'Age',                    type:'number' },
                { k:'income',        label:'Monthly Income (₹)',     type:'number' },
                { k:'currentSavings',label:'Current Savings (₹)',    type:'number' },
                { k:'primaryGoal',   label:'Primary Goal',           type:'text'   },
              ].map(f => (
                <div key={f.k}>
                  <label style={{ fontSize:11, color:'var(--text2)', textTransform:'uppercase', letterSpacing:0.8, fontWeight:600, display:'block', marginBottom:5 }}>{f.label}</label>
                  <input type={f.type} value={form[f.k]} onChange={set(f.k)} className="input" />
                </div>
              ))}
              <div>
                <label style={{ fontSize:11, color:'var(--text2)', textTransform:'uppercase', letterSpacing:0.8, fontWeight:600, display:'block', marginBottom:5 }}>Risk Appetite</label>
                <select value={form.riskAppetite} onChange={set('riskAppetite')} className="input">
                  <option value="low">Low — Capital Preservation</option>
                  <option value="medium">Medium — Balanced Growth</option>
                  <option value="high">High — Aggressive Growth</option>
                </select>
              </div>
              <div style={{ display:'flex', gap:10, marginTop:4 }}>
                <GlowButton onClick={save} disabled={saving} variant="cyan" size="sm">{saving ? 'Saving...' : 'Save Changes'}</GlowButton>
                <GlowButton onClick={() => setEditing(false)} variant="ghost" size="sm">Cancel</GlowButton>
              </div>
            </div>
          ) : (
            <>
              {[
                ['Age',             `${user?.age || '—'} years`],
                ['Monthly Income',  fmt(user?.income || 0)],
                ['Risk Appetite',   (user?.riskAppetite || 'medium').charAt(0).toUpperCase() + (user?.riskAppetite || 'medium').slice(1)],
                ['Primary Goal',    user?.primaryGoal || '—'],
                ['Current Savings', fmt(user?.currentSavings || 0)],
              ].map(([k, v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize:13, color:'var(--text3)' }}>{k}</span>
                  <span style={{ fontSize:13, color:'var(--text)', fontWeight:500, fontFamily: k.includes('Income') || k.includes('Savings') ? 'DM Mono, monospace' : 'inherit' }}>{v}</span>
                </div>
              ))}
              <GlowButton onClick={() => setEditing(true)} variant="ghost" size="sm" style={{ marginTop:18 }}>✏ Edit Profile</GlowButton>
            </>
          )}
        </GlowCard>

        {/* ── Right column ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Privacy & Consent */}
          <GlowCard color="#00D4FF" style={{ padding:22 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:16, fontFamily:'Syne, sans-serif' }}>Privacy & Consent</div>
            {[
              { k:'dataSharing', label:'Data Sharing', sub:'Share anonymised data for better AI insights' },
              { k:'nudges',      label:'Smart Nudges',  sub:'Receive proactive wealth recommendations'   },
              { k:'riskAlerts',  label:'Risk Alerts',   sub:'Real-time fraud and anomaly notifications'  },
              { k:'twoFactor',   label:'Two-Factor Auth',sub:'Require OTP for large transactions'        },
            ].map(({ k, label, sub }) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ fontSize:13, color:'var(--text)', fontWeight:500 }}>{label}</div>
                  <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{sub}</div>
                </div>
                <Toggle value={consent[k]} onChange={val => setConsent(c => ({...c,[k]:val}))} color="#00D4FF" />
              </div>
            ))}
          </GlowCard>

          {/* Security */}
          <GlowCard color="#10B981" style={{ padding:22 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:16, fontFamily:'Syne, sans-serif' }}>Security</div>
            {[
              ['Device ID',    user?.deviceId || 'DEV-2A9F7C',            true ],
              ['Session',      'Active · JWT valid 7 days',               false],
              ['Last Login',   'Apr 22, 2026 · 09:14 AM',                false],
              ['2FA Status',   consent.twoFactor ? '✅ Enabled' : '❌ Off',false],
            ].map(([k, v, mono]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize:12, color:'var(--text3)' }}>{k}</span>
                <span style={{ fontSize:12, color:'var(--text)', fontFamily: mono ? 'DM Mono, monospace' : 'inherit', letterSpacing: mono ? 0.5 : 0 }}>{v}</span>
              </div>
            ))}
          </GlowCard>

          {/* Danger zone */}
          <GlowCard color="#EF4444" style={{ padding:22, border:'1px solid rgba(239,68,68,0.2)' }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#EF4444', marginBottom:10, fontFamily:'Syne, sans-serif' }}>Danger Zone</div>
            <p style={{ fontSize:12, color:'var(--text3)', marginBottom:14, lineHeight:1.6 }}>These actions are irreversible. Make sure you want to proceed.</p>
            <GlowButton variant="ghost" size="sm" style={{ color:'#EF4444', borderColor:'rgba(239,68,68,0.3)' }}
              onClick={() => toast.error('Not implemented in demo')}>
              🗑 Delete Account
            </GlowButton>
          </GlowCard>
        </div>
      </div>
    </div>
  );
}
