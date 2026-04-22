// ════════ Wealth Coach — unified AI entry (typed responses + execute) ════════
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { aiAPI, executeAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { GlowCard, Tooltip as WhyTooltip, PageHeader, fmt } from '../components/UI';
import toast from 'react-hot-toast';

const SUGGESTIONS = [
  'Should I start an SIP?',
  'I want to invest 1 lakh',
  'What if I delay starting my SIP?',
  'Invest 1 lakh from a new phone right after login with wrong otp',
];

function RiskPanel({ risk }) {
  if (!risk) return null;
  const d = risk.decision;
  const border = d === 'BLOCK' ? '#EF4444' : d === 'WARN' ? '#F59E0B' : '#10B981';
  const bg = d === 'BLOCK' ? 'rgba(239,68,68,0.12)' : d === 'WARN' ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)';
  return (
    <div style={{ marginTop: 10, padding: 14, borderRadius: 12, border: `1px solid ${border}55`, background: bg }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', letterSpacing: 1, marginBottom: 8 }}>RISK ENGINE</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 22, fontWeight: 800, color: border }}>{risk.risk_score}</span>
        <span style={{ fontSize: 12, color: 'var(--text2)' }}>/ 100</span>
        <span style={{ padding: '4px 12px', borderRadius: 8, background: `${border}33`, color: border, fontWeight: 800, fontSize: 12 }}>{d}</span>
        <span style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase' }}>{risk.level}</span>
      </div>
      <p style={{ margin: '10px 0 0', fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{risk.reason}</p>
      {risk.signals?.length > 0 && (
        <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {risk.signals.map((s) => (
            <span key={s} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', color: 'var(--text3)' }}>{s}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function SimulationInline({ sim }) {
  if (!sim?.start_now?.length) return null;
  const chartData = sim.start_now.filter((_, i) => i % 6 === 0).map((row, idx) => {
    const j = Math.min(idx * 6, sim.start_later.length - 1);
    return { m: `M${row.month}`, now: row.value, later: sim.start_later[j]?.value || 0 };
  });
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', letterSpacing: 1, marginBottom: 8 }}>SCENARIO SIMULATOR</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#F59E0B', marginBottom: 8 }}>{sim.summary?.nudge_message}</div>
      <div style={{ height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="m" tick={{ fill: '#4B6080', fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#4B6080', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background: '#131D30', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} formatter={(v) => fmt(v)} />
            <Line type="monotone" dataKey="now" name="Start now" stroke="#00D4FF" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="later" name="+1yr delay" stroke="#EF4444" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <Link to="/simulator" style={{ fontSize: 12, color: '#00D4FF', marginTop: 8, display: 'inline-block' }}>Open full simulator →</Link>
    </div>
  );
}

export default function WealthCoachPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([{
    role: 'assistant',
    type: 'chat',
    content: `Hi ${user?.name?.split(' ')[0] || 'there'}! I'm your **SecureWealth** coach — one entry point for advice, **risk checks**, and **simulations**. Try *“I want to invest 1 lakh”* or ask anything about your plan.`,
    reason: 'Greeting uses your onboarding profile (income, goal, risk) for context.',
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [execLoading, setExecLoading] = useState(false);
  const lastSuggestedAmount = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const runExecute = async (amount, overrides = {}) => {
    if (!amount) {
      toast.error('No amount context — ask to invest a specific sum first.');
      return;
    }
    setExecLoading(true);
    try {
      const { data } = await executeAPI.execute({
        action_type: 'INVESTMENT',
        amount,
        avg_amount: 18000,
        is_new_device: !!overrides.is_new_device,
        seconds_since_login: overrides.seconds_since_login ?? 400,
        otp_retry_count: overrides.otp_retry_count ?? 0,
        is_first_investment_type: !!overrides.is_first_investment_type,
      });
      setMessages((m) => [...m, {
        role: 'assistant',
        type: 'action_response',
        content: `**Master execution**\n\n${data.message || 'Decision recorded.'}\n\nFinal decision: **${data.decision}** (score **${data.risk_score}**).`,
        reason: 'Response from POST /api/execute (proxies Python when AI_SERVICE_URL is set).',
        risk: {
          risk_score: data.risk_score,
          level: data.level,
          decision: data.decision,
          reason: data.reason,
          signals: data.signals || [],
        },
        simulation_preview: data.simulation,
      }]);
      toast.success(`Execute: ${data.decision}`);
    } catch {
      toast.error('Execute failed — check backend.');
    } finally {
      setExecLoading(false);
    }
  };

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', type: 'chat', content: msg }]);
    setLoading(true);
    try {
      const { data } = await aiAPI.chat(msg, {
        name: user?.name?.split(' ')[0] || 'User',
        age: user?.age,
        income: user?.income,
        goal: user?.primaryGoal,
        risk_appetite: user?.riskAppetite,
        current_savings: user?.currentSavings,
      });
      const type = data.type || 'chat';
      if (type === 'action_response' && data.suggested_amount) lastSuggestedAmount.current = data.suggested_amount;

      setMessages((m) => [...m, {
        role: 'assistant',
        type,
        content: data.reply || data.message || '_No text reply_',
        reason: data.reason,
        risk: data.risk,
        simulation: data.simulation,
        simulation_preview: data.simulation_preview,
      }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', type: 'chat', content: "I'm having trouble connecting right now. Please try again in a moment.", reason: null }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)' }}>
      <PageHeader title="Wealth Coach AI" subtitle="Unified agent — chat · risk · simulation (POST /api/ai/chat)" />

      <GlowCard color="#EC4899" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }} className="scroll-thin">
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 10 }}>
              {m.role === 'assistant' && (
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #EC4899, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, boxShadow: '0 0 16px rgba(236,72,153,0.4)', marginTop: 2 }}>◉</div>
              )}
              <div style={{ maxWidth: '82%' }}>
                {m.role === 'assistant' && m.type && m.type !== 'chat' && (
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: '#EC4899', marginBottom: 6 }}>
                    {m.type === 'action_response' ? 'ACTION + RISK' : 'SIMULATION'}
                  </div>
                )}
                <div style={{
                  background: m.role === 'user' ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${m.role === 'user' ? 'rgba(0,212,255,0.25)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: m.role === 'user' ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
                  padding: '12px 16px', color: 'var(--text)', fontSize: 13, lineHeight: 1.65,
                }} className="chat-md">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
                {m.reason && (
                  <div style={{ marginTop: 6 }}>
                    <WhyTooltip text={m.reason}>
                      <button type="button" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '3px 12px', color: 'var(--text3)', fontSize: 11, cursor: 'pointer' }}>💡 Why?</button>
                    </WhyTooltip>
                  </div>
                )}
                {m.type === 'action_response' && <RiskPanel risk={m.risk} />}
                {m.type === 'action_response' && m.risk?.decision !== 'BLOCK' && m.simulation_preview && (
                  <SimulationInline sim={m.simulation_preview} />
                )}
                {m.type === 'simulation_advice' && m.simulation && <SimulationInline sim={m.simulation} />}
                {m.type === 'action_response' && m.risk?.decision !== 'BLOCK' && lastSuggestedAmount.current && (
                  <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button type="button" disabled={execLoading} onClick={() => runExecute(lastSuggestedAmount.current, {})}
                      style={{ padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: 'linear-gradient(135deg,#00D4FF,#0066CC)', color: '#fff' }}>
                      {execLoading ? '…' : 'Run POST /api/execute'}
                    </button>
                    <span style={{ fontSize: 11, color: 'var(--text3)', alignSelf: 'center' }}>Same pipeline as “Invest” in production</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #EC4899, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>◉</div>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px 14px 14px 3px', padding: '14px 18px', display: 'flex', gap: 6, alignItems: 'center' }}>
                {[0, 1, 2].map((j) => <div key={j} style={{ width: 7, height: 7, borderRadius: '50%', background: '#EC4899', animation: `dot-bounce 1.2s ${j * 0.2}s infinite` }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div style={{ padding: '0 24px 12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" onClick={() => send(s)} style={{ background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.2)', borderRadius: 20, padding: '5px 14px', color: 'var(--text2)', fontSize: 11, cursor: 'pointer' }}>{s}</button>
          ))}
        </div>

        <div style={{ padding: '12px 24px 20px', display: 'flex', gap: 10, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Ask anything, simulate, or describe an investment…" className="input"
            style={{ flex: 1, borderRadius: 12, padding: '13px 16px', fontSize: 13 }} />
          <motion.button type="button" whileTap={{ scale: 0.94 }} onClick={() => send()} disabled={loading || !input.trim()}
            style={{ background: 'linear-gradient(135deg, #EC4899, #8B5CF6)', border: 'none', borderRadius: 12, padding: '13px 18px', color: '#fff', cursor: 'pointer', fontSize: 18, boxShadow: '0 4px 20px rgba(236,72,153,0.4)', opacity: (!input.trim() || loading) ? 0.5 : 1 }}>↑</motion.button>
        </div>
      </GlowCard>
    </div>
  );
}
