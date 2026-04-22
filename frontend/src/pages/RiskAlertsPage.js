import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { riskAPI } from '../utils/api';
import { RiskShield, Badge, GlowCard, PageHeader, StatCard, fmt } from '../components/UI';

const MOCK_ALERTS = [
  { _id:'1', actionType:'SIP_START',        amount:200000, riskScore:55, level:'MEDIUM', decision:'WARN',  reason:'New device detected. Amount is 3x your usual pattern. Login was 45 seconds before action.', createdAt:'2026-04-20T10:23:00Z', signals:['new_device_detected','rapid_action_after_login','amount_exceeds_2.5x_average'] },
  { _id:'2', actionType:'PORTFOLIO_CHANGE', amount:50000,  riskScore:22, level:'LOW',    decision:'ALLOW', reason:'Normal activity pattern detected. All device, timing and amount signals are clean.', createdAt:'2026-04-18T14:10:00Z', signals:['device_check'] },
  { _id:'3', actionType:'LARGE_WITHDRAWAL', amount:500000, riskScore:88, level:'HIGH',   decision:'BLOCK', reason:'Unusual withdrawal within 45 seconds of login from an unknown device. Amount is 25x your average.', createdAt:'2026-04-15T08:55:00Z', signals:['new_device_detected','rapid_action_after_login','large_transaction','amount_exceeds_2.5x_average'] },
];

const LEVEL_CFG = {
  LOW:    { color:'#10B981', bg:'rgba(16,185,129,0.08)',  border:'rgba(16,185,129,0.25)' },
  MEDIUM: { color:'#F59E0B', bg:'rgba(245,158,11,0.08)',  border:'rgba(245,158,11,0.25)' },
  HIGH:   { color:'#EF4444', bg:'rgba(239,68,68,0.08)',   border:'rgba(239,68,68,0.3)'  },
};

function SignalPill({ text }) {
  return (
    <span style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:20, padding:'2px 10px', fontSize:10, color:'var(--text3)', letterSpacing:0.4 }}>
      {text.replace(/_/g, ' ')}
    </span>
  );
}

export default function RiskAlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    riskAPI.history()
      .then(r => setAlerts(r.data?.length ? r.data : MOCK_ALERTS))
      .catch(() => setAlerts(MOCK_ALERTS))
      .finally(() => setLoading(false));
  }, []);

  const counts = { HIGH: alerts.filter(a => a.level==='HIGH').length, MEDIUM: alerts.filter(a => a.level==='MEDIUM').length, LOW: alerts.filter(a => a.level==='LOW').length };

  return (
    <div>
      <PageHeader title="Risk Alert History" subtitle="Cyber-fraud protection log — every flagged event recorded" />

      {/* Summary row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:28 }}>
        <StatCard label="High Risk Events"   value={counts.HIGH}   color="#EF4444" icon="🔴" delay={0} />
        <StatCard label="Medium Risk Events" value={counts.MEDIUM} color="#F59E0B" icon="🟡" delay={0.05} />
        <StatCard label="Allowed Events"     value={counts.LOW}    color="#10B981" icon="🟢" delay={0.1} />
      </div>

      {/* Alert cards */}
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        {alerts.map((a, i) => {
          const cfg = LEVEL_CFG[a.level] || LEVEL_CFG.LOW;
          return (
            <motion.div key={a._id || i} initial={{ opacity:0, x:-14 }} animate={{ opacity:1, x:0 }} transition={{ delay: i * 0.07 }}>
              <div style={{ background: cfg.bg, border:`1px solid ${cfg.border}`, borderRadius:16, padding:22, position:'relative', overflow:'hidden' }}>
                {/* Top glow line */}
                <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg, transparent, ${cfg.color}, transparent)`, opacity:0.6 }} />

                {/* Header row */}
                <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:14 }}>
                  <RiskShield level={a.level} size={36} showLabel />
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:4 }}>
                      <span style={{ fontSize:15, fontWeight:700, color:'var(--text)', fontFamily:'Syne, sans-serif' }}>
                        {(a.actionType || '').replace(/_/g,' ')}
                      </span>
                      <Badge text={a.decision} />
                    </div>
                    <div style={{ fontSize:11, color:'var(--text3)' }}>
                      {a.createdAt ? new Date(a.createdAt).toLocaleString('en-IN',{ day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit' }) : 'Apr 2026'} &nbsp;·&nbsp; {fmt(a.amount || 0)}
                    </div>
                  </div>
                  {/* Score dial */}
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontSize:36, fontWeight:900, fontFamily:'DM Mono, monospace', color:cfg.color, textShadow:`0 0 24px ${cfg.color}66`, lineHeight:1 }}>
                      {a.riskScore}
                    </div>
                    <div style={{ fontSize:9, color:'var(--text3)', textTransform:'uppercase', letterSpacing:1, marginTop:2 }}>Risk Score</div>
                  </div>
                </div>

                {/* Reason box */}
                <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:10, padding:'11px 14px', fontSize:13, color:'var(--text2)', lineHeight:1.6, marginBottom: a.signals?.length ? 12 : 0 }}>
                  🛡 {a.reason}
                </div>

                {/* Signals */}
                {a.signals?.length > 0 && (
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:10 }}>
                    {a.signals.map(s => <SignalPill key={s} text={s} />)}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
        {alerts.length === 0 && (
          <div style={{ textAlign:'center', padding:60, color:'var(--text3)', fontSize:15 }}>
            🛡 No risk events recorded yet. All your transactions have been clean.
          </div>
        )}
      </div>
    </div>
  );
}
