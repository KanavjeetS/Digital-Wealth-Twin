import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { chatAPI } from '../utils/api';
import { GlowCard, PageHeader } from '../components/UI';

export default function ChatbotPage() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: "Hello! I'm your SecureWealth AI assistant. Ask me anything about personal finance, mutual funds, tax saving (80C, NPS), or your investment strategy. Add your OpenAI key in `backend/.env` to enable GPT-4.",
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput('');
    const history = messages.slice(-10);
    setMessages(m => [...m, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const { data } = await chatAPI.sendMessage(msg, history);
      setMessages(m => [...m, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Connection error. Please check that the backend is running on port 5000.' }]);
    } finally { setLoading(false); }
  };

  const QUICK = ['How to save on taxes?', 'Best SIP for 5 years?', 'What is ELSS?', 'Should I invest in NPS?'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)' }}>
      <PageHeader title="AI Chatbot" subtitle="GPT-4 powered financial assistant — add OPENAI_API_KEY in backend/.env" />
      <GlowCard color="#06B6D4" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }} className="scroll-thin">
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 10 }}>
              {m.role === 'assistant' && (
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #06B6D4, #0066CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, boxShadow: '0 0 14px rgba(6,182,212,0.4)' }}>🤖</div>
              )}
              <div style={{ maxWidth: '76%', background: m.role === 'user' ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${m.role === 'user' ? 'rgba(6,182,212,0.25)' : 'rgba(255,255,255,0.07)'}`, borderRadius: m.role === 'user' ? '14px 14px 3px 14px' : '14px 14px 14px 3px', padding: '12px 16px', color: 'var(--text)', fontSize: 13, lineHeight: 1.65 }} className="chat-md chat-bubble liquid-glass">
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            </motion.div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #06B6D4, #0066CC)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🤖</div>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px 14px 14px 3px', padding: '14px 18px', display: 'flex', gap: 6, alignItems: 'center' }} className="chat-bubble liquid-glass">
                {[0,1,2].map(j => <div key={j} style={{ width: 7, height: 7, borderRadius: '50%', background: '#06B6D4', animation: `dot-bounce 1.2s ${j*0.2}s infinite` }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div style={{ padding: '0 24px 12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {QUICK.map(s => (
            <button key={s} onClick={() => { setInput(s); }} className="btn liquid-glass" style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 20, padding: '5px 14px', color: 'var(--text2)', fontSize: 12, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#06B6D4'; e.currentTarget.style.background = 'rgba(6,182,212,0.14)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text2)'; e.currentTarget.style.background = 'rgba(6,182,212,0.08)'; }}>
              {s}
            </button>
          ))}
        </div>
        <div style={{ padding: '12px 24px 20px', display: 'flex', gap: 10, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ask about tax saving, SIPs, mutual funds..." className="input" style={{ flex: 1, borderRadius: 12, padding: '13px 16px' }} />
          <motion.button whileTap={{ scale: 0.94 }} onClick={send} disabled={loading || !input.trim()} className="btn btn-cyan liquid-glass" style={{ background: 'linear-gradient(135deg, #06B6D4, #0066CC)', border: 'none', borderRadius: 12, padding: '13px 20px', color: '#fff', cursor: 'pointer', fontSize: 18, boxShadow: '0 4px 20px rgba(6,182,212,0.4)', opacity: (!input.trim() || loading) ? 0.5 : 1 }}>↑</motion.button>
        </div>
      </GlowCard>
    </div>
  );
}
