// @ts-nocheck
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, LineChart, Line, Legend
} from 'recharts';
import { Upload, TrendingUp, TrendingDown, DollarSign, Activity, Bot, Loader2, X, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Zap, Target } from 'lucide-react';
import { useEffect } from 'react';

// ── Animated Counter ────────────────────────────────────────────
function AnimatedCounter({ value, prefix = '', suffix = '', duration = 1500 }: { value: number; prefix?: string; suffix?: string; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.max(1, Math.ceil(value / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  const formatted = Math.abs(display) >= 1e6 ? `${(display / 1e6).toFixed(1)}M` : Math.abs(display) >= 1e3 ? `${(display / 1e3).toFixed(1)}K` : display.toLocaleString();
  return <span>{prefix}{formatted}{suffix}</span>;
}

// ── Real CSV Parser ───────────────────────────────────────────
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

function toNum(v: any): number {
  if (typeof v === 'number') return v;
  return parseFloat(String(v).replace(/[^0-9.-]/g, '')) || 0;
}

// ── Real Analytics Calculator ────────────────────────────────
function calcAnalytics(rows: Record<string, string>[]) {
  if (!rows.length) return null;

  const headers = Object.keys(rows[0]);
  const findCol = (...names: string[]) => headers.find(h => names.some(n => h.includes(n))) || null;

  const revCol = findCol('revenue', 'sales', 'income', 'amount', 'total');
  const expCol = findCol('expense', 'cost', 'expenditure', 'spend');
  const dateCol = findCol('date', 'month', 'period', 'time');
  const catCol = findCol('category', 'type', 'product', 'item');

  const totalRevenue = revCol ? rows.reduce((s, r) => s + toNum(r[revCol]), 0) : 0;
  const totalExpenses = expCol ? rows.reduce((s, r) => s + toNum(r[expCol]), 0) : 0;
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Monthly aggregation
  const monthMap: Record<string, { revenue: number; expenses: number; count: number }> = {};
  rows.forEach(r => {
    let month = 'Data';
    if (dateCol) {
      const raw = r[dateCol] || '';
      // Try to parse month from date string
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        month = d.toLocaleString('default', { month: 'short' }) + ' ' + d.getFullYear();
      } else {
        // Use as-is or first 7 chars
        month = raw.slice(0, 7) || `Row`;
      }
    }
    if (!monthMap[month]) monthMap[month] = { revenue: 0, expenses: 0, count: 0 };
    monthMap[month].revenue += revCol ? toNum(r[revCol]) : 0;
    monthMap[month].expenses += expCol ? toNum(r[expCol]) : 0;
    monthMap[month].count++;
  });

  const chartData = Object.entries(monthMap)
    .slice(0, 12)
    .map(([month, v]) => ({
      month,
      revenue: Math.round(v.revenue),
      expenses: Math.round(v.expenses),
      profit: Math.round(v.revenue - v.expenses),
      margin: v.revenue > 0 ? Math.round((v.revenue - v.expenses) / v.revenue * 100) : 0,
    }));

  // Category breakdown
  const catMap: Record<string, number> = {};
  if (catCol && revCol) {
    rows.forEach(r => {
      const cat = r[catCol] || 'Other';
      catMap[cat] = (catMap[cat] || 0) + toNum(r[revCol]);
    });
  }
  const categoryData = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value: Math.round(value) }));

  // Growth rate (last vs first month)
  const growthRate = chartData.length >= 2
    ? ((chartData[chartData.length - 1].revenue - chartData[0].revenue) / (chartData[0].revenue || 1)) * 100
    : 0;

  // Loss months
  const lossMonths = chartData.filter(d => d.profit < 0).length;

  // Health score: 0-100
  const healthScore = Math.max(0, Math.min(100,
    Math.round(50 + profitMargin * 1.5 + growthRate * 0.3 - lossMonths * 10)
  ));

  // Quarterly forecasting (simple trend-based projection)
  const avgMonthlyRev = chartData.length > 0 ? chartData.reduce((s, d) => s + d.revenue, 0) / chartData.length : 0;
  const avgMonthlyExp = chartData.length > 0 ? chartData.reduce((s, d) => s + d.expenses, 0) / chartData.length : 0;
  const monthlyGrowthFactor = growthRate > 0 ? 1 + (growthRate / 100 / chartData.length) : 0.98;

  const quarterlyProjections = [1, 2].map(q => {
    const factor = Math.pow(monthlyGrowthFactor, q * 3);
    const projRev = Math.round(avgMonthlyRev * 3 * factor);
    const projExp = Math.round(avgMonthlyExp * 3 * (1 + 0.02 * q)); // expenses grow slowly
    return {
      quarter: `Q+${q}`,
      revenue: projRev,
      expenses: projExp,
      profit: projRev - projExp,
      margin: projRev > 0 ? Math.round((projRev - projExp) / projRev * 100) : 0,
    };
  });

  // Loss recovery strategies (auto-generated from data patterns)
  const recoveryStrategies: string[] = [];
  if (profitMargin < 15) recoveryStrategies.push('Optimize pricing strategy — current margins are below the 15% target');
  if (lossMonths > 0) recoveryStrategies.push(`Investigate ${lossMonths} loss period(s) — likely expense spikes or seasonal dips`);
  if (growthRate < 0) recoveryStrategies.push('Revenue is declining — consider launching promotions or expanding product lines');
  if (totalExpenses > totalRevenue * 0.8) recoveryStrategies.push('Expenses consume >80% of revenue — audit operational costs for reduction');
  if (categoryData.length > 0) {
    const topCat = categoryData[0];
    const topPct = totalRevenue > 0 ? Math.round((topCat.value / totalRevenue) * 100) : 0;
    if (topPct > 60) recoveryStrategies.push(`Revenue is ${topPct}% dependent on "${topCat.name}" — diversify product categories`);
  }

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin,
    growthRate,
    lossMonths,
    healthScore,
    chartData,
    categoryData,
    quarterlyProjections,
    recoveryStrategies,
    rowCount: rows.length,
  };
}

