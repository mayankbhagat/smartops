'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, User, Menu, Package, AlertTriangle, Zap } from 'lucide-react';

export function Header() {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'Low Stock Alert', desc: 'Mechanical Keyboards are running low.', icon: <Package size={16} className="text-orange-400" />, time: '5m ago' },
    { id: 2, title: 'Route Optimized', desc: 'Cluster Alpha saved 15km driver distance.', icon: <Zap size={16} className="text-emerald-400" />, time: '1h ago' },
    { id: 3, title: 'Shipment Delayed', desc: 'Weather impacting Node South-2.', icon: <AlertTriangle size={16} className="text-red-400" />, time: '2h ago' },
  ];
  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
      className="glass z-40 h-16 w-[calc(100%-18rem)] fixed top-4 right-4 rounded-xl shadow-lg flex items-center justify-between px-6"
    >
      <div className="flex items-center gap-4 flex-1">
        <button className="md:hidden text-neutral-400 hover:text-white">
          <Menu size={20} />
        </button>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg w-96 max-w-full">
          <Search size={16} className="text-neutral-500" />
          <input 
            type="text" 
            placeholder="Search metrics, inventory..." 
            className="bg-transparent border-none text-sm text-white focus:outline-none w-full placeholder:text-neutral-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Bell size={20} />
            <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </motion.button>
          
          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-80 glass-card bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden py-2"
              >
                <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white">Notifications</h4>
                  <span className="text-xs text-blue-400 cursor-pointer hover:underline">Mark all read</span>
                </div>
                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                  {notifications.map(notif => (
                    <div key={notif.id} className="px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 last:border-none flex gap-3">
                      <div className="mt-0.5 p-1.5 bg-black/40 rounded-lg">{notif.icon}</div>
                      <div>
                        <p className="text-sm font-medium text-neutral-200">{notif.title}</p>
                        <p className="text-xs text-neutral-400 mt-0.5">{notif.desc}</p>
                        <span className="text-[10px] text-neutral-500 mt-1 block">{notif.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="h-8 w-px bg-white/10 mx-2"></div>
        
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-white drop-shadow">Demo Co.</span>
            <span className="text-xs text-neutral-400">Pro Plan</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center border border-white/20">
            <User size={18} className="text-white" />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
