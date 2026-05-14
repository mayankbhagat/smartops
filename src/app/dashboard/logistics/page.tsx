// @ts-nocheck
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Map, Truck, Plane, Ship, Zap, Leaf, Clock, DollarSign, Navigation, Bot, Loader2, Wind } from 'lucide-react';
import GlobalMap from '@/components/GlobalMap';
import { HUBS, HUB_REGIONS } from '@/data/hubs';
import { calculateHaversineDistance } from '@/utils/distance';

// ── Transport Modes ────────────────────────────────────────────
const MODES = {
  truck: {
    label: 'Road Truck',
    icon: Truck,
    color: '#6366f1',
    costPerKm: 8,       // ₹ per km
    co2PerKm: 0.27,     // kg CO2 per km
    speedKmh: 60,
    emoji: '🚛',
  },
  air: {
    label: 'Air Cargo',
    icon: Plane,
    color: '#f59e0b',
    costPerKm: 45,
    co2PerKm: 0.6,
    speedKmh: 750,
    emoji: '✈️',
  },
  ship: {
    label: 'Sea Freight',
    icon: Ship,
    color: '#06b6d4',
    costPerKm: 2,
    co2PerKm: 0.015,
    speedKmh: 30,
    emoji: '🚢',
  },
};

// ── Calculation ────────────────────────────────────────────────
function calcRoute(distKm: number, mode: keyof typeof MODES, weightKg: number = 1000) {
  const m = MODES[mode];
  const cost = Math.round(distKm * m.costPerKm * (weightKg / 1000));
  const co2 = parseFloat((distKm * m.co2PerKm * (weightKg / 1000)).toFixed(2));
  const timeHours = distKm / m.speedKmh;
  const days = Math.floor(timeHours / 24);
  const hours = Math.round(timeHours % 24);
  const timeLabel = days > 0 ? `${days}d ${hours}h` : `${Math.round(timeHours)}h`;
  return { cost, co2, timeLabel };
}

// ── Sustainability Score ─────────────────────────────────────
function ecoScore(co2: number, maxCo2: number) {
  return Math.max(0, Math.round(100 - (co2 / maxCo2) * 100));
}

// ── Score Bar ────────────────────────────────────────────────
function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="progress-bar mt-1">
      <motion.div
        className="progress-fill"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ background: `linear-gradient(90deg, ${color}, ${color}99)` }}
      />
    </div>
  );
}

