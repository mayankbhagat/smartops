// @ts-nocheck
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useCallback, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadialBarChart, RadialBar, Cell
} from 'recharts';
import { Upload, Package, AlertTriangle, TrendingDown, TrendingUp, Bot, Loader2, X, Info, CheckCircle, Zap, Activity } from 'lucide-react';
import CursorReactiveCard from '@/components/CursorReactiveCard';
import { useData } from '@/context/DataContext';

// ── CSV Parser ────────────────────────────────────────────────
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'));
  return lines.slice(1).map(line => {
    const vals = line.split(',');
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = (vals[i] || '').trim(); });
    return row;
  });
}
function toNum(v: any) { return parseFloat(String(v).replace(/[^0-9.-]/g, '')) || 0; }

// ── Inventory Analytics Engine ────────────────────────────────
function analyzeInventory(rows: Record<string, string>[]) {
  if (!rows.length) return null;
  const hs = Object.keys(rows[0]);
  const find = (...ns: string[]) => hs.find(h => ns.some(n => h.includes(n))) || null;

  const nameCol = find('name', 'product', 'item', 'sku', 'title');
  const stockCol = find('stock', 'quantity', 'qty', 'units', 'on_hand');
  const salesCol = find('sales', 'sold', 'revenue', 'units_sold');
  const priceCol = find('price', 'cost', 'value', 'unit_price');
  const catCol = find('category', 'type', 'group');
  const threshCol = find('threshold', 'min', 'reorder', 'minimum');

  const items = rows.map(r => ({
    name: nameCol ? r[nameCol] || 'Unknown' : 'Item',
    stock: stockCol ? toNum(r[stockCol]) : 0,
    sales: salesCol ? toNum(r[salesCol]) : 0,
    price: priceCol ? toNum(r[priceCol]) : 0,
    category: catCol ? r[catCol] || 'General' : 'General',
    threshold: threshCol ? toNum(r[threshCol]) : 10,
  }));

  const outOfStock = items.filter(i => i.stock === 0);
  const lowStock = items.filter(i => i.stock > 0 && i.stock <= i.threshold);
  const deadStock = items.filter(i => i.stock > 0 && i.sales === 0);
  const inStock = items.filter(i => i.stock > i.threshold && i.sales > 0);

  // Turnover: sales / stock (higher = better)
  const itemsWithTurnover = items.map(i => ({
    ...i,
    turnover: i.stock > 0 ? (i.sales / i.stock) : 0,
    value: i.stock * i.price,
    status: i.stock === 0 ? 'out' : i.stock <= i.threshold ? 'low' : i.sales === 0 ? 'dead' : 'ok',
  }));

  // Category summary
  const catMap: Record<string, { stock: number; sales: number; items: number }> = {};
  items.forEach(i => {
    if (!catMap[i.category]) catMap[i.category] = { stock: 0, sales: 0, items: 0 };
    catMap[i.category].stock += i.stock;
    catMap[i.category].sales += i.sales;
    catMap[i.category].items++;
  });
  const categoryData = Object.entries(catMap).map(([cat, v]) => ({
    name: cat.length > 12 ? cat.slice(0, 12) + '…' : cat,
    stock: v.stock,
    sales: v.sales,
    items: v.items,
  }));

  // Risk score: 0-100 (high = bad)
  const riskScore = Math.min(100, Math.round(
    (outOfStock.length / items.length) * 40 +
    (lowStock.length / items.length) * 30 +
    (deadStock.length / items.length) * 30
  ));

  // Health score (inverse of risk, with turnover bonus)
  const avgTurnover = itemsWithTurnover.reduce((s, i) => s + i.turnover, 0) / Math.max(items.length, 1);
  const healthScore = Math.min(100, Math.max(0, Math.round(100 - riskScore + Math.min(20, avgTurnover * 5))));

  const totalStockValue = items.reduce((s, i) => s + i.stock * i.price, 0);
  const deadStockValue = deadStock.reduce((s, i) => s + i.stock * i.price, 0);

  // Top movers (high turnover)
  const topMovers = [...itemsWithTurnover].sort((a, b) => b.turnover - a.turnover).slice(0, 5);
  // Slow movers
  const slowMovers = [...itemsWithTurnover].filter(i => i.sales > 0).sort((a, b) => a.turnover - b.turnover).slice(0, 5);

  return {
    items: itemsWithTurnover,
    total: items.length,
    outOfStock: outOfStock.length,
    lowStock: lowStock.length,
    deadStock: deadStock.length,
    inStock: inStock.length,
    riskScore,
    healthScore,
    avgTurnover,
    totalStockValue,
    deadStockValue,
    categoryData,
    topMovers,
    slowMovers,
  };
}

