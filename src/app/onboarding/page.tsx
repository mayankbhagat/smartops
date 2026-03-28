'use client';

import { motion } from 'framer-motion';
import { Building2, Mail, Lock, Zap, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

type AuthMode = 'login' | 'signup' | 'reset';

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
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    // Bypassing auth for demo purposes as requested, real flow is above
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[10%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 shadow-lg shadow-purple-500/20 mb-6">
            <Zap size={24} className="text-white" />
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">
             {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create an Account' : 'Reset Password'}
          </h1>
          <p className="text-neutral-400">
             {mode === 'login' ? 'Sign in to your business operating system.' : mode === 'signup' ? 'Get started with SmartOps AI today.' : 'Enter your email to receive a reset link.'}
          </p>
        </div>

        <div className="glass-card p-8 rounded-2xl shadow-2xl relative">
          <div className="absolute -inset-[1px] bg-gradient-to-b from-white/10 to-transparent rounded-2xl pointer-events-none"></div>
          
          <form onSubmit={handleAuth} className="space-y-5">
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg text-center">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-lg text-center">
                {successMsg}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="name@company.com" 
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-neutral-600"
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••" 
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-neutral-600"
                  />
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-neutral-400 cursor-pointer hover:text-white transition-colors">
                  <input type="checkbox" className="rounded border-white/10 bg-black/40 text-blue-500 focus:ring-blue-500/30" />
                  Remember me
                </label>
                <button type="button" onClick={() => setMode('reset')} className="text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</button>
              </div>
            )}

            {mode === 'reset' && (
               <button type="button" onClick={() => setMode('login')} className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors">
                 <ArrowLeft size={16} /> Back to login
               </button>
            )}

            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 mt-4 rounded-xl bg-white text-black font-semibold shadow-lg hover:bg-neutral-200 transition-colors disabled:opacity-50">
              {loading ? <Loader2 size={20} className="animate-spin" /> : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
            </button>
            
            {mode === 'login' && (
              <div className="relative flex items-center py-4">
                 <div className="flex-grow border-t border-white/10"></div>
                 <span className="flex-shrink-0 mx-4 text-neutral-500 text-xs">OR</span>
                 <div className="flex-grow border-t border-white/10"></div>
              </div>
            )}

            {mode === 'login' && (
              <button type="button" onClick={handleDemoLogin} className="w-full flex py-3 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold hover:bg-blue-600/30 transition-colors items-center justify-center gap-2">
                   <Building2 size={18} /> Demo Login
              </button>
            )}
          </form>
        </div>

        <p className="text-center text-sm text-neutral-500 mt-8">
          {mode === 'login' ? (
            <>Don't have an account? <button onClick={() => setMode('signup')} className="text-white hover:underline transition-all">Sign up</button></>
          ) : mode === 'signup' ? (
            <>Already have an account? <button onClick={() => setMode('login')} className="text-white hover:underline transition-all">Sign in</button></>
          ) : null}
        </p>
      </motion.div>
    </div>
  );
}
