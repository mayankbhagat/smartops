'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Settings, Bell, Mail, Monitor, Shield, Loader2, Save } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [settings, setSettings] = useState({
    emailAlerts: false,
    weeklyReports: false,
    autoSync: true
  });

  useEffect(() => {
    async function loadSettings() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.user_metadata?.settings) {
        setSettings(user.user_metadata.settings);
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    // MOCK EMAIL NOTIFICATION SYSTEM TRIGGER
    if (settings.emailAlerts) {
       console.log("MOCK EMAIL SYSTEM: Alert Preferences Updated Notification Sent to User Email.");
    }
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: { settings }
      });
      if (error) throw error;
      setMessage({ type: 'success', text: 'Settings saved and notifications updated!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error updating settings' });
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({ label, description, checked, onChange, icon: Icon, color }: any) => (
    <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer" onClick={() => onChange(!checked)}>
      <div className="flex flex-row items-center gap-4">
        <div className={`w-10 h-10 rounded-xl bg-${color}-500/20 flex items-center justify-center`}>
          <Icon size={20} className={`text-${color}-400`} />
        </div>
        <div>
          <h3 className="text-white font-medium mb-0.5">{label}</h3>
          <p className="text-sm text-neutral-500">{description}</p>
        </div>
      </div>
      <div className={`w-12 h-6 rounded-full relative transition-colors ${checked ? 'bg-blue-600' : 'bg-neutral-600'}`}>
         <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${checked ? 'left-7' : 'left-1'}`}></div>
      </div>
    </div>
  );

  if (loading) return <div className="p-8"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-neutral-600 to-neutral-800 flex items-center justify-center">
          <Settings size={20} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">System Settings</h1>
      </div>

      <div className="glass-card p-8 rounded-2xl border border-white/5 mb-6 bg-black/40">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="text-yellow-400" size={24} />
          <h2 className="text-xl font-semibold text-white">Notifications & Alerts</h2>
        </div>
        
        {message.text && (
          <div className={`p-4 rounded-xl mb-6 text-sm flex items-center gap-2 border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            {message.type === 'success' ? <Monitor size={16} /> : <Shield size={16} />} 
            {message.text}
          </div>
        )}
        
        <div className="space-y-4">
          <Toggle 
            label="Email AI Alerts" 
            description="Receive real-time anomaly alerts (e.g., low inventory) directly to your email."
            icon={Mail}
            color="blue"
            checked={settings.emailAlerts}
            onChange={(val: boolean) => setSettings({...settings, emailAlerts: val})}
          />
          <Toggle 
            label="Weekly Strategy Report" 
            description="Agentic brain compiles a full business digest every Monday morning."
            icon={Monitor}
            color="purple"
            checked={settings.weeklyReports}
            onChange={(val: boolean) => setSettings({...settings, weeklyReports: val})}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20"
        >
          {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          {saving ? 'Applying Changes...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
}