// ── Custom Tooltip ─────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-xs space-y-1 min-w-[140px]">
      <p className="font-semibold text-neutral-300 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-mono text-white">
            {typeof p.value === 'number' && p.dataKey !== 'margin'
              ? `₹${p.value.toLocaleString()}`
              : `${p.value}%`}
          </span>
        </div>
      ))}
    </div>
  );
};

// ── Metric Card ────────────────────────────────────────────────
function MetricCard({ title, value, sub, isPositive, icon: Icon, color }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 metric-card"
    >
      <div className="flex justify-between items-start mb-3">
        <p className="text-sm text-neutral-400">{title}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center`} style={{ background: `${color}15` }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      {sub && (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${isPositive ? 'badge-success' : 'badge-danger'}`}>
          {sub}
        </span>
      )}
    </motion.div>
  );
}

// ── Main ───────────────────────────────────────────────────────
export default function AnalyticsView() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [showInsight, setShowInsight] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [csvRaw, setCsvRaw] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setFileName(file.name);
    const text = await file.text();
    setCsvRaw(text);
    const rows = parseCSV(text);
    const result = calcAnalytics(rows);
    setAnalytics(result);
    setIsLoading(false);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith('.csv')) handleFile(file);
  };

  const generateAIInsight = async () => {
    if (!csvRaw) return;
    setIsGeneratingInsight(true);
    setShowInsight(true);
    setAiInsight(null);
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData: csvRaw }),
      });
      const d = await res.json();
      setAiInsight(d.report || d.error);
    } catch (e: any) {
      setAiInsight('Failed to generate AI insight: ' + e.message);
    } finally {
      setIsGeneratingInsight(false);
    }
  };

  const fmt = (n: number) => {
    if (Math.abs(n) >= 1e6) return `₹${(n / 1e6).toFixed(1)}M`;
    if (Math.abs(n) >= 1e3) return `₹${(n / 1e3).toFixed(1)}K`;
    return `₹${Math.round(n).toLocaleString()}`;
  };

  const iv = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const ii = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 22 } } };

  return (
    <motion.div variants={iv} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1 variants={ii} className="text-3xl font-bold text-white">Advanced Analytics</motion.h1>
          <motion.p variants={ii} className="text-neutral-400 mt-1">
            {analytics ? `Analyzing ${analytics.rowCount} records from ${fileName}` : 'Upload your business CSV to generate real financial analysis.'}
          </motion.p>
        </div>
        {analytics && (
          <motion.button
            variants={ii}
            onClick={generateAIInsight}
            className="btn-primary flex items-center gap-2 px-5 py-2.5"
          >
            {isGeneratingInsight ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />}
            Generate AI Strategy Report
          </motion.button>
        )}
      </div>

      {/* Upload Zone */}
      {!analytics && (
        <motion.div
          variants={ii}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="glass-card p-14 flex flex-col items-center justify-center text-center cursor-pointer border-2 border-dashed border-white/10 hover:border-indigo-500/40 transition-all"
        >
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          {isLoading ? (
            <><Loader2 size={40} className="text-indigo-400 animate-spin mb-4" /><p className="text-neutral-400">Parsing CSV...</p></>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-5" style={{ boxShadow: '0 0 20px rgba(99,102,241,0.2)' }}>
                <Upload size={28} className="text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Drop your CSV here</h3>
              <p className="text-sm text-neutral-500 mb-4">or click to browse. Columns auto-detected.</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['date', 'revenue', 'expenses', 'category', 'sales'].map(col => (
                  <span key={col} className="px-3 py-1 text-xs rounded-full badge-info font-mono">{col}</span>
                ))}
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* Metrics */}
      {analytics && (
        <>
          <motion.div variants={iv} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="Total Revenue" value={fmt(analytics.totalRevenue)} sub={`+${analytics.growthRate.toFixed(1)}% growth`} isPositive={analytics.growthRate >= 0} icon={DollarSign} color="#10b981" />
            <MetricCard title="Total Expenses" value={fmt(analytics.totalExpenses)} sub={`${analytics.lossMonths} loss month${analytics.lossMonths !== 1 ? 's' : ''}`} isPositive={analytics.lossMonths === 0} icon={TrendingDown} color="#ef4444" />
            <MetricCard title="Net Profit" value={fmt(analytics.netProfit)} sub={`${analytics.profitMargin.toFixed(1)}% margin`} isPositive={analytics.netProfit >= 0} icon={TrendingUp} color={analytics.netProfit >= 0 ? '#10b981' : '#ef4444'} />
            <MetricCard title="Business Health" value={`${analytics.healthScore}/100`} sub={analytics.healthScore >= 70 ? 'Healthy' : analytics.healthScore >= 40 ? 'Moderate Risk' : 'Critical'} isPositive={analytics.healthScore >= 60} icon={Activity} color="#6366f1" />
          </motion.div>

          {/* Revenue vs Expenses Chart */}
          {analytics.chartData.length > 0 && (
            <motion.div variants={ii} className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Revenue vs Expenses</h3>
                <span className="text-xs text-neutral-500">{analytics.chartData.length} periods</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.chartData} margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gPro" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="month" stroke="#555" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#555" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'K' : v}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12, color: '#888' }} />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#gRev)" />
                    <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#gExp)" />
                    <Area type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#gPro)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Category + Margin Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analytics.categoryData.length > 0 && (
              <motion.div variants={ii} className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Revenue by Category</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.categoryData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="name" stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'K' : v}`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" name="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {analytics.chartData.length > 0 && (
              <motion.div variants={ii} className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Profit Margin Trend</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="month" stroke="#555" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#555" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="margin" name="Margin" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: '#f59e0b', r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </div>

          {/* Key findings */}
          <motion.div variants={ii} className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Key Financial Findings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { ok: analytics.profitMargin > 15, text: `Profit margin is ${analytics.profitMargin.toFixed(1)}% — ${analytics.profitMargin > 15 ? 'healthy' : 'needs improvement (target > 15%)'}` },
                { ok: analytics.growthRate > 0, text: `Revenue growth: ${analytics.growthRate > 0 ? '+' : ''}${analytics.growthRate.toFixed(1)}% ${analytics.growthRate > 0 ? 'vs baseline period' : '— declining trend detected'}` },
                { ok: analytics.lossMonths === 0, text: analytics.lossMonths === 0 ? 'No loss months detected — consistent profitability' : `${analytics.lossMonths} loss month(s) detected — investigate expense spikes` },
                { ok: analytics.healthScore >= 60, text: `Business health score: ${analytics.healthScore}/100 — ${analytics.healthScore >= 70 ? 'Strong' : analytics.healthScore >= 50 ? 'Moderate' : 'Critical attention needed'}` },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: f.ok ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)', border: `1px solid ${f.ok ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}` }}>
                  {f.ok ? <CheckCircle size={16} className="text-emerald-400 mt-0.5 shrink-0" /> : <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />}
                  <p className="text-sm text-neutral-300">{f.text}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quarterly Projections */}
          {analytics.quarterlyProjections?.length > 0 && (
            <motion.div variants={ii} className="glass-card p-6">
              <div className="flex items-center gap-2 mb-6">
                <Zap size={18} className="text-orange-400" />
                <h3 className="text-lg font-semibold text-white">Quarterly Revenue Projections</h3>
                <span className="ml-auto text-xs badge-warning px-2 py-0.5 rounded-full">AI Forecast</span>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.quarterlyProjections} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="quarter" stroke="#555" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#555" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'K' : v}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12, color: '#888' }} />
                    <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="profit" name="Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {analytics.quarterlyProjections.map((q: any, i: number) => (
                  <div key={i} className="p-3 rounded-xl bg-black/30 border border-white/5">
                    <p className="text-xs text-neutral-500 mb-1">{q.quarter} Projection</p>
                    <p className="text-lg font-bold text-white">₹<AnimatedCounter value={q.revenue} /></p>
                    <p className="text-xs mt-1"><span className={q.margin >= 15 ? 'text-emerald-400' : 'text-red-400'}>{q.margin}% margin</span></p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Loss Recovery Strategies */}
          {analytics.recoveryStrategies?.length > 0 && (
            <motion.div variants={ii} className="glass-card p-6">
              <div className="flex items-center gap-2 mb-5">
                <Target size={18} className="text-red-400" />
                <h3 className="text-lg font-semibold text-white">Loss Recovery Strategies</h3>
                <span className="ml-auto text-xs badge-danger px-2 py-0.5 rounded-full">{analytics.recoveryStrategies.length} actions needed</span>
              </div>
              <div className="space-y-3">
                {analytics.recoveryStrategies.map((s: string, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/15">
                    <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-red-400">{i + 1}</span>
                    </div>
                    <p className="text-sm text-neutral-300 leading-relaxed">{s}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Re-upload button */}
          <motion.div variants={ii} className="flex justify-end">
            <button onClick={() => { setAnalytics(null); setFileName(null); setCsvRaw(null); setAiInsight(null); }} className="btn-ghost flex items-center gap-2 text-sm">
              <Upload size={14} /> Upload Different File
            </button>
          </motion.div>
        </>
      )}

      {/* AI Insight Modal */}
      <AnimatePresence>
        {showInsight && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/8">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                    <Bot size={18} className="text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">AI Strategy Report</h3>
                    <p className="text-xs text-neutral-500">Powered by Gemini 2.5 Flash</p>
                  </div>
                </div>
                <button onClick={() => setShowInsight(false)} className="p-2 hover:bg-white/8 rounded-lg transition-colors">
                  <X size={18} className="text-neutral-400" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                {isGeneratingInsight ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4 text-indigo-400">
                    <Loader2 size={36} className="animate-spin" />
                    <p className="text-sm animate-pulse">AI agents analyzing your financial data...</p>
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-neutral-300">{aiInsight}</pre>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
