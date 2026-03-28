// @ts-nocheck
'use client';

import { motion, Variants } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, DollarSign, Package, Zap, Bot, X, Loader2, Upload, Map } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import { useState, useRef } from 'react';
import IndiaMap from '@/components/IndiaMap';

const revenueData = [
  { month: 'Jan', revenue: 4000, expenses: 2400 },
  { month: 'Feb', revenue: 5000, expenses: 2800 },
  { month: 'Mar', revenue: 3800, expenses: 3100 },
  { month: 'Apr', revenue: 6200, expenses: 3500 },
  { month: 'May', revenue: 7800, expenses: 4800 },
  { month: 'Jun', revenue: 8500, expenses: 4200 },
  { month: 'Jul', revenue: 10231, expenses: 5100 },
];

export default function DashboardHome() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [uploadedCSV, setUploadedCSV] = useState<string | null>(null);

  const [chartData, setChartData] = useState(revenueData);
  const [insightsData, setInsightsData] = useState<any[]>([]);
  const [inventoryRecommendations, setInventoryRecommendations] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzingCSV, setIsAnalyzingCSV] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzingCSV(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      setUploadedCSV(text);
      try {
        const res = await fetch('/api/analyze-csv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csvData: text })
        });
        const data = await res.json();
        if (res.ok) {
          if (data.chartData?.length > 0) setChartData(data.chartData);
          if (data.insights) setInsightsData(data.insights);
          if (data.inventoryRecommendations) setInventoryRecommendations(data.inventoryRecommendations);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsAnalyzingCSV(false);
      }
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
        body: JSON.stringify({ csvData: uploadedCSV })
      });
      const data = await res.json();
      if (res.ok) setReportData(data.report);
      else setReportData(`Error: ${data.error}`);
    } catch (err: any) {
      setReportData(`Failed to connect to AI Brain: ${err.message}`);
    }
    setIsGenerating(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1 variants={itemVariants} className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Overview
          </motion.h1>
          <motion.p variants={itemVariants} className="text-neutral-400 mt-1">Here's what's happening with your business today.</motion.p>
        </div>
        
        <motion.div variants={itemVariants} className="flex items-center gap-3">
          <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium hover:bg-blue-500/20 transition-colors hidden md:flex items-center gap-2"
          >
            {isAnalyzingCSV ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            Upload CSV
          </button>
          
          <button 
            onClick={handleGenerateReport}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors hidden md:flex items-center gap-2"
          >
            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : null}
            Generate Report
          </button>
          <Link href="/dashboard/logs">
            <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-shadow flex items-center gap-2">
              <Zap size={16} className="text-yellow-300" />
              Run AI Agents
            </button>
          </Link>
        </motion.div>
      </div>

      {/* Metrics Grid */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Revenue" 
          value="$45,231" 
          trend="+12.5%" 
          isPositive={true} 
          icon={<DollarSign size={20} className="text-emerald-400" />} 
        />
        <MetricCard 
          title="Profit Margin" 
          value="24.8%" 
          trend="+2.1%" 
          isPositive={true} 
          icon={<Activity size={20} className="text-blue-400" />} 
        />
        <MetricCard 
          title="Low Stock Items" 
          value="12" 
          trend="-3" 
          isPositive={true} 
          icon={<Package size={20} className="text-orange-400" />} 
        />
        <MetricCard 
          title="Estimated Expenses" 
          value="$32,040" 
          trend="+5.4%" 
          isPositive={false} 
          icon={<TrendingDown size={20} className="text-red-400" />} 
        />
      </motion.div>

      {/* Charts & Insights Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Placeholder for Revenue Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-6 h-96 flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-blue-500/20 transition-all duration-700"></div>
          <h3 className="text-lg font-semibold text-white mb-4">Revenue vs Expenses</h3>
          <div className="flex-1 w-full h-full mt-4">
            <ResponsiveContainer width="100%" height="100%" minHeight={250}>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIndexRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorIndexRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* AI Copilot Teaser / Recent Insights */}
        <motion.div variants={itemVariants} className="glass-card p-6 h-96 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Bot size={20} className="text-purple-400" />
            <h3 className="text-lg font-semibold text-white">AI Insights</h3>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {insightsData.length > 0 ? (
              insightsData.map((item, idx) => (
                <InsightItem key={idx} type={item.type} title={item.title} desc={item.desc} />
              ))
            ) : (
               <>
                <InsightItem type="warning" title="Restock Alert" desc="Mechanical Keyboards are critically low. Demand predicted to spike next week." />
                <InsightItem type="info" title="Logistics Optimized" desc="New clustering route saved estimated $45 on fuel this week." />
                <InsightItem type="success" title="Revenue Growth" desc="Sales in the Accessories category grew by 15% WoW." />
                <InsightItem type="warning" title="Dead Stock" desc="Bluetooth Earbuds have not sold in 45 days. Consider a promotion." />
               </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Product Recommendations Section */}
      {inventoryRecommendations.length > 0 && (
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity size={20} className="text-emerald-400" />
            <h3 className="text-lg font-semibold text-white">AI Strategic Logistics Recommendations</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {inventoryRecommendations.map((rec, i) => (
              <div key={i} className="p-5 bg-black/40 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-white">{rec.productName}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${rec.action === 'Increase Stock' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>{rec.action}</span>
                </div>
                <p className="text-sm text-neutral-400 mb-4 h-16 overflow-y-auto custom-scrollbar leading-relaxed">{rec.reasoning}</p>
                <div className="flex items-center justify-between pt-3 border-t border-white/10 text-sm font-medium">
                  <span className="text-emerald-400">+{rec.estimatedProfitGainPercent}% Profit</span>
                  <span className="text-red-400">-{rec.estimatedLossRiskPercent}% Risk</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* India Map Visualization */}
      <motion.div variants={itemVariants} className="glass-card p-6 h-[400px] flex flex-col relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-purple-500/20 transition-all duration-700"></div>
        <div className="flex items-center gap-2 mb-4">
          <Map size={20} className="text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Live Logistics Nodes</h3>
        </div>
        <div className="flex-1 w-full h-full relative z-10">
          <IndiaMap />
        </div>
      </motion.div>

      {/* AI Report Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl shadow-purple-900/20"
          >
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Bot size={24} className="text-purple-400" />
                </div>
                <h2 className="text-xl font-bold text-white">AI Strategy Report</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X size={20} className="text-neutral-400 hover:text-white" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-2 text-neutral-300">
              {isGenerating ? (
                 <div className="h-full w-full flex flex-col items-center justify-center py-20 gap-4 text-purple-400">
                   <Loader2 size={40} className="animate-spin" />
                   <p className="text-sm font-medium animate-pulse">Analyzing Inventory, Demographics & Financials...</p>
                 </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{reportData}</pre>
                </div>
              )}
            </div>
            
            {!isGenerating && (
              <div className="mt-4 pt-4 border-t border-white/10 text-right">
                <button onClick={() => setShowModal(false)} className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium">
                  Close Report
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

function MetricCard({ title, value, trend, isPositive, icon }: any) {
  return (
    <motion.div 
      variants={{
        hidden: { scale: 0.95, opacity: 0 },
        show: { scale: 1, opacity: 1 }
      }}
      whileHover={{ y: -5, boxShadow: "0 10px 40px -10px rgba(59,130,246,0.1)" }}
      className="glass-card p-5 relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm font-medium text-neutral-400">{title}</p>
        <div className="p-2 bg-white/5 rounded-lg border border-white/10">
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-3">
        <h4 className="text-3xl font-bold text-white tracking-tight">{value}</h4>
        <span className={`text-sm font-medium mb-1 px-2 py-0.5 rounded-md ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {trend}
        </span>
      </div>
    </motion.div>
  );
}

function InsightItem({ type, title, desc }: any) {
  const colors = {
    warning: 'border-orange-500/30 bg-orange-500/5',
    info: 'border-blue-500/30 bg-blue-500/5',
    success: 'border-emerald-500/30 bg-emerald-500/5'
  };
  
  const textColors = {
    warning: 'text-orange-400',
    info: 'text-blue-400',
    success: 'text-emerald-400'
  };

  return (
    <div className={`p-4 rounded-lg border flex flex-col gap-1 transition-colors hover:bg-white/5 cursor-default ${colors[type as keyof typeof colors]}`}>
      <span className={`text-sm font-semibold ${textColors[type as keyof typeof textColors]}`}>{title}</span>
      <p className="text-xs text-neutral-300 leading-relaxed">{desc}</p>
    </div>
  )
}
