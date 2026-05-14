'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRef, useEffect, useState } from 'react';
import { ArrowRight, Bot, BarChart2, Package, Truck, Zap, TrendingUp, Shield, Globe } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CursorReactiveCard from '@/components/CursorReactiveCard';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const VIDEO_URL = 'https://res.cloudinary.com/dyhlpxwwo/video/upload/q_auto,f_auto/make_the_baground_black__extended_202605131635_fr5rc2.mp4';

// ── Features + Stats ──
const features = [
  { icon: BarChart2, color: 'from-blue-500 to-indigo-600', glow: 'rgba(99,102,241,0.3)', title: 'Business Analytics Engine', desc: 'Real revenue calculations, profit margins, loss detection, and 6-month AI forecasting from your actual CSV data.' },
  { icon: Package, color: 'from-purple-500 to-pink-600', glow: 'rgba(168,85,247,0.3)', title: 'Inventory Intelligence', desc: 'AI-driven demand forecasting, dead stock alerts, turnover analysis, and smart restock recommendations.' },
  { icon: Truck, color: 'from-emerald-500 to-teal-600', glow: 'rgba(16,185,129,0.3)', title: 'Logistics AI Engine', desc: 'Route optimization, multi-modal transport cost/CO₂ calculator, and real-time route visualization.' },
  { icon: Bot, color: 'from-orange-500 to-red-600', glow: 'rgba(245,158,11,0.3)', title: 'Agentic AI Workflow', desc: '7 specialized AI agents working in parallel — ingestion, analysis, forecasting, inventory, logistics, sustainability, and decision.' },
];
const stats = [
  { value: '7', label: 'AI Agents', suffix: '' },
  { value: '98', label: 'Analysis Accuracy', suffix: '%' },
  { value: '< 30', label: 'Seconds to Insight', suffix: 's' },
  { value: '∞', label: 'Industries Supported', suffix: '' },
];

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const fogRef = useRef<HTMLDivElement>(null);
  const headlightRef = useRef<HTMLDivElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // ── GSAP ScrollTrigger: truck zoom + dashboard emergence ──
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ctx = gsap.context(() => {
      // Phase 1: Truck zoom (0%-60%)
      gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: '+=2500',
          scrub: 1.2,
          pin: true,
          anticipatePin: 1,
        },
      })
        // Headlights pulse brighter
        .to(headlightRef.current, { opacity: 1, scale: 1.3, duration: 0.2 }, 0)
        // Fog intensifies
        .to(fogRef.current, { opacity: 0.6, scale: 1.1, duration: 0.3 }, 0)
        // Phase 1: Zoom deep into windshield
        .to(videoRef.current, {
          scale: 4.5,
          y: '-18%',
          x: '2%',
          duration: 1.2,
          ease: 'power3.inOut',
        }, 0.0)
        // Headlight fades as we zoom past
        .to(headlightRef.current, { opacity: 0, duration: 0.15 }, 0.25)
        // Fog fades
        .to(fogRef.current, { opacity: 0, duration: 0.15 }, 0.3)
        // Video fades to black
        .to(overlayRef.current, { opacity: 1, duration: 0.2 }, 0.5)
        // Dashboard emerges from black (scaling up smoothly from the windshield)
        .fromTo(dashboardRef.current, 
          { opacity: 0, y: 150, scale: 0.85, rotateX: 10 },
          { opacity: 1, y: 0, scale: 1, rotateX: 0, duration: 0.8, ease: 'power4.out' }, 0.6)
        // Video fully hidden
        .to(videoRef.current, { opacity: 0, duration: 0.1 }, 0.7);
    }, containerRef);
    return () => ctx.revert();
  }, [videoLoaded]);

  // Framer Motion scroll for lower sections
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: sectionProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end end'] });

  return (
    <div ref={containerRef} className="bg-[#030305] text-white overflow-hidden" style={{ cursor: 'auto' }}>

      {/* ── NAV ── */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="fixed top-0 w-full z-[100] px-6 py-4 flex justify-between items-center backdrop-blur-xl border-b border-white/5"
        style={{ background: 'rgba(3,3,5,0.7)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center" style={{ boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
            <Bot size={20} className="text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>SmartOps AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/onboarding" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Sign In</Link>
          <Link href="/dashboard" className="px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity" style={{ boxShadow: '0 0 20px rgba(99,102,241,0.35)' }}>
            Live Demo
          </Link>
        </div>
      </motion.nav>

      {/* ═══════════════════════════════════════════════════════════
          CINEMATIC HERO — Truck Video + Scroll Zoom + Dashboard
         ═══════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative w-full h-screen overflow-hidden">

        {/* ── Ambient background ── */}
        <div className="absolute inset-0 z-0" style={{
          background: 'radial-gradient(ellipse at 50% 80%, rgba(20,20,45,0.6) 0%, rgba(3,3,5,1) 70%)',
        }} />

        {/* ── Truck Video ── */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover z-[1] will-change-transform"
          src={VIDEO_URL}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onCanPlay={() => setVideoLoaded(true)}
          style={{ transform: 'scale(1)', transformOrigin: '50% 45%' }}
        />

        {/* ── Headlight glow overlay ── */}
        <div ref={headlightRef} className="absolute inset-0 z-[2] pointer-events-none opacity-40 will-change-[opacity,transform]" style={{
          background: 'radial-gradient(ellipse at 50% 55%, rgba(255,220,80,0.12) 0%, transparent 40%), radial-gradient(ellipse at 45% 55%, rgba(255,240,160,0.08) 0%, transparent 30%), radial-gradient(ellipse at 55% 55%, rgba(255,240,160,0.08) 0%, transparent 30%)',
        }} />

        {/* ── Fog / atmospheric particles ── */}
        <div ref={fogRef} className="absolute inset-0 z-[3] pointer-events-none opacity-30 will-change-[opacity,transform]" style={{
          background: 'radial-gradient(ellipse at 30% 70%, rgba(100,100,160,0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(80,80,140,0.1) 0%, transparent 40%)',
        }}>
          {/* Animated fog streaks */}
          <div className="fog absolute top-[30%] left-0 w-full h-32" style={{ background: 'linear-gradient(90deg, transparent, rgba(150,150,200,0.05), transparent)' }} />
          <div className="fog-2 absolute top-[50%] left-0 w-full h-24" style={{ background: 'linear-gradient(90deg, transparent, rgba(130,130,180,0.04), transparent)' }} />
          <div className="fog-3 absolute top-[65%] left-0 w-full h-20" style={{ background: 'linear-gradient(90deg, transparent, rgba(160,160,220,0.03), transparent)' }} />
        </div>

        {/* ── Cinematic black vignette ── */}
        <div className="absolute inset-0 z-[4] pointer-events-none" style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(3,3,5,0.6) 80%)',
        }} />

        {/* ── Top gradient overlay for nav readability ── */}
        <div className="absolute top-0 left-0 right-0 h-32 z-[5] pointer-events-none" style={{
          background: 'linear-gradient(to bottom, rgba(3,3,5,0.8), transparent)',
        }} />

        {/* ── Scroll-driven dark overlay (covers video before dashboard appears) ── */}
        <div ref={overlayRef} className="absolute inset-0 z-[6] pointer-events-none bg-[#030305] opacity-0 will-change-[opacity]" />

        {/* ── Hero text content ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="absolute inset-0 z-[7] flex flex-col items-center justify-center text-center px-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm text-neutral-300 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            SmartOps Copilot v2.0 — Now Live with Agentic AI
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Ambient Background Glow for the text block */}
            <div className="absolute inset-0 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="px-8 md:px-16 py-10 md:py-14 rounded-[3rem] border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.3)] backdrop-blur-[12px] bg-white/[0.03] relative z-10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              
              <h1
                className="text-6xl md:text-8xl lg:text-[7.5rem] font-black tracking-tighter mb-4 leading-[0.9]"
                style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', textShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
              >
                The <span className="gradient-text bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">Agentic Brain</span>
                <br />
                <span className="text-white/90">for Your Business.</span>
              </h1>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-lg md:text-xl text-neutral-300 mb-10 max-w-2xl mx-auto leading-relaxed"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.6)' }}
          >
            Upload your business data. Let 7 AI agents analyze revenue, optimize inventory, route logistics, and generate strategic intelligence in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/onboarding" className="h-14 px-8 rounded-full text-white font-semibold text-base flex items-center gap-2 w-full sm:w-auto justify-center transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 30px rgba(99,102,241,0.4)' }}>
              Get Started <ArrowRight size={18} />
            </Link>
            <Link href="/dashboard" className="h-14 px-8 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-white font-semibold text-base flex items-center gap-2 w-full sm:w-auto justify-center hover:bg-white/10 transition-all">
              <Zap size={18} className="text-yellow-400" /> Live Demo
            </Link>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-neutral-400 text-xs"
          >
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5">
              <div className="w-1 h-2 bg-white/50 rounded-full" />
            </motion.div>
            Scroll to explore
          </motion.div>
        </motion.div>

        {/* ── Dashboard Emergence (appears after scroll zoom through windshield) ── */}
        <div ref={dashboardRef} className="absolute inset-0 z-[8] flex items-center justify-center opacity-0 will-change-[opacity,transform]" style={{ perspective: '1000px' }}>
          <div className="w-full max-w-6xl mx-auto px-6">
            {/* Fake dashboard preview */}
            <div className="glass-card p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-60 h-60 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent)' }} />
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <span className="font-bold text-xl text-white block" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>SmartOps Command</span>
                  <span className="text-neutral-400 text-xs">Live Multi-Agent Analysis</span>
                </div>
                <span className="ml-auto badge-success text-xs px-3 py-1 rounded-full font-medium border border-emerald-500/20 bg-emerald-500/10 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                </span>
              </div>
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { l: 'Revenue', v: '₹12.4M', c: '#10b981' },
                  { l: 'Profit Margin', v: '24.8%', c: '#6366f1' },
                  { l: 'Active SKUs', v: '1,247', c: '#f59e0b' },
                  { l: 'AI Health', v: '94/100', c: '#06b6d4' },
                ].map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i + 1.5 }}
                    className="p-4 rounded-xl border border-white/6"
                    style={{ background: 'rgba(255,255,255,0.02)' }}
                  >
                    <p className="text-[11px] text-neutral-500 mb-1">{m.l}</p>
                    <p className="text-xl font-bold" style={{ color: m.c }}>{m.v}</p>
                  </motion.div>
                ))}
              </div>
              {/* Simulated chart area */}
              <div className="h-40 rounded-xl border border-white/5 flex items-end gap-1.5 px-6 pb-6 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)' }}>
                <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
                {[35,42,38,55,48,62,58,72,68,85,78,92, 88, 105, 95].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.03 * i + 2.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-1 rounded-t-sm relative group"
                    style={{ background: `linear-gradient(to top, rgba(99,102,241,0.2), rgba(99,102,241,0.9))` }}
                  >
                    <div className="absolute top-0 inset-x-0 h-1 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                ))}
              </div>
              <p className="text-center text-xs text-neutral-500 mt-4">
                <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                  Enter Full Dashboard →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="relative py-12 border-y border-white/5 z-20 bg-[#030305]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
              <div className="text-3xl md:text-4xl font-extrabold gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{s.value}{s.suffix}</div>
              <div className="text-sm text-neutral-500 mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section ref={sectionRef} className="py-24 px-6 max-w-6xl mx-auto w-full relative z-20 bg-[#030305]">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Every module. <span className="gradient-text">Fully intelligent.</span>
          </h2>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Upload your CSV. SmartOps AI automatically structures it, analyzes the patterns, and generates a dynamic operational command center.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: i * 0.1 }}>
                <CursorReactiveCard glowColor={f.glow} className="glass-card p-10 h-full border-white/10 rounded-3xl">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-6 shadow-lg`} style={{ boxShadow: `0 0 30px ${f.glow}` }}>
                    <Icon size={26} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{f.title}</h3>
                  <p className="text-base text-neutral-400 leading-relaxed font-medium">{f.desc}</p>
                </CursorReactiveCard>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 px-6 border-t border-white/5 relative z-20 bg-[#030305]">
        <div className="max-w-4xl mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl font-bold text-white text-center mb-14" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            How SmartOps works
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', icon: TrendingUp, title: 'Upload Your Data', desc: 'Drop in a CSV file from your operations — sales, inventory, logistics, expenses.' },
              { step: '02', icon: Bot, title: '7 Agents Analyze', desc: 'A multi-agent AI pipeline processes your data in parallel, generating structured intelligence.' },
              { step: '03', icon: Shield, title: 'Act on Insights', desc: 'Get strategic recommendations, forecasts, route optimizations, and financial health scores.' },
            ].map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="glass-card p-6 text-center relative overflow-hidden">
                <div className="text-6xl font-black text-white/[0.03] absolute top-2 right-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{step.step}</div>
                <div className="w-12 h-12 rounded-full bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
                  <step.icon size={22} className="text-indigo-400" />
                </div>
                <h4 className="text-base font-semibold text-white mb-2">{step.title}</h4>
                <p className="text-sm text-neutral-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 text-center relative z-20 bg-[#030305]">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-8 shadow-2xl" style={{ boxShadow: '0 0 40px rgba(99,102,241,0.5)' }}>
            <Globe size={28} className="text-white" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Your business.<br /><span className="gradient-text">Supercharged by AI.</span>
          </h2>
          <p className="text-neutral-400 mb-10">Start with your data. Get a complete business intelligence report in under 30 seconds.</p>
          <Link href="/onboarding" className="inline-flex items-center gap-2 h-14 px-10 rounded-full text-white font-semibold text-lg transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 40px rgba(99,102,241,0.45)' }}>
            Start for free <ArrowRight size={20} />
          </Link>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 border-t border-white/5 text-center text-neutral-600 text-sm relative z-20 bg-[#030305]">
        © {new Date().getFullYear()} SmartOps AI · Built for founders who move fast.
      </footer>
    </div>
  );
}
