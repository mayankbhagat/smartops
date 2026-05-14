// @ts-nocheck
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, DollarSign, Package, Zap, Bot, X, Loader2, Upload, Map, AlertTriangle, CheckCircle, BarChart2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import IndiaMap from '@/components/IndiaMap';
import CursorReactiveCard from '@/components/CursorReactiveCard';
import { useData } from '@/context/DataContext';

// ── Animated Counter ─────────────────────────────────────────
function AnimatedCounter({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    let start = 0;
    const step = Math.max(1, Math.ceil(value / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  if (Math.abs(display) >= 1e6) return <>{(display / 1e6).toFixed(1)}M</>;
  if (Math.abs(display) >= 1e3) return <>{(display / 1e3).toFixed(1)}K</>;
  return <>{display.toLocaleString()}</>;
}

// ── Default chart when no CSV uploaded ──
const defaultChartData = [
  { month: 'Jan', revenue: 4200, expenses: 2600 },
  { month: 'Feb', revenue: 5100, expenses: 2900 },
  { month: 'Mar', revenue: 3900, expenses: 3200 },
  { month: 'Apr', revenue: 6500, expenses: 3600 },
  { month: 'May', revenue: 8100, expenses: 4900 },
  { month: 'Jun', revenue: 9200, expenses: 4400 },
  { month: 'Jul', revenue: 11400, expenses: 5200 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-xs">
      <p className="font-semibold text-neutral-300 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-mono text-white">₹{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export default function DashboardHome() {
  const { setCsvRaw, setFileName } = useData();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [uploadedCSV, setUploadedCSV] = useState<string | null>(null);
  const [chartData, setChartData] = useState(defaultChartData);
  const [insightsData, setInsightsData] = useState<any[]>([]);
  const [inventoryRecs, setInventoryRecs] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── CSV Parsing helpers ──
  const toNum = (v: any) => parseFloat(String(v).replace(/[^0-9.-]/g, '')) || 0;

  const calcMetrics = (rows: any[]) => {
    if (!rows.length) return null;
    const hs = Object.keys(rows[0]);
    const find = (...ns: string[]) => hs.find(h => ns.some(n => h.includes(n))) || null;
    const revCol = find('revenue', 'sales', 'income');
    const expCol = find('expense', 'cost', 'spend');
    const totalRev = revCol ? rows.reduce((s, r) => s + toNum(r[revCol]), 0) : 0;
    const totalExp = expCol ? rows.reduce((s, r) => s + toNum(r[expCol]), 0) : 0;
    const margin = totalRev > 0 ? ((totalRev - totalExp) / totalRev * 100) : 0;
    const stockCol = find('stock', 'quantity', 'qty');
    const threshCol = find('threshold', 'min', 'reorder');
    const lowStock = stockCol ? rows.filter(r => {
      const s = toNum(r[stockCol]), t = threshCol ? toNum(r[threshCol]) : 10;
      return s > 0 && s <= t;
    }).length : 0;
    return { totalRev, totalExp, margin, lowStock };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      setUploadedCSV(text);
      setCsvRaw(text);
      setFileName(file.name);

      // Client-side quick metrics
      const lines = text.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'));
      const rows = lines.slice(1).map(l => {
        const vals = l.split(',');
        const row: any = {};
        headers.forEach((h, i) => { row[h] = (vals[i] || '').trim(); });
        return row;
      });
      const m = calcMetrics(rows);
      if (m) setMetrics(m);

      // Gemini analysis for chart + insights
      try {
        const res = await fetch('/api/analyze-csv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csvData: text }),
        });
        const data = await res.json();
        if (res.ok) {
          if (data.chartData?.length > 0) setChartData(data.chartData);
          if (data.insights) setInsightsData(data.insights);
          if (data.inventoryRecommendations) setInventoryRecs(data.inventoryRecommendations);
        }
      } catch (err) { console.error(err); }
      setIsAnalyzing(false);
    };
    reader.readAsText(file);
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setShowModal(true);
    setReportData(null);
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData: uploadedCSV }),
      });
      const data = await res.json();
      setReportData(data.report || `Error: ${data.error}`);
    } catch (err: any) {
      setReportData(`Failed to connect to AI: ${err.message}`);
    }
    setIsGenerating(false);
  };

  const fmt = (n: number) => {
    if (n >= 1e6) return `₹${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `₹${(n / 1e3).toFixed(1)}K`;
    return `₹${Math.round(n).toLocaleString()}`;
  };

  const displayMetrics = metrics
    ? [
        { title: 'Total Revenue', value: fmt(metrics.totalRev), trend: 'From uploaded data', positive: true, icon: <DollarSign size={18} className="text-emerald-400" /> },
        { title: 'Profit Margin', value: `${metrics.margin.toFixed(1)}%`, trend: metrics.margin > 15 ? 'Healthy' : 'Below target', positive: metrics.margin > 15, icon: <Activity size={18} className="text-indigo-400" /> },
        { title: 'Low Stock Items', value: String(metrics.lowStock), trend: metrics.lowStock > 0 ? 'Need restock' : 'All good', positive: metrics.lowStock === 0, icon: <Package size={18} className="text-orange-400" /> },
        { title: 'Total Expenses', value: fmt(metrics.totalExp), trend: 'From uploaded data', positive: false, icon: <TrendingDown size={18} className="text-red-400" /> },
      ]
    : [
        { title: 'Total Revenue', value: '—', trend: 'Upload CSV to calculate', positive: true, icon: <DollarSign size={18} className="text-emerald-400" /> },
        { title: 'Profit Margin', value: '—', trend: 'Upload CSV to calculate', positive: true, icon: <Activity size={18} className="text-indigo-400" /> },
        { title: 'Low Stock Items', value: '—', trend: 'Upload CSV to calculate', positive: true, icon: <Package size={18} className="text-orange-400" /> },
        { title: 'Est. Expenses', value: '—', trend: 'Upload CSV to calculate', positive: false, icon: <TrendingDown size={18} className="text-red-400" /> },
      ];

  const iv = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const ii = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 22 } } };

  return (
    <motion.div variants={iv} initial="hidden" animate="show" className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1 variants={ii} className="text-4xl font-extrabold tracking-tight gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Overview
          </motion.h1>
          <motion.p variants={ii} className="text-neutral-400 mt-1">
            {uploadedCSV ? 'Real-time analysis of your uploaded business data.' : "Upload a CSV to see real business intelligence."}
          </motion.p>
        </div>

        <motion.div variants={ii} className="flex items-center gap-3">
          <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-medium hover:bg-indigo-500/20 transition-colors text-sm"
          >
            {isAnalyzing ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            {isAnalyzing ? 'Analyzing...' : 'Upload CSV'}
          </button>
          <button
            onClick={handleGenerateReport}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors text-sm"
          >
            {isGenerating ? <Loader2 size={15} className="animate-spin" /> : <BarChart2 size={15} />}
            Generate Report
          </button>
          <Link href="/dashboard/logs">
            <button className="flex items-center gap-2 px-5 py-2 rounded-xl text-white font-medium text-sm" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}>
              <Zap size={15} className="text-yellow-300" /> Run AI Agents
            </button>
          </Link>
        </motion.div>
      </div>

      {/* Upload CTA (when no CSV) */}
      {!uploadedCSV && (
        <motion.div
          variants={ii}
          onClick={() => fileInputRef.current?.click()}
          className="glass-card p-5 border-2 border-dashed border-white/8 hover:border-indigo-500/30 transition-all cursor-pointer flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
            <Upload size={22} className="text-indigo-400" />
          </div>
          <div>
            <p className="font-semibold text-white text-sm">Upload your business CSV to unlock real analytics</p>
            <p className="text-xs text-neutral-500 mt-0.5">Auto-detects revenue, expenses, inventory, sales, dates, and categories</p>
          </div>
          <div className="ml-auto text-xs badge-info px-3 py-1 rounded-full shrink-0">Click to upload</div>
        </motion.div>
      )}

      {/* Metric Cards */}
      <motion.div variants={iv} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayMetrics.map((m, i) => (
          <motion.div key={i} variants={ii}>
            <CursorReactiveCard glowColor="rgba(99,102,241,0.2)" className="glass-card p-6 h-full flex flex-col justify-between border-white/10 rounded-2xl">
              <div className="flex justify-between items-start mb-6">
                <p className="text-sm font-medium text-neutral-400">{m.title}</p>
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 shadow-inner backdrop-blur-md">
                  {m.icon}
                </div>
              </div>
              <div>
                <div className="flex items-end gap-3 mb-2">
                  <h4 className="text-4xl font-extrabold text-white tracking-tight">{m.value}</h4>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg ${m.positive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                  {m.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {m.trend}
                </span>
              </div>
            </CursorReactiveCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Chart + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={ii} className="lg:col-span-2 glass-card p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.1), transparent)' }} />
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-white">Revenue vs Expenses</h3>
            {uploadedCSV && <span className="text-xs badge-success px-2 py-0.5 rounded-full">Live Data</span>}
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" stroke="#555" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#555" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#gR)" />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#gE)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={ii} className="flex flex-col h-full">
          <CursorReactiveCard glowColor="rgba(168,85,247,0.15)" className="glass-card p-6 flex flex-col h-full border-white/10 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                <Bot size={20} className="text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">AI Intelligence</h3>
              {insightsData.length > 0 && <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-full flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" /> Live</span>}
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
              {(insightsData.length > 0 ? insightsData : [
                { type: 'warning', title: 'Awaiting Data', desc: 'Upload your business CSV to generate real-time operational insights.' },
                { type: 'info', title: 'Agentic Pipeline', desc: '7 parallel AI agents ready to analyze revenue, logistics, and inventory.' },
                { type: 'success', title: 'Deterministic Analysis', desc: 'All metrics are computed mathematically from raw uploaded data.' },
              ]).map((item, idx) => (
                <InsightItem key={idx} type={item.type} title={item.title} desc={item.desc} />
              ))}
            </div>
          </CursorReactiveCard>
        </motion.div>
      </div>

      {/* Inventory Recommendations */}
      {inventoryRecs.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Package size={18} className="text-emerald-400" />
            <h3 className="text-base font-semibold text-white">AI Inventory Strategy</h3>
            <span className="ml-auto badge-success text-xs px-2 py-0.5 rounded-full">{inventoryRecs.length} recommendations</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {inventoryRecs.map((rec, i) => (
              <div key={i} className="p-4 rounded-xl border border-white/5 bg-black/30 hover:border-indigo-500/20 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-white text-sm">{rec.productName}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    rec.action === 'Increase Stock' ? 'badge-info' : rec.action === 'Introduce New Line' ? 'badge-success' : 'badge-warning'
                  }`}>{rec.action}</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed mb-3 line-clamp-3">{rec.reasoning}</p>
                <div className="flex justify-between pt-2 border-t border-white/5 text-xs font-medium">
                  <span className="text-emerald-400">+{rec.estimatedProfitGainPercent}% profit</span>
                  <span className="text-red-400">-{rec.estimatedLossRiskPercent}% risk</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* India Map */}
      <motion.div variants={ii} className="glass-card p-6 h-[420px] flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.08), transparent)' }} />
        <div className="flex items-center gap-2 mb-4 relative z-10">
          <Map size={18} className="text-indigo-400" />
          <h3 className="text-base font-semibold text-white">Live Logistics Nodes</h3>
          <Link href="/dashboard/logistics" className="ml-auto text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
            Full Map →
          </Link>
        </div>
        <div className="flex-1 relative z-10">
          <IndiaMap />
        </div>
      </motion.div>

      {/* AI Report Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                    <Bot size={18} className="text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">AI Strategy Report</h3>
                    <p className="text-xs text-neutral-500">Gemini 2.5 Flash Analysis</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/8 rounded-lg transition-colors">
                  <X size={18} className="text-neutral-400" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4 text-indigo-400">
                    <Loader2 size={36} className="animate-spin" />
                    <p className="text-sm animate-pulse">Analyzing data and generating strategy...</p>
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-neutral-300">{reportData}</pre>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function InsightItem({ type, title, desc }: any) {
  const styles: any = {
    warning: {
      bg: 'bg-orange-500/5', border: 'border-orange-500/20', text: 'text-orange-400',
      icon: <AlertTriangle size={14} className="text-orange-400" />
    },
    info: {
      bg: 'bg-indigo-500/5', border: 'border-indigo-500/20', text: 'text-indigo-400',
      icon: <Zap size={14} className="text-indigo-400" />
    },
    success: {
      bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', text: 'text-emerald-400',
      icon: <CheckCircle size={14} className="text-emerald-400" />
    },
  };
  const s = styles[type] || styles.info;
  
  return (
    <div className={`p-4 rounded-xl border ${s.border} ${s.bg} transition-all hover:bg-white/[0.04] backdrop-blur-sm group relative overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      <div className="flex items-center gap-2 mb-1.5">
        {s.icon}
        <span className={`text-sm font-bold tracking-wide ${s.text}`}>{title}</span>
      </div>
      <p className="text-[13px] text-neutral-400 leading-relaxed font-medium pl-6">{desc}</p>
    </div>
  );
}
