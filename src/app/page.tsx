'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Bot, BarChart2, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <nav className="fixed top-0 w-full z-50 p-6 flex justify-between items-center backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Bot size={24} className="text-white" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white drop-shadow-sm">SmartOps AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/onboarding" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors">Sign In</Link>
          <Link href="/dashboard" className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-neutral-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              Live Demo
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 mt-20 relative z-10">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, ease: 'easeOut' }}
           className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur text-sm text-neutral-300 mb-8 mx-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            SmartOps Copilot v2.0 is now live
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
             The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Agentic Brain</span><br/> for Your Business.
          </h1>
          
          <p className="text-lg md:text-xl text-neutral-400 mb-12 max-w-2xl mx-auto leading-relaxed">
             Stop guessing. Let AI analyze your sales, optimize your logistics, predict inventory demand, and give you actionable strategy.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/onboarding" className="h-14 px-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg hover:shadow-[0_0_40px_rgba(147,51,234,0.4)] transition-all flex items-center justify-center gap-2 w-full sm:w-auto">
                Get Started <ArrowRight size={20} />
            </Link>
            <Link href="/dashboard" className="h-14 px-8 rounded-full bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2 w-full sm:w-auto">
                <Zap size={20} className="text-yellow-400" /> Demo View
            </Link>
          </div>
        </motion.div>

        <motion.div 
           initial={{ opacity: 0, y: 100 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, margin: "-100px" }}
           transition={{ duration: 1, ease: 'easeOut' }}
           className="mt-20 w-full max-w-5xl rounded-2xl glass-card border border-white/10 overflow-hidden relative group"
        >
           <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 pointer-events-none z-10 group-hover:opacity-50 transition-opacity duration-700"></div>
           <div className="p-4 bg-black/60 border-b border-white/10 flex items-center gap-2">
             <div className="w-3 h-3 rounded-full bg-red-500"></div>
             <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
             <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
           </div>
           
           {/* Decorative hovering glows for the preview component */}
           <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/30 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 peer-hover"></div>
           <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-purple-500/30 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 delay-100"></div>

           <div className="p-8 aspect-video bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-black flex flex-col items-center justify-center text-neutral-500 relative z-20">
              <BarChart2 size={64} className="mb-4 opacity-50" />
              <p>Dashboard Preview Graphic</p>
           </div>
        </motion.div>
      </main>
    </div>
  );
}