// ── Components ────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: any = {
    ok: { cls: 'badge-success', label: 'In Stock' },
    low: { cls: 'badge-warning', label: 'Low Stock' },
    out: { cls: 'badge-danger', label: 'Out of Stock' },
    dead: { cls: 'badge-info', label: 'Dead Stock' },
  };
  const s = map[status] || map.ok;
  return <span className={`${s.cls} text-xs font-medium px-2 py-0.5 rounded-full`}>{s.label}</span>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-xs space-y-1">
      <p className="font-semibold text-neutral-300 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-mono text-white">{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

// ── Main ─────────────────────────────────────────────────────
export default function InventoryView() {
  const { csvRaw, fileName, setCsvRaw, setFileName } = useData();
  const [inv, setInv] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiRecs, setAiRecs] = useState<any[]>([]);
  const [isGenRec, setIsGenRec] = useState(false);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setFileName(file.name);
    const text = await file.text();
    setCsvRaw(text);
    const rows = parseCSV(text);
    setInv(analyzeInventory(rows));
    setIsLoading(false);
  }, [setFileName, setCsvRaw]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.name.endsWith('.csv')) handleFile(f);
  };

  const generateAIRecs = useCallback(async (data: string) => {
    if (!data) return;
    setIsGenRec(true);
    try {
      const res = await fetch('/api/analyze-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData: data }),
      });
      const d = await res.json();
      if (d.inventoryRecommendations) setAiRecs(d.inventoryRecommendations);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenRec(false);
    }
  }, []);

  // Auto-analyze if global CSV exists on mount or change
  useEffect(() => {
    if (csvRaw && !inv && !isLoading) {
      setIsLoading(true);
      const rows = parseCSV(csvRaw);
      setInv(analyzeInventory(rows));
      setIsLoading(false);
      // Automatically request suggestions based on user request
      if (aiRecs.length === 0 && !isGenRec) {
        generateAIRecs(csvRaw);
      }
    }
  }, [csvRaw, inv, isLoading, aiRecs.length, isGenRec, generateAIRecs]);

  const fmtVal = (n: number) => {
    if (n >= 1e6) return `₹${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `₹${(n / 1e3).toFixed(1)}K`;
    return `₹${Math.round(n).toLocaleString()}`;
  };

  const iv = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
  const ii = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 22 } } };

  return (
    <motion.div variants={iv} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1 variants={ii} className="text-3xl font-bold text-white">Inventory Intelligence</motion.h1>
          <motion.p variants={ii} className="text-neutral-400 mt-1">
            {inv ? `${inv.total} items analyzed from ${fileName}` : 'Upload inventory CSV for AI-driven analysis.'}
          </motion.p>
        </div>
        {inv && (
          <motion.div variants={ii} className="flex gap-3">
            <button onClick={() => generateAIRecs(csvRaw!)} disabled={isGenRec || !csvRaw} className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm disabled:opacity-60">
              {isGenRec ? <Loader2 size={15} className="animate-spin" /> : <Bot size={15} />}
              Regenerate AI Strategy
            </button>
            <button onClick={() => { setInv(null); setCsvRaw(null); setFileName(null); setAiRecs([]); }} className="btn-ghost text-sm px-4 py-2.5 flex items-center gap-2">
              <Upload size={14} /> New File
            </button>
          </motion.div>
        )}
      </div>

      {/* Upload */}
      {!inv && (
        <motion.div
          variants={ii}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="glass-card p-14 flex flex-col items-center text-center cursor-pointer border-2 border-dashed border-white/10 hover:border-indigo-500/40 transition-all"
        >
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          {isLoading ? (
            <><Loader2 size={40} className="text-indigo-400 animate-spin mb-4" /><p className="text-neutral-400">Analyzing inventory...</p></>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-5">
                <Package size={28} className="text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Drop Inventory CSV</h3>
              <p className="text-sm text-neutral-500 mb-4">Auto-detects: product name, stock, sales, price, category, threshold</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['name', 'stock', 'sales', 'price', 'category'].map(c => (
                  <span key={c} className="px-3 py-1 text-xs rounded-full badge-info font-mono">{c}</span>
                ))}
              </div>
            </>
          )}
        </motion.div>
      )}

      {inv && (
        <>
          {/* KPI Cards */}
          <motion.div variants={iv} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total SKUs', value: inv.total, icon: Package, color: '#6366f1', sub: 'Products tracked' },
              { label: 'Low / Out of Stock', value: `${inv.lowStock + inv.outOfStock}`, icon: AlertTriangle, color: '#f59e0b', sub: `${inv.outOfStock} out, ${inv.lowStock} low` },
              { label: 'Dead Stock Items', value: inv.deadStock, icon: TrendingDown, color: '#ef4444', sub: fmtVal(inv.deadStockValue) + ' at risk' },
              { label: 'Health Score', value: `${inv.healthScore}/100`, icon: CheckCircle, color: inv.healthScore >= 65 ? '#10b981' : '#f59e0b', sub: inv.healthScore >= 65 ? 'Good' : 'Needs attention' },
            ].map((card, i) => (
              <motion.div key={i} variants={ii}>
                <CursorReactiveCard glowColor={`${card.color}20`} className="glass-card p-6 h-full flex flex-col justify-between border-white/10 rounded-2xl">
                  <div className="flex justify-between items-start mb-6">
                    <p className="text-sm font-medium text-neutral-400">{card.label}</p>
                    <div className="p-2.5 rounded-xl border border-white/10 shadow-inner backdrop-blur-md" style={{ background: `${card.color}15` }}>
                      <card.icon size={20} style={{ color: card.color }} />
                    </div>
                  </div>
                  <div>
                    <div className="text-4xl font-extrabold text-white tracking-tight mb-2">{card.value}</div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{card.sub}</p>
                  </div>
                </CursorReactiveCard>
              </motion.div>
            ))}
          </motion.div>

          {/* Category Chart + Stock Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {inv.categoryData.length > 0 && (
              <motion.div variants={ii} className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Stock by Category</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={inv.categoryData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="name" stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="stock" name="Stock" fill="#6366f1" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="sales" name="Sales" fill="#10b981" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {/* Top Movers */}
            <motion.div variants={ii} className="flex flex-col h-full">
              <CursorReactiveCard glowColor="rgba(245,158,11,0.15)" className="glass-card p-6 h-full flex flex-col border-white/10 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                    <Zap size={20} className="text-yellow-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Top Moving Inventory</h3>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
                  {inv.topMovers.slice(0, 5).map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{item.name}</p>
                        <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">{item.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono font-bold text-emerald-400">{item.turnover.toFixed(2)}x</p>
                        <p className="text-[10px] uppercase font-bold text-neutral-600 tracking-wider">turnover</p>
                      </div>
                      <div className="w-20 hidden sm:block">
                        <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/10">
                          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000 group-hover:shadow-[0_0_8px_rgba(168,85,247,0.5)]" style={{ width: `${Math.min(100, item.turnover * 20)}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CursorReactiveCard>
            </motion.div>
          </div>

          {/* Full Stock Table */}
          <motion.div variants={ii} className="glass-card overflow-hidden">
            <div className="p-5 border-b border-white/6">
              <h3 className="text-base font-semibold text-white">Full Stock Report ({inv.total} items)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-neutral-400">
                <thead className="bg-white/3 text-neutral-300 text-xs">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium">Product</th>
                    <th className="px-5 py-3 text-left font-medium">Category</th>
                    <th className="px-5 py-3 text-right font-medium">Stock</th>
                    <th className="px-5 py-3 text-right font-medium">Sales</th>
                    <th className="px-5 py-3 text-right font-medium">Turnover</th>
                    <th className="px-5 py-3 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/4">
                  {inv.items.slice(0, 20).map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-white/2 transition-colors">
                      <td className="px-5 py-3 font-medium text-white">{item.name}</td>
                      <td className="px-5 py-3">{item.category}</td>
                      <td className="px-5 py-3 text-right font-mono">{item.stock.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right font-mono">{item.sales.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right">
                        <span className={`font-mono ${item.turnover > 1 ? 'text-emerald-400' : item.turnover > 0 ? 'text-yellow-400' : 'text-neutral-600'}`}>
                          {item.turnover.toFixed(2)}x
                        </span>
                      </td>
                      <td className="px-5 py-3"><StatusBadge status={item.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* AI Recommendations */}
          {aiRecs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <CursorReactiveCard glowColor="rgba(16,185,129,0.15)" className="glass-card p-8 border-emerald-500/20 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.1), transparent)' }} />
                
                <div className="flex items-center gap-3 mb-8 relative z-10">
                  <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    <Bot size={24} className="text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">AI Inventory Strategy</h3>
                  <span className="badge-success text-xs font-bold px-3 py-1 rounded-full ml-auto border border-emerald-500/30 shadow-inner">
                    {aiRecs.length} actionable insights
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                  {aiRecs.map((rec: any, i: number) => (
                    <div key={i} className="p-6 rounded-2xl border border-white/10 bg-black/40 hover:bg-black/60 hover:border-emerald-500/30 transition-all duration-300 group shadow-lg">
                      <div className="flex items-start justify-between mb-4">
                        <span className="font-bold text-white text-base leading-tight pr-4">{rec.productName}</span>
                        <span className={`shrink-0 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md border ${rec.action === 'Increase Stock' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : rec.action === 'Introduce New Line' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                          {rec.action}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-400 mb-6 leading-relaxed font-medium">{rec.reasoning}</p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className="flex items-center gap-1.5">
                          <TrendingUp size={14} className="text-emerald-400" />
                          <span className="text-sm font-bold text-emerald-400">+{rec.estimatedProfitGainPercent}%</span>
                          <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Gain</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle size={14} className="text-rose-400" />
                          <span className="text-sm font-bold text-rose-400">-{rec.estimatedLossRiskPercent}%</span>
                          <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Risk</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CursorReactiveCard>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
