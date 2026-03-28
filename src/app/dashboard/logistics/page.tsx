// @ts-nocheck
'use client';

import { motion } from 'framer-motion';
import { Map, Zap, Fuel, Activity, Navigation } from 'lucide-react';
import IndiaMap from '@/components/IndiaMap';
import { useState } from 'react';
import { HUBS } from '@/data/hubs';
import { calculateHaversineDistance } from '@/utils/distance';

export default function LogisticsView() {
  const [sourceHub, setSourceHub] = useState<string>('');
  const [destHub, setDestHub] = useState<string>('');
  const [distance, setDistance] = useState<number | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const handleCalculate = () => {
    if (!sourceHub || !destHub) return;
    const s = HUBS.find(h => h.id === sourceHub);
    const d = HUBS.find(h => h.id === destHub);
    if (s && d) {
       setDistance(calculateHaversineDistance(s.coordinates, d.coordinates));
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1 variants={itemVariants} className="text-3xl font-bold text-white">Logistics & Routing</motion.h1>
          <motion.p variants={itemVariants} className="text-neutral-400 mt-1">AI-optimized delivery clusters and interactive distance checks.</motion.p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="glass-card p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-400 mb-1">Optimized Routes Today</p>
            <h3 className="text-3xl font-bold text-white">3 Clusters</h3>
          </div>
          <Map size={32} className="text-blue-500 opacity-50" />
        </motion.div>
        
        <motion.div variants={itemVariants} className="glass-card p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-400 mb-1">Est. Fuel Savings</p>
            <h3 className="text-3xl font-bold text-emerald-400">$45.20</h3>
          </div>
          <Fuel size={32} className="text-emerald-500 opacity-50" />
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-400 mb-1">Delivery Efficiency</p>
            <h3 className="text-3xl font-bold text-purple-400">+18%</h3>
          </div>
          <Activity size={32} className="text-purple-500 opacity-50" />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map Visualization */}
        <motion.div variants={itemVariants} className="glass-card p-6 h-[550px] flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4">Route Visualization (India)</h3>
          <div className="flex-1 bg-black/40 rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-center p-2">
            <IndiaMap sourceHubId={sourceHub} destHubId={destHub} />
          </div>
        </motion.div>

        {/* Distance Calculator and Suggestions */}
        <motion.div variants={itemVariants} className="flex flex-col gap-6">
          {/* Distance Configurator */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Navigation size={20} className="text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Distance Calculator</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Source Hub</label>
                  <select 
                    value={sourceHub} 
                    onChange={e => setSourceHub(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select Origin</option>
                    {HUBS.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Destination Hub</label>
                  <select 
                    value={destHub} 
                    onChange={e => setDestHub(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select Destination</option>
                    {HUBS.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>
              </div>
              <button 
                onClick={handleCalculate}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Calculate Distance
              </button>
              
              {distance !== null && (
                <div className="mt-4 p-4 rounded-xl bg-blue-900/20 border border-blue-500/30 flex justify-between items-center animate-in fade-in slide-in-from-bottom-2">
                  <span className="text-neutral-300 text-sm">Estimated Air Distance:</span>
                  <span className="text-2xl font-bold text-white">{distance.toFixed(1)} <span className="text-sm font-normal text-blue-400">km</span></span>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card p-6 flex-1 flex flex-col h-[280px]">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={20} className="text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">AI Routing Suggestions</h3>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-white">Cluster Alpha (North Hub)</h4>
                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-md">15km shorter</span>
                </div>
                <p className="text-sm text-neutral-400 mb-3">Grouped 4 deliveries to City Center and Suburbs into a single morning route.</p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-white">Cluster Beta (West Hub)</h4>
                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-md">Save $12 fuel</span>
                </div>
                <p className="text-sm text-neutral-400 mb-3">Optimized return path via Highway 4. Bypasses ongoing construction.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