// ── Mode Card ────────────────────────────────────────────────
function ModeCard({ mode, mKey, selected, onClick, result, maxCo2 }: any) {
  const Icon = mode.icon;
  const score = result ? ecoScore(result.co2, maxCo2) : null;
  return (
    <motion.button
      onClick={() => onClick(mKey)}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      className={`glass-card p-4 text-left w-full transition-all border-2 ${selected ? 'border-current' : 'border-white/5'}`}
      style={{ borderColor: selected ? mode.color : undefined }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${mode.color}18` }}>
          <Icon size={20} style={{ color: mode.color }} />
        </div>
        <span className="font-semibold text-white text-sm">{mode.label}</span>
        {selected && <span className="ml-auto text-[10px] badge-info px-2 py-0.5 rounded-full">Selected</span>}
      </div>
      {result ? (
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-neutral-400">Cost</span><span className="font-mono text-white">₹{result.cost.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-neutral-400">CO₂</span><span className="font-mono text-white">{result.co2} kg</span></div>
          <div className="flex justify-between"><span className="text-neutral-400">Time</span><span className="font-mono text-white">{result.timeLabel}</span></div>
          {score !== null && (
            <div>
              <div className="flex justify-between mt-1">
                <span className="text-neutral-400 flex items-center gap-1"><Leaf size={10} /> Eco Score</span>
                <span className="font-mono" style={{ color: score > 60 ? '#10b981' : score > 30 ? '#f59e0b' : '#ef4444' }}>{score}/100</span>
              </div>
              <ScoreBar value={score} color={score > 60 ? '#10b981' : score > 30 ? '#f59e0b' : '#ef4444'} />
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-neutral-600">Select hubs to calculate</p>
      )}
    </motion.button>
  );
}

// ── Main ─────────────────────────────────────────────────────
export default function LogisticsView() {
  const [sourceHub, setSourceHub] = useState('');
  const [destHub, setDestHub] = useState('');
  const [selectedMode, setSelectedMode] = useState<keyof typeof MODES>('truck');
  const [weightKg, setWeightKg] = useState(1000);
  const [distance, setDistance] = useState<number | null>(null);
  const [results, setResults] = useState<Record<string, any> | null>(null);
  const [aiRouting, setAiRouting] = useState<string | null>(null);
  const [isGenRouting, setIsGenRouting] = useState(false);

  const handleCalculate = () => {
    if (!sourceHub || !destHub || sourceHub === destHub) return;
    const s = HUBS.find(h => h.id === sourceHub);
    const d = HUBS.find(h => h.id === destHub);
    if (!s || !d) return;
    const dist = calculateHaversineDistance(s.coordinates, d.coordinates);
    setDistance(dist);
    const res: Record<string, any> = {};
    Object.keys(MODES).forEach(mk => {
      res[mk] = calcRoute(dist, mk as any, weightKg);
    });
    setResults(res);
  };

  const generateAIRouting = async () => {
    if (!distance || !results) return;
    setIsGenRouting(true);
    const src = HUBS.find(h => h.id === sourceHub)?.name;
    const dst = HUBS.find(h => h.id === destHub)?.name;
    const prompt = `You are a logistics AI. A shipment of ${weightKg}kg needs to go from ${src} to ${dst} (${distance.toFixed(0)}km).
Transport options:
- Truck: ₹${results.truck.cost}, ${results.truck.co2}kg CO2, ${results.truck.timeLabel}
- Air: ₹${results.air.cost}, ${results.air.co2}kg CO2, ${results.air.timeLabel}
- Ship: ₹${results.ship.cost}, ${results.ship.co2}kg CO2, ${results.ship.timeLabel}
Analyze and recommend the optimal route considering cost, sustainability, and delivery time. Include a hybrid option if beneficial. Keep it under 150 words.`;
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData: prompt }),
      });
      const d = await res.json();
      setAiRouting(d.report || d.error);
    } catch (e: any) { setAiRouting('Error: ' + e.message); }
    setIsGenRouting(false);
  };

  const best = results
    ? Object.entries(results).reduce((a, [k, v]) => (v.cost < a[1].cost ? [k, v] : a), Object.entries(results)[0])
    : null;
  const greenest = results
    ? Object.entries(results).reduce((a, [k, v]) => (v.co2 < a[1].co2 ? [k, v] : a), Object.entries(results)[0])
    : null;
  const fastest = results
    ? Object.entries(results).reduce((a, [k, v]) => {
        const toH = (t: string) => {
          const m = t.match(/(\d+)d (\d+)h/);
          if (m) return +m[1] * 24 + +m[2];
          const h = t.match(/(\d+)h/);
          return h ? +h[1] : 9999;
        };
        return toH(v.timeLabel) < toH(a[1].timeLabel) ? [k, v] : a;
      }, Object.entries(results)[0])
    : null;

  const maxCo2 = results ? Math.max(...Object.values(results).map((r: any) => r.co2)) : 1;

  const iv = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const ii = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 22 } } };

  return (
    <motion.div variants={iv} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1 variants={ii} className="text-3xl font-bold text-white">Logistics AI Engine</motion.h1>
          <motion.p variants={ii} className="text-neutral-400 mt-1">Multi-modal route optimization with real cost, CO₂ and time calculations.</motion.p>
        </div>
      </div>

      {/* Summary KPIs (after calc) */}
      {results && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Cheapest Route', icon: DollarSign, color: '#10b981', value: `${MODES[best[0] as keyof typeof MODES].label}`, sub: `₹${best[1].cost.toLocaleString()}` },
            { label: 'Most Eco-Friendly', icon: Leaf, color: '#06b6d4', value: `${MODES[greenest[0] as keyof typeof MODES].label}`, sub: `${greenest[1].co2} kg CO₂` },
            { label: 'Fastest Delivery', icon: Clock, color: '#f59e0b', value: `${MODES[fastest[0] as keyof typeof MODES].label}`, sub: fastest[1].timeLabel },
          ].map((card, i) => (
            <div key={i} className="glass-card p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${card.color}18` }}>
                <card.icon size={22} style={{ color: card.color }} />
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-0.5">{card.label}</p>
                <p className="font-semibold text-white text-sm">{card.value}</p>
                <p className="text-xs font-mono text-neutral-400">{card.sub}</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <motion.div variants={ii} className="lg:col-span-2 glass-card p-6 h-[520px] flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Map size={18} className="text-indigo-400" />
            <h3 className="text-base font-semibold text-white">Route Visualization</h3>
            {distance && (
              <span className="ml-auto text-xs badge-info px-2 py-0.5 rounded-full font-mono">
                {distance.toFixed(0)} km
              </span>
            )}
          </div>
          <div className="flex-1 rounded-xl border border-white/5 overflow-hidden bg-black/30" style={{ touchAction: 'pan-y' }}>
            <div className="w-full h-full md:pointer-events-auto pointer-events-none">
              <GlobalMap sourceHubId={sourceHub} destHubId={destHub} />
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div variants={ii} className="flex flex-col gap-5">
          {/* Hub Selector */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Navigation size={17} className="text-indigo-400" />
              <h3 className="text-base font-semibold text-white">Route Configuration</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-neutral-400 block mb-1.5">Origin Hub</label>
                <select value={sourceHub} onChange={e => setSourceHub(e.target.value)} className="smart-input">
                  <option value="">Select Origin</option>
                  {HUB_REGIONS.map(r => (
                    <optgroup key={r} label={r}>
                      {HUBS.filter(h => h.region === r).map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-neutral-400 block mb-1.5">Destination Hub</label>
                <select value={destHub} onChange={e => setDestHub(e.target.value)} className="smart-input">
                  <option value="">Select Destination</option>
                  {HUB_REGIONS.map(r => (
                    <optgroup key={r} label={r}>
                      {HUBS.filter(h => h.region === r).map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-neutral-400 block mb-1.5">Cargo Weight (kg)</label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={e => setWeightKg(Math.max(1, +e.target.value))}
                  className="smart-input"
                  min={1}
                  step={100}
                />
              </div>
              <button
                onClick={handleCalculate}
                disabled={!sourceHub || !destHub || sourceHub === destHub}
                className="btn-primary w-full py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Calculate All Routes
              </button>
            </div>
          </div>

          {/* Transport Modes */}
          <div className="space-y-3">
            {Object.entries(MODES).map(([mk, mode]) => (
              <ModeCard
                key={mk}
                mode={mode}
                mKey={mk}
                selected={selectedMode === mk}
                onClick={(k: string) => setSelectedMode(k as any)}
                result={results?.[mk]}
                maxCo2={maxCo2}
              />
            ))}
          </div>

          {/* AI Routing Button */}
          {results && (
            <button
              onClick={generateAIRouting}
              disabled={isGenRouting}
              className="btn-primary flex items-center justify-center gap-2 py-2.5"
            >
              {isGenRouting ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />}
              AI Route Recommendation
            </button>
          )}
        </motion.div>
      </div>

      {/* AI Routing Suggestion */}
      <AnimatePresence>
        {aiRouting && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Bot size={18} className="text-indigo-400" />
              <h3 className="text-base font-semibold text-white">AI Logistics Recommendation</h3>
              <Wind size={14} className="text-neutral-500 ml-auto" />
            </div>
            {isGenRouting ? (
              <div className="flex items-center gap-3 text-indigo-400 text-sm py-4">
                <Loader2 size={18} className="animate-spin" />
                <span className="animate-pulse">Analyzing route economics...</span>
              </div>
            ) : (
              <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">{aiRouting}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* CO2 Comparison */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <Leaf size={18} className="text-emerald-400" />
            <h3 className="text-base font-semibold text-white">Carbon Emission Comparison</h3>
            <span className="ml-auto text-xs text-neutral-500">for {weightKg}kg cargo over {distance?.toFixed(0)}km</span>
          </div>
          <div className="space-y-4">
            {Object.entries(MODES).map(([mk, mode]) => {
              const r = results[mk];
              const score = ecoScore(r.co2, maxCo2);
              return (
                <div key={mk} className="flex items-center gap-4">
                  <mode.icon size={18} style={{ color: mode.color }} className="shrink-0" />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-300">{mode.label}</span>
                      <span className="font-mono text-white">{r.co2} kg CO₂</span>
                    </div>
                    <ScoreBar value={Math.min(100, (r.co2 / maxCo2) * 100)} color={score > 60 ? '#10b981' : score > 30 ? '#f59e0b' : '#ef4444'} />
                  </div>
                  <div className="w-14 text-right text-xs font-mono" style={{ color: score > 60 ? '#10b981' : score > 30 ? '#f59e0b' : '#ef4444' }}>
                    Eco {score}
                  </div>
                </div>
              );
            })}
            <div className="mt-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-xs text-neutral-400">
              💡 Switching from Air to Sea freight for this route would save{' '}
              <span className="text-emerald-400 font-semibold">
                {(results.air.co2 - results.ship.co2).toFixed(1)} kg CO₂
              </span>{' '}
              — equivalent to planting ~{Math.round((results.air.co2 - results.ship.co2) / 0.02)} trees.
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
