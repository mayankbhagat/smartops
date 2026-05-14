'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, LineChart, Box, Truck, Settings, MessageSquare, Bot, User, Activity, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Overview',   href: '/dashboard',            icon: Home,       color: '#6366f1' },
  { name: 'Analytics',  href: '/dashboard/analytics',  icon: LineChart,  color: '#10b981' },
  { name: 'Inventory',  href: '/dashboard/inventory',  icon: Box,        color: '#f59e0b' },
  { name: 'Logistics',  href: '/dashboard/logistics',  icon: Truck,      color: '#06b6d4' },
  { name: 'AI Agents',  href: '/dashboard/logs',       icon: Bot,        color: '#a855f7' },
  { name: 'Profile',    href: '/dashboard/profile',    icon: User,       color: '#ec4899' },
  { name: 'Settings',   href: '/dashboard/settings',   icon: Settings,   color: '#94a3b8' },
];

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
            <Activity size={18} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-base text-white tracking-tight" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>SmartOps AI</span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400">All systems online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-600 px-3 mb-3">Navigation</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href} onClick={onNavClick}>
              <motion.div
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer group ${
                  isActive
                    ? 'text-white'
                    : 'text-neutral-500 hover:text-neutral-200'
                }`}
                style={{
                  background: isActive ? `${item.color}12` : 'transparent',
                  border: isActive ? `1px solid ${item.color}25` : '1px solid transparent',
                }}
              >
                {/* Active left bar */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-bar"
                    className="absolute left-0 w-0.5 h-5 rounded-full"
                    style={{ background: item.color }}
                  />
                )}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{
                    background: isActive ? `${item.color}20` : 'rgba(255,255,255,0.03)',
                    color: isActive ? item.color : undefined,
                  }}
                >
                  <Icon size={16} />
                </div>
                <span className="text-sm font-medium">{item.name}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Help Card */}
      <div className="p-3 pb-5">
        <div className="p-4 rounded-xl border border-white/5" style={{ background: 'rgba(99,102,241,0.05)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Bot size={14} className="text-indigo-400" />
            <p className="text-xs font-semibold text-white">Need AI help?</p>
          </div>
          <p className="text-[11px] text-neutral-500 mb-3">Ask the SmartOps Copilot for business insights.</p>
          <div className="w-full flex items-center gap-2 text-xs py-2 px-3 rounded-lg text-indigo-400 font-medium"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <MessageSquare size={12} /> Open Copilot
          </div>
        </div>
      </div>
    </>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-[60] md:hidden w-10 h-10 rounded-xl bg-black/80 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors backdrop-blur-xl"
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      {/* Mobile slide-out sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden"
            />
            {/* Panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed inset-y-0 left-0 z-[70] w-72 flex flex-col md:hidden"
              style={{
                background: 'linear-gradient(180deg, rgba(10,10,20,0.98) 0%, rgba(6,6,14,0.99) 100%)',
                borderRight: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
              <SidebarContent onNavClick={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="glass border-r border-white/6 w-64 h-screen fixed top-0 left-0 hidden md:flex flex-col z-50"
        style={{
          background: 'linear-gradient(180deg, rgba(10,10,20,0.95) 0%, rgba(6,6,14,0.98) 100%)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <SidebarContent />
      </motion.aside>
    </>
  );
}
