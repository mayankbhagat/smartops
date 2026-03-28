'use client';

import { motion } from 'framer-motion';
import { Home, LineChart, Box, Truck, Settings, MessageSquare, Bot, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Analytics', href: '/dashboard/analytics', icon: LineChart },
    { name: 'Inventory', href: '/dashboard/inventory', icon: Box },
    { name: 'Logistics', href: '/dashboard/logistics', icon: Truck },
    { name: 'AI Logs', href: '/dashboard/logs', icon: Bot },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <motion.aside 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="glass border-r border-white/10 w-64 h-screen fixed top-0 left-0 hidden md:flex flex-col my-4 ml-4 rounded-xl shadow-lg z-50"
    >
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center">
          <Bot size={20} className="text-white" />
        </div>
        <div className="flex font-bold text-2xl tracking-tight text-white drop-shadow-sm" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
          {"SmartOps".split('').map((char, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.05, delay: index * 0.1 + 0.3 }}
            >
              {char}
            </motion.span>
          ))}
        </div>
      </div>

      <nav className="flex-1 px-4 mt-6 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                  isActive ? 'bg-white/10 text-white font-medium border border-white/5' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span className="text-sm">{item.name}</span>
                {isActive && (
                   <motion.div 
                     layoutId="sidebar-active"
                     className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full"
                   />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="glass-card p-4 rounded-xl text-center">
          <p className="text-xs text-neutral-400 mb-2">Need Help?</p>
          <button className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-400 rounded-lg text-sm transition-all flex items-center justify-center gap-2">
            <MessageSquare size={16} /> Contact Support
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
