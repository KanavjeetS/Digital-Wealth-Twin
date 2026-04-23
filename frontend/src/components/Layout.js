import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/dashboard',    icon: '⬡', label: 'Dashboard',     color: '#00D4FF' },
  { to: '/goals',        icon: '◎', label: 'Goals',          color: '#10B981' },
  { to: '/investments',  icon: '◈', label: 'Investments',    color: '#8B5CF6' },
  { to: '/simulator',    icon: '⟁', label: 'Simulator',      color: '#F59E0B' },
  { to: '/aggregate',   icon: '⎔', label: 'Banks',          color: '#22D3EE' },
  { to: '/coach',        icon: '◉', label: 'Wealth Coach',   color: '#EC4899' },
  { to: '/chat',         icon: '💬', label: 'AI Chatbot',    color: '#06B6D4' },
  { to: '/transactions', icon: '≡',  label: 'Transactions',  color: '#A78BFA' },
  { to: '/risk-alerts',  icon: '⬟', label: 'Risk Alerts',    color: '#EF4444', badge: true },
  { to: '/profile',      icon: '○',  label: 'Profile',       color: '#94A3B8' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0, active: false });

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div
      style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}
      onMouseMove={(e) => setPointer({ x: e.clientX, y: e.clientY, active: true })}
      onMouseLeave={() => setPointer((p) => ({ ...p, active: false }))}
    >
      {/* ── Ambient background orbs ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)', animation: 'float 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', animation: 'float 10s ease-in-out infinite reverse' }} />
        <div style={{ position: 'absolute', top: '40%', right: '20%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.04) 0%, transparent 70%)', animation: 'float 12s ease-in-out infinite' }} />
      </div>
      <div
        className="dashboard-cursor-glow"
        style={{
          opacity: pointer.active ? 1 : 0,
          left: pointer.x - 160,
          top: pointer.y - 160,
        }}
      />

      {/* ── Sidebar ── */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        style={{
          background: 'rgba(8,10,14,0.86)',
          backdropFilter: 'blur(40px)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10,
          flexShrink: 0,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Sidebar inner glow */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.3), transparent)' }} />

        {/* Logo */}
        <div style={{ padding: collapsed ? '24px 16px' : '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, #00D4FF, #0066CC)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 800, color: '#000',
              boxShadow: '0 0 20px rgba(0,212,255,0.5)',
              cursor: 'pointer',
            }}
            onClick={() => setCollapsed(c => !c)}
          >
            S
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', fontFamily: 'Syne, sans-serif', whiteSpace: 'nowrap' }}>SecureWealth</div>
                <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 1 }}>Digital Twin · PSBs 2026</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', overflowX: 'hidden' }} className="scroll-thin">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} style={{ textDecoration: 'none', display: 'block', marginBottom: 2 }}>
              {({ isActive }) => (
                <motion.div
                  whileHover={{ x: collapsed ? 0 : 3 }}
                  whileTap={{ scale: 0.97 }}
                  title={collapsed ? item.label : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: collapsed ? '10px 0' : '9px 12px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    borderRadius: 10, cursor: 'pointer',
                    background: isActive ? `${item.color}18` : 'transparent',
                    border: isActive ? `1px solid ${item.color}30` : '1px solid transparent',
                    color: isActive ? item.color : 'var(--text2)',
                    transition: 'all 0.2s',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {isActive && (
                    <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, borderRadius: '0 3px 3px 0', background: item.color, boxShadow: `0 0 10px ${item.color}` }} />
                  )}
                  <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0, filter: isActive ? `drop-shadow(0 0 6px ${item.color})` : 'none' }}>
                    {item.icon}
                  </span>
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, whiteSpace: 'nowrap' }}>{item.label}</span>
                        {item.badge && (
                          <span style={{ background: '#EF4444', color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, marginLeft: 'auto', boxShadow: '0 0 8px rgba(239,68,68,0.6)', flexShrink: 0 }}>!</span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User chip + logout */}
        <div style={{ padding: collapsed ? '16px 10px' : '16px 14px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0, boxShadow: '0 0 12px rgba(139,92,246,0.5)' }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'User'}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)' }}>{user?.riskAppetite || 'medium'} risk · age {user?.age || '—'}</div>
                </motion.div>
              )}
            </AnimatePresence>
            {!collapsed && (
              <button onClick={handleLogout} title="Logout" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 16, padding: 4, flexShrink: 0 }}>⇥</button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }} className="scroll-thin">
        <div style={{ flex: 1, padding: '32px 36px', maxWidth: 1200, width: '100%', margin: '0 auto' }}>
          <Outlet />
        </div>
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '14px 36px', textAlign: 'center', fontSize: 11, color: 'var(--text3)', background: 'rgba(0,0,0,0.2)' }}>
          ⚠️ For simulation and demo purposes only. Not real financial advice. · SecureWealth Twin · PSBs Hackathon 2026
        </footer>
      </main>
    </div>
  );
}
