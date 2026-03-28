'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Phone, MapPin, Camera, Loader2, Save } from 'lucide-react';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [profile, setProfile] = useState({
    fullName: '',
    phone: '',
    address: '',
    avatarUrl: ''
  });

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setProfile({
          fullName: user.user_metadata?.full_name || '',
          phone: user.user_metadata?.phone || '',
          address: user.user_metadata?.address || '',
          avatarUrl: user.user_metadata?.avatar_url || ''
        });
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profile.fullName,
          phone: profile.phone,
          address: profile.address,
          avatar_url: profile.avatarUrl
        }
      });
      if (error) throw error;
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error updating profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 flex items-center justify-center"><Loader2 size={32} className="animate-spin text-blue-500" /></div>;

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center">
          <User size={20} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">Profile Settings</h1>
      </div>

      <div className="glass-card p-8 rounded-2xl border border-white/5 bg-black/40">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group cursor-pointer">
              <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white/10 bg-neutral-800 flex items-center justify-center relative">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-neutral-500" />
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera size={24} className="text-white" />
                </div>
              </div>
            </div>
            <div className="w-full">
               <label className="block text-xs text-neutral-400 mb-1 text-center">Avatar Image URL</label>
               <input 
                 type="text" 
                 value={profile.avatarUrl}
                 onChange={e => setProfile({...profile, avatarUrl: e.target.value})}
                 placeholder="https://example.com/photo.jpg" 
                 className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
               />
            </div>
          </div>

          {/* Form Section */}
          <div className="flex-1 space-y-5">
            {message.text && (
              <div className={`p-3 rounded-lg text-sm border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                {message.text}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5 flex items-center gap-2">
                <User size={16} className="text-blue-400" /> Full Name
              </label>
              <input 
                type="text" 
                value={profile.fullName}
                onChange={e => setProfile({...profile, fullName: e.target.value})}
                placeholder="Jane Doe" 
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5 flex items-center gap-2">
                <Phone size={16} className="text-emerald-400" /> Phone Number
              </label>
              <input 
                type="tel" 
                value={profile.phone}
                onChange={e => setProfile({...profile, phone: e.target.value})}
                placeholder="+1 (555) 000-0000" 
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5 flex items-center gap-2">
                <MapPin size={16} className="text-red-400" /> Initial Business Address
              </label>
              <textarea 
                value={profile.address}
                onChange={e => setProfile({...profile, address: e.target.value})}
                placeholder="123 Innovation Drive, Tech City..." 
                rows={3}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
