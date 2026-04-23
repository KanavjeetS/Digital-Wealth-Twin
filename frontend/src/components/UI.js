import { useState } from 'react';
import { motion } from 'framer-motion';

// ─── Format helpers ───────────────────────────────────────────────────────────
export const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
export const pct = (a, b) => b > 0 ? Math.min(100, Math.round((a / b) * 100)) : 0;

// ─── GlowCard ─────────────────────────────────────────────────────────────────
export function GlowCard({ children, color = '#00D4FF', className = '', style = {}, animate = true }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 16 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={`card liquid-glass ${className}`}
      style={{
        ...style,
        boxShadow: hovered ? `0 8px 40px rgba(0,0,0,0.5), 0 0 30px ${color}18` : '0 4px 20px rgba(0,0,0,0.3)',
        borderColor: hovered ? `${color}30` : 'rgba(255,255,255,0.07)',
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {children}
    </motion.div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, color = '#00D4FF', icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="card liquid-glass"
      style={{ padding: '20px 22px', position: 'relative', overflow: 'hidden' }}
    >
      {/* Corner glow */}
      <div style={{ position: 'absolute', top: -40, right: -40, width: 100, height: 100, borderRadius: '50%', background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`, pointerEvents: 'none' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{label}</div>
        {icon && <span style={{ fontSize: 18, opacity: 0.7 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: 'DM Mono, monospace', letterSpacing: -0.5, textShadow: `0 0 20px ${color}55` }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>{sub}</div>}
    </motion.div>
  );
}

// ─── RiskShield ───────────────────────────────────────────────────────────────
export function RiskShield({ level = 'LOW', size = 28, showLabel = false }) {
  const cfg = {
    LOW:    { color: '#10B981', glow: 'rgba(16,185,129,0.5)',  label: 'LOW',    symbol: '✓' },
    MEDIUM: { color: '#F59E0B', glow: 'rgba(245,158,11,0.5)', label: 'MEDIUM', symbol: '~' },
    HIGH:   { color: '#EF4444', glow: 'rgba(239,68,68,0.5)',  label: 'HIGH',   symbol: '!' },
  }[level] || { color: '#10B981', glow: 'rgba(16,185,129,0.5)', label: 'LOW', symbol: '✓' };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        {/* Pulse ring */}
        <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: `2px solid ${cfg.color}`, opacity: 0.4, animation: 'pulse-ring 2s infinite' }} />
        <svg width={size} height={size} viewBox="0 0 24 24" style={{ filter: `drop-shadow(0 0 8px ${cfg.glow})` }}>
          <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.35C17.25 23.15 21 18.25 21 13V7l-9-5z" fill={cfg.color} />
          <text x="50%" y="57%" textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="white" fontWeight="bold" fontFamily="DM Sans">{cfg.symbol}</text>
        </svg>
      </div>
      {showLabel && <span style={{ fontSize: 12, fontWeight: 700, color: cfg.color, letterSpacing: 0.5 }}>{cfg.label}</span>}
    </div>
  );
}

// ─── ProgressBar ──────────────────────────────────────────────────────────────
export function ProgressBar({ value, color = '#00D4FF', height = 6 }) {
  return (
    <div className="progress-track" style={{ height }}>
      <motion.div
        className="progress-fill"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, value)}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ background: `linear-gradient(90deg, ${color}99, ${color})` }}
      />
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
export function Toggle({ value, onChange, color = '#00D4FF' }) {
  return (
    <div
      className="toggle-track"
      onClick={() => onChange(!value)}
      style={{ background: value ? `${color}33` : 'rgba(255,255,255,0.05)', borderColor: value ? `${color}55` : 'rgba(255,255,255,0.07)', boxShadow: value ? `0 0 12px ${color}44` : 'none' }}
    >
      <motion.div
        className="toggle-thumb"
        animate={{ left: value ? 23 : 3 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{ boxShadow: value ? `0 0 10px ${color}` : '0 2px 8px rgba(0,0,0,0.4)' }}
      />
    </div>
  );
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
export function Tooltip({ text, children }) {
  const [visible, setVisible] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      <span onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>{children}</span>
      <AnimatePresenceWrapper visible={visible}>
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'absolute', bottom: '130%', left: '50%', transform: 'translateX(-50%)',
            background: '#1A2540', border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: 10, padding: '10px 14px', minWidth: 220, maxWidth: 300,
            color: 'var(--text)', fontSize: 12, lineHeight: 1.6, zIndex: 999,
            boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(0,212,255,0.1)',
          }}
        >
          {text}
          <div style={{ position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)', width: 10, height: 10, background: '#1A2540', borderRight: '1px solid rgba(0,212,255,0.2)', borderBottom: '1px solid rgba(0,212,255,0.2)', rotate: '45deg' }} />
        </motion.div>
      </AnimatePresenceWrapper>
    </span>
  );
}

function AnimatePresenceWrapper({ visible, children }) {
  const { AnimatePresence } = require('framer-motion');
  return <AnimatePresence>{visible && children}</AnimatePresence>;
}

// ─── Badge ────────────────────────────────────────────────────────────────────
const BADGE_STYLES = {
  Investment:    { bg: 'rgba(0,212,255,0.12)',    color: '#00D4FF' },
  Income:        { bg: 'rgba(16,185,129,0.12)',   color: '#10B981' },
  Food:          { bg: 'rgba(245,158,11,0.12)',   color: '#F59E0B' },
  Entertainment: { bg: 'rgba(139,92,246,0.12)',   color: '#8B5CF6' },
  Housing:       { bg: 'rgba(96,165,250,0.12)',   color: '#60A5FA' },
  Transport:     { bg: 'rgba(52,211,153,0.12)',   color: '#34D399' },
  Utilities:     { bg: 'rgba(251,191,36,0.12)',   color: '#FBBF24' },
  Other:         { bg: 'rgba(148,163,184,0.12)',  color: '#94A3B8' },
  LOW:           { bg: 'rgba(16,185,129,0.12)',   color: '#10B981' },
  MEDIUM:        { bg: 'rgba(245,158,11,0.12)',   color: '#F59E0B' },
  HIGH:          { bg: 'rgba(239,68,68,0.12)',    color: '#EF4444' },
  ALLOW:         { bg: 'rgba(16,185,129,0.12)',   color: '#10B981' },
  WARN:          { bg: 'rgba(245,158,11,0.12)',   color: '#F59E0B' },
  BLOCK:         { bg: 'rgba(239,68,68,0.12)',    color: '#EF4444' },
  Active:        { bg: 'rgba(16,185,129,0.12)',   color: '#10B981' },
  Paused:        { bg: 'rgba(245,158,11,0.12)',   color: '#F59E0B' },
  Matured:       { bg: 'rgba(96,165,250,0.12)',   color: '#60A5FA' },
};

export function Badge({ text }) {
  const s = BADGE_STYLES[text] || BADGE_STYLES.Other;
  return (
    <span className="badge" style={{ background: s.bg, color: s.color }}>
      {text}
    </span>
  );
}

// ─── GlowButton ───────────────────────────────────────────────────────────────
export function GlowButton({ children, onClick, disabled, variant = 'cyan', size = 'md', style = {} }) {
  const variants = {
    cyan:   'btn-cyan',
    purple: 'btn-purple',
    ghost:  'btn-ghost',
  };
  const sizes = {
    sm: { padding: '6px 14px', fontSize: 12 },
    md: { padding: '10px 20px', fontSize: 13 },
    lg: { padding: '13px 28px', fontSize: 15 },
  };
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      disabled={disabled}
      className={`btn ${variants[variant]}`}
      style={{ ...sizes[size], opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer', ...style }}
    >
      {children}
    </motion.button>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}
    >
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', fontFamily: 'Syne, sans-serif', lineHeight: 1.2 }}>{title}</h1>
        {subtitle && <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>{subtitle}</p>}
      </div>
      {action}
    </motion.div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
export function Skeleton({ width = '100%', height = 20, style = {} }) {
  return (
    <div className="animate-shimmer" style={{ width, height, borderRadius: 8, background: 'rgba(255,255,255,0.04)', ...style }} />
  );
}
