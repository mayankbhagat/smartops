'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, User, Package, AlertTriangle, Zap, Download, ChevronDown, Menu, X } from 'lucide-react';

const notifications = [
  { id: 1, title: 'Low Stock Alert', desc: 'Mechanical Keyboards are running low.', icon: <Package size={14} className="text-orange-400" />, time: '5m ago', dot: 'bg-orange-400' },
  { id: 2, title: 'Route Optimized', desc: 'Cluster Alpha saved 15km driver distance.', icon: <Zap size={14} className="text-emerald-400" />, time: '1h ago', dot: 'bg-emerald-400' },
  { id: 3, title: 'Shipment Delayed', desc: 'Weather impacting Node South-2.', icon: <AlertTriangle size={14} className="text-red-400" />, time: '2h ago', dot: 'bg-red-400' },
];

const demoCsvOptions = [
  { label: 'Sales CSV (E-commerce)', url: '/api/demo-data?type=sales&industry=ecommerce' },
  { label: 'Sales CSV (Retail)', url: '/api/demo-data?type=sales&industry=retail' },
  { label: 'Sales CSV (Logistics)', url: '/api/demo-data?type=sales&industry=logistics' },
  { label: 'Inventory CSV', url: '/api/demo-data?type=inventory' },
  { label: 'Logistics Events CSV', url: '/api/demo-data?type=logistics' },
];

export function Header() {
  const [showNotif, setShowNotif] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
      className="z-40 h-16 w-[calc(100%-2rem)] md:w-[calc(100%-17rem)] fixed top-3 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-3 rounded-xl shadow-lg flex items-center justify-between px-5"
      style={{
        background: 'linear-gradient(135deg, rgba(12,12,22,0.9), rgba(8,8,16,0.95))',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.4)',
      }}
    >
      {/* Search */}
      <div className="flex items-center gap-3 flex-1">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg flex-1 max-w-xs" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Search size={14} className="text-neutral-600" />
          <input
            type="text"
            placeholder="Search metrics, inventory..."
            className="bg-transparent text-sm text-white focus:outline-none w-full placeholder:text-neutral-600"
          />
          <kbd className="hidden lg:inline text-[10px] text-neutral-600 px-1.5 py-0.5 rounded border border-white/8">⌘K</kbd>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Demo Data Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowDemo(!showDemo); setShowNotif(false); }}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8' }}
          >
            <Download size={13} />
            Demo Data
            <ChevronDown size={11} className={`transition-transform ${showDemo ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {showDemo && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-56 rounded-xl overflow-hidden py-1 z-50"
                style={{ background: 'rgba(12,12,22,0.98)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }}
              >
                <p className="text-[10px] text-neutral-600 uppercase tracking-wider px-3 py-2 font-semibold">Download Sample CSV</p>
                {demoCsvOptions.map((opt, i) => (
                  <a
                    key={i}
                    href={opt.url}
                    download
                    onClick={() => setShowDemo(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-300 hover:text-white hover:bg-white/4 transition-colors"
                  >
                    <Download size={11} className="text-indigo-400 shrink-0" />
                    {opt.label}
                  </a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-px h-6 bg-white/8 mx-1" />

        {/* Notifications */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => { setShowNotif(!showNotif); setShowDemo(false); }}
            className="relative p-2 rounded-lg text-neutral-400 hover:text-white transition-colors"
            style={{ background: showNotif ? 'rgba(255,255,255,0.06)' : 'transparent' }}
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </motion.button>

          <AnimatePresence>
            {showNotif && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-76 rounded-xl overflow-hidden py-2 z-50"
                style={{ background: 'rgba(12,12,22,0.98)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 40px rgba(0,0,0,0.6)', width: 300 }}
              >
                <div className="px-4 py-2 border-b border-white/6 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white">Notifications</h4>
                  <span className="text-[10px] text-indigo-400 cursor-pointer hover:underline">Mark all read</span>
                </div>
                {notifications.map(n => (
                  <div key={n.id} className="px-4 py-3 hover:bg-white/3 transition-colors cursor-pointer border-b border-white/4 last:border-none flex gap-3">
                    <div className="mt-0.5 p-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>{n.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-neutral-200">{n.title}</p>
                      <p className="text-[11px] text-neutral-500 mt-0.5">{n.desc}</p>
                      <span className="text-[10px] text-neutral-600 mt-1 block">{n.time}</span>
                    </div>
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${n.dot}`} />
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-px h-6 bg-white/8 mx-1" />

        {/* User */}
        <div className="flex items-center gap-2.5 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-white">Demo Co.</p>
            <p className="text-[10px] text-neutral-500">Pro Plan</p>
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center border border-white/15" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <User size={15} className="text-white" />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
