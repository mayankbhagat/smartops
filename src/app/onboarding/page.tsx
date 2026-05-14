'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Mail, Lock, Zap, Loader2, ArrowLeft, BarChart2, Package, Truck, Bot, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

type AuthMode = 'login' | 'signup' | 'reset';

// ── Floating Particle Field ──────────────────────────────────
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf: number;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => { canvas.width = window.innerWidth * dpr; canvas.height = window.innerHeight * dpr; ctx.scale(dpr, dpr); };
    resize();
    window.addEventListener('resize', resize);
    
    const particles: { x: number; y: number; vx: number; vy: number; r: number; a: number; phase: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.2 - 0.15,
        r: Math.random() * 1.8 + 0.4,
        a: Math.random() * 0.4 + 0.1,
        phase: Math.random() * Math.PI * 2,
      });
    }
    const draw = (t: number) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = window.innerWidth;
        if (p.x > window.innerWidth) p.x = 0;
        if (p.y < 0) p.y = window.innerHeight;
        if (p.y > window.innerHeight) p.y = 0;
        const flicker = Math.sin(t * 0.001 + p.phase) * 0.15 + 0.85;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${p.a * flicker})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" style={{ width: '100%', height: '100%' }} />;
}

// ── Feature Pill ─────────────────────────────────────────────
const featurePills = [
  { icon: BarChart2, label: 'Revenue Forecasting', color: '#6366f1' },
  { icon: Package, label: 'Inventory AI', color: '#f59e0b' },
  { icon: Truck, label: 'Route Optimization', color: '#10b981' },
  { icon: Bot, label: '7 AI Agents', color: '#a855f7' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccessMsg('Registration successful! Check your email if confirmation is required.');
        setMode('login');
      } else if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/dashboard');
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
           redirectTo: `${window.location.origin}/onboarding?reset=true`,
        });
        if (error) throw error;
        setSuccessMsg('Password reset instructions sent to your email.');
      }
    } catch (err: any) {
      if (err.message === 'Failed to fetch') {
        setErrorMsg('Database connection failed. Please ensure NEXT_PUBLIC_SUPABASE_URL and Anon Key are correctly set in .env.local');
      } else {
        setErrorMsg(err.message || 'An error occurred during authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    router.push('/dashboard');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.2 } },
  };
  const childVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  return (
    <div className="min-h-screen bg-[#030305] flex relative overflow-hidden">
      {/* Particle background */}
      <ParticleField />

      {/* Cinematic ambient glows */}
      <div className="absolute top-0 left-[20%] w-[600px] h-[600px] rounded-full pointer-events-none z-[1]"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 right-[10%] w-[500px] h-[500px] rounded-full pointer-events-none z-[1]"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)' }} />
      <div className="absolute top-[40%] right-[30%] w-[400px] h-[400px] rounded-full pointer-events-none z-[1]"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 60%)' }} />

      {/* Grid overlay */}
      <div className="absolute inset-0 z-[2] pointer-events-none grid-bg opacity-40" />

      {/* ── LEFT PANEL: Brand Showcase ── */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center p-12 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-lg w-full space-y-8"
        >
          {/* Logo + Title */}
          <motion.div variants={childVariants} className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 40px rgba(99,102,241,0.4)' }}>
              <Zap size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                SmartOps AI
              </h1>
              <p className="text-sm text-neutral-500">Agentic Business Intelligence</p>
            </div>
          </motion.div>

          {/* Tagline */}
          <motion.div variants={childVariants}>
            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Your business.{' '}
              <span className="gradient-text">Supercharged</span>
              <br />by AI agents.
            </h2>
            <p className="text-neutral-400 mt-4 text-base leading-relaxed max-w-md">
              Upload your data. Let 7 specialized agents analyze revenue, optimize inventory,
              route logistics, and generate strategic intelligence in seconds.
            </p>
          </motion.div>

          {/* Feature Pills */}
          <motion.div variants={childVariants} className="flex flex-wrap gap-3">
            {featurePills.map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-white/8 bg-white/[0.02] backdrop-blur-sm"
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}>
                  <f.icon size={14} style={{ color: f.color }} />
                </div>
                <span className="text-sm font-medium text-neutral-300">{f.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Trust badges */}
          <motion.div variants={childVariants} className="flex items-center gap-6 pt-4">
            {[
              { icon: ShieldCheck, text: 'Enterprise Security' },
              { icon: Sparkles, text: 'Real-time AI' },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-neutral-500 text-sm">
                <b.icon size={16} className="text-neutral-600" />
                <span>{b.text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* ── RIGHT PANEL: Auth Form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 30px rgba(99,102,241,0.3)' }}>
              <Zap size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>SmartOps AI</h1>
          </div>

          {/* Auth header */}
          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center lg:text-left mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : 'Reset password'}
              </h2>
              <p className="text-neutral-500 text-sm">
                {mode === 'login' ? 'Sign in to your business operating system.' : mode === 'signup' ? 'Get started with SmartOps AI today.' : 'Enter your email to receive a reset link.'}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Glass form card */}
          <div className="relative">
            {/* Glow ring */}
            <div className="absolute -inset-[1px] rounded-2xl pointer-events-none"
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), transparent 40%, rgba(168,85,247,0.1))', borderRadius: '1rem' }} />

            <div className="glass-card p-8 rounded-2xl relative">
              <form onSubmit={handleAuth} className="space-y-5">
                {errorMsg && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center">
                    {errorMsg}
                  </motion.div>
                )}
                {successMsg && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl text-center">
                    {successMsg}
                  </motion.div>
                )}

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Email Address</label>
                  <div className="relative group">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="name@company.com"
                      className="w-full bg-black/50 border border-white/8 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all placeholder:text-neutral-600 text-sm"
                    />
                  </div>
                </div>

                {mode !== 'reset' && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Password</label>
                    <div className="relative group">
                      <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-indigo-400 transition-colors" />
                      <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full bg-black/50 border border-white/8 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all placeholder:text-neutral-600 text-sm"
                      />
                    </div>
                  </div>
                )}

                {mode === 'login' && (
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-neutral-500 cursor-pointer hover:text-neutral-300 transition-colors">
                      <input type="checkbox" className="rounded border-white/15 bg-black/50 text-indigo-500 focus:ring-indigo-500/30 w-4 h-4" />
                      Remember me
                    </label>
                    <button type="button" onClick={() => setMode('reset')} className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                      Forgot password?
                    </button>
                  </div>
                )}

                {mode === 'reset' && (
                  <button type="button" onClick={() => setMode('login')}
                    className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors">
                    <ArrowLeft size={16} /> Back to login
                  </button>
                )}

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex justify-center items-center gap-2 py-3.5 mt-2 rounded-xl font-semibold text-sm disabled:opacity-50 transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
                    color: '#fff',
                  }}
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                  {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
                  {!loading && <ArrowRight size={16} />}
                </motion.button>

                {mode === 'login' && (
                  <>
                    <div className="relative flex items-center py-3">
                      <div className="flex-grow border-t border-white/8" />
                      <span className="flex-shrink-0 mx-4 text-neutral-600 text-xs uppercase tracking-wider font-medium">or</span>
                      <div className="flex-grow border-t border-white/8" />
                    </div>

                    <motion.button
                      type="button"
                      onClick={handleDemoLogin}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex py-3 rounded-xl bg-white/[0.03] text-neutral-300 border border-white/8 font-medium hover:bg-white/[0.06] hover:border-white/15 transition-all items-center justify-center gap-2.5 text-sm"
                    >
                      <Building2 size={17} className="text-indigo-400" /> Demo Login — Skip Auth
                    </motion.button>
                  </>
                )}
              </form>
            </div>
          </div>

          <p className="text-center text-sm text-neutral-600 mt-8">
            {mode === 'login' ? (
              <>Don&apos;t have an account?{' '}<button onClick={() => setMode('signup')} className="text-indigo-400 hover:text-indigo-300 transition-all font-medium">Sign up</button></>
            ) : mode === 'signup' ? (
              <>Already have an account?{' '}<button onClick={() => setMode('login')} className="text-indigo-400 hover:text-indigo-300 transition-all font-medium">Sign in</button></>
            ) : null}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
