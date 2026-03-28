// @ts-nocheck
'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Server, Clock, Search, FileJson } from 'lucide-react';

const mockLogs = [
  { id: 1, agent: 'Decision Agent', status: 'Completed', time: '12ms', date: '2 min ago', context: 'Generated Executive Summary', statusType: 'success' },
  { id: 2, agent: 'Logistics Agent', status: 'Completed', time: '410ms', date: '2 min ago', context: 'Optimized 3 routes', statusType: 'success' },
  { id: 3, agent: 'Inventory Agent', status: 'Completed', time: '380ms', date: '3 min ago', context: 'Predicted Demand', statusType: 'success' },
  { id: 4, agent: 'Analyst Agent', status: 'Completed', time: '520ms', date: '4 min ago', context: 'Calculated Margins', statusType: 'success' },
  { id: 5, agent: 'Data Ingestion', status: 'Warning', time: '890ms', date: '40 min ago', context: 'Parsed PDF (2 fields missing)', statusType: 'warning' },
]

export default function AgentLogsView() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1 variants={itemVariants} className="text-3xl font-bold text-white">AI Agent Execution Logs</motion.h1>
          <motion.p variants={itemVariants} className="text-neutral-400 mt-1">Audit log and explainability of agent decisions.</motion.p>
        </div>
        
        <motion.div variants={itemVariants} className="flex gap-3">
           <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg">
              <Search size={16} className="text-neutral-500" />
              <input type="text" placeholder="Search logs..." className="bg-transparent text-sm w-32 focus:outline-none text-white placeholder:text-neutral-600" />
           </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="glass-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
               <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-sm text-neutral-400">Pipeline Status</p>
              <h4 className="text-xl font-semibold text-white">Healthy</h4>
            </div>
         </div>
         <div className="glass-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
               <Server size={24} />
            </div>
            <div>
              <p className="text-sm text-neutral-400">Avg. Execution Time</p>
              <h4 className="text-xl font-semibold text-white">410ms</h4>
            </div>
         </div>
         <div className="glass-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
               <span className="font-bold text-xl">1.2k</span>
            </div>
            <div>
              <p className="text-sm text-neutral-400">Total Tokens Generated</p>
              <h4 className="text-xl font-semibold text-white">Today</h4>
            </div>
         </div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/10 bg-white/5 flex items-center gap-2">
           <Clock size={16} className="text-neutral-400" />
           <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
        </div>
        
        <div className="divide-y divide-white/5">
           {mockLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-white/5 transition-colors flex items-start gap-4 flex-col sm:flex-row sm:items-center">
                 <div className="w-32 flex-shrink-0">
                    <span className="text-sm font-medium text-white">{log.agent}</span>
                    <p className="text-xs text-neutral-500 mt-0.5">{log.date}</p>
                 </div>
                 <div className="flex-1">
                    <p className="text-sm text-neutral-300">{log.context}</p>
                 </div>
                 <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="text-xs font-mono text-neutral-500">{log.time}</span>
                    <div className="flex items-center gap-2">
                       {log.statusType === 'success' && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                       {log.statusType === 'warning' && <span className="w-2 h-2 rounded-full bg-yellow-500"></span>}
                       <span className="text-xs font-medium text-neutral-400">{log.status}</span>
                    </div>
                    <button className="p-1.5 rounded-md hover:bg-white/10 text-neutral-400 hover:text-white transition-colors">
                       <FileJson size={16} />
                    </button>
                 </div>
              </div>
           ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
