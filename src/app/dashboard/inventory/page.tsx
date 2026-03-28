// @ts-nocheck
'use client';

import { motion } from 'framer-motion';
import { PackageSearch, AlertTriangle, CheckCircle, Plus } from 'lucide-react';

const mockInventory = [
  { id: 1, name: 'Wireless Mouse', sku: 'WM-01', stock: 45, threshold: 20, status: 'in_stock' },
  { id: 2, name: 'Mechanical Keyboard', sku: 'MK-02', stock: 8, threshold: 15, status: 'low_stock' },
  { id: 3, name: 'USB-C Cable', sku: 'UC-03', stock: 120, threshold: 50, status: 'in_stock' },
  { id: 4, name: '4K Monitor', sku: 'MO-04', stock: 2, threshold: 5, status: 'low_stock' },
  { id: 5, name: 'Bluetooth Earbuds', sku: 'BE-05', stock: 0, threshold: 10, status: 'out_of_stock' },
];

export default function InventoryView() {
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
          <motion.h1 variants={itemVariants} className="text-3xl font-bold text-white">Inventory Intelligence</motion.h1>
          <motion.p variants={itemVariants} className="text-neutral-400 mt-1">AI-driven predictive stock management.</motion.p>
        </div>
        
        <motion.div variants={itemVariants}>
          <button className="px-4 py-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 font-medium hover:bg-blue-600/40 transition-colors flex items-center gap-2">
            <Plus size={16} /> Add Item
          </button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-card overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">Stock Levels</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-400">
              <thead className="bg-white/5 text-neutral-300">
                <tr>
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">SKU</th>
                  <th className="px-6 py-4 font-medium">Stock</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {mockInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{item.name}</td>
                    <td className="px-6 py-4 font-mono">{item.sku}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         <span>{item.stock}</span>
                         <span className="text-xs text-neutral-500">/ {item.threshold} min</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.status === 'in_stock' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle size={12}/> In Stock</span>}
                      {item.status === 'low_stock' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20"><AlertTriangle size={12}/> Low Stock</span>}
                      {item.status === 'out_of_stock' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20"><AlertTriangle size={12}/> Out of Stock</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
             <PackageSearch size={20} className="text-purple-400" />
             <h3 className="text-lg font-semibold text-white">AI Restock Suggestions</h3>
          </div>
          <div className="flex-1 space-y-4">
            <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
              <h4 className="text-sm font-semibold text-orange-400 mb-1">Mechanical Keyboard (MK-02)</h4>
              <p className="text-xs text-neutral-400 mb-3">Predicted to stock out in 3 days due to upcoming tech weekend sale.</p>
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-neutral-300">Suggest: +20 units</span>
                <button className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-white transition-colors">Order Now</button>
              </div>
            </div>

            <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
              <h4 className="text-sm font-semibold text-orange-400 mb-1">4K Monitor (MO-04)</h4>
              <p className="text-xs text-neutral-400 mb-3">Critically low stock. Long supplier lead time (14 days).</p>
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-neutral-300">Suggest: +15 units</span>
                <button className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-white transition-colors">Order Now</button>
              </div>
            </div>

            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
              <h4 className="text-sm font-semibold text-red-400 mb-1">Bluetooth Earbuds (BE-05)</h4>
              <p className="text-xs text-neutral-400">Currently out of stock. Missed estimated $1,200 in revenue last week.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
