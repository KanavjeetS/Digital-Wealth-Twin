import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlowCard, GlowButton } from '../components/UI';
import { useAuth } from '../hooks/useAuth';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:24, position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'-10%', left:'-5%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)', animation:'float 8s ease-in-out infinite' }} />
      <div style={{ position:'absolute', bottom:'-15%', right:'-5%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)', animation:'float 10s ease-in-out infinite reverse' }} />

      <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.5, ease:[0.34,1.2,0.64,1] }} style={{ maxWidth:500, width:'100%', textAlign:'center', position:'relative', zIndex:1 }}>
        <GlowCard color="#00D4FF" style={{ padding:48 }}>
          <div style={{ fontSize:56, marginBottom:20, animation:'float 3s ease-in-out infinite' }}>🎯</div>
          <h1 style={{ fontSize:26, fontWeight:800, color:'var(--text)', fontFamily:'Syne, sans-serif', marginBottom:10 }}>
            Welcome, {user?.name?.split(' ')[0] || 'there'}!
          </h1>
          <p style={{ color:'var(--text2)', fontSize:14, lineHeight:1.7, marginBottom:32 }}>
            Your SecureWealth Digital Twin is ready. We've set up your profile with demo data so you can explore every feature right away.
          </p>

          <div style={{ display:'grid', gap:12, textAlign:'left', marginBottom:32 }}>
            {[
              { icon:'🤖', label:'Wealth Coach AI', desc:'Personalized financial advice with explainability' },
              { icon:'🛡', label:'Risk Engine',      desc:'Real-time fraud detection on every transaction' },
              { icon:'📊', label:'Scenario Simulator', desc:'Compound interest modelling with dual projections' },
              { icon:'💬', label:'AI Chatbot',       desc:'GPT-4 powered assistant (add key in backend/.env)' },
            ].map(f => (
              <div key={f.label} style={{ display:'flex', gap:12, alignItems:'center', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'12px 16px' }}>
                <span style={{ fontSize:22, flexShrink:0 }}>{f.icon}</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{f.label}</div>
                  <div style={{ fontSize:11, color:'var(--text3)', marginTop:1 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <GlowButton onClick={() => navigate('/dashboard')} variant="cyan" size="lg" style={{ width:'100%' }}>
            Go to Dashboard →
          </GlowButton>
        </GlowCard>
      </motion.div>
    </div>
  );
}
