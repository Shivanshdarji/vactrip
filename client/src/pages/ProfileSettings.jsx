import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { User, Mail, MapPin, Phone, Lock, Save, Camera, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import TravelShell from '../components/TravelShell.jsx';
import AppNavbar from '../components/AppNavbar.jsx';

export default function ProfileSettings() {
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    city: '',
    country: '',
    phone: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/profile');
      const data = res.data;
      setFormData(prev => ({
        ...prev,
        name: data.name || '',
        email: data.email || '',
        city: data.city || '',
        country: data.country || '',
        phone: data.phone || ''
      }));
    } catch (err) {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    try {
      setSaving(true);
      const loadingToast = toast.loading('Updating profile...');
      await api.put('/profile', {
        name: formData.name,
        email: formData.email,
        city: formData.city,
        country: formData.country,
        phone: formData.phone,
        newPassword: formData.newPassword || undefined
      });
      toast.success('Profile updated successfully!', { id: loadingToast });
      setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <TravelShell>
        <AppNavbar />
        <div className="flex flex-1 items-center justify-center py-32">
          <Loader2 className="h-10 w-10 animate-spin text-cyan-300" />
        </div>
      </TravelShell>
    );
  }

  return (
    <TravelShell>
      <AppNavbar />
      <div className="min-h-0 flex-1 pb-20 pt-6 font-sans text-stone-100">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-10 overflow-hidden rounded-3xl border border-white/12 shadow-2xl"
        >
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1600&q=75"
            alt=""
            className="h-36 w-full object-cover md:h-44"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-night-950/95 via-indigo-950/70 to-cyan-900/40" />
          <div className="absolute bottom-0 left-0 flex w-full items-end justify-between gap-4 p-6 md:p-8">
            <div>
              <h1 className="font-display text-3xl font-medium text-white md:text-4xl">Account Settings</h1>
              <p className="mt-2 text-sm text-stone-200 md:text-base">
                Manage your profile, preferences, and security.
              </p>
            </div>
            <div className="hidden shrink-0 items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-4 py-2 text-sm font-bold text-emerald-100 md:flex">
              <ShieldCheck className="h-4 w-4" />
              Secure
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Profile Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="overflow-hidden rounded-3xl border border-white/12 bg-white/8 shadow-xl backdrop-blur-xl"
          >
            <div className="border-b border-white/10 bg-white/5 px-6 py-4">
              <h2 className="text-lg font-bold text-white">Personal Information</h2>
            </div>
            
            <div className="p-6 md:p-8">
              <div className="mb-8 flex items-center gap-6">
                <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white/15 bg-stone-700">
                  {authUser?.photo ? (
                    <img src={authUser.photo} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <User className="absolute inset-0 m-auto h-12 w-12 text-stone-400" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100 cursor-pointer">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{formData.name || 'Traveler'}</h3>
                  <p className="text-stone-400">{formData.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-stone-200">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                      <User className="h-5 w-5" />
                    </div>
                    <input 
                      type="text" name="name" value={formData.name} onChange={handleChange} required
                      className="w-full rounded-xl border border-white/15 bg-night-950/50 py-2.5 pl-10 pr-4 text-white outline-none transition-all placeholder:text-stone-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-stone-200">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input 
                      type="email" name="email" value={formData.email} onChange={handleChange} required
                      className="w-full rounded-xl border border-white/15 bg-night-950/50 py-2.5 pl-10 pr-4 text-white outline-none transition-all placeholder:text-stone-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-stone-200">City</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <input 
                      type="text" name="city" value={formData.city} onChange={handleChange} placeholder="E.g. New York"
                      className="w-full rounded-xl border border-white/15 bg-night-950/50 py-2.5 pl-10 pr-4 text-white outline-none transition-all placeholder:text-stone-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-stone-200">Country</label>
                  <input 
                    type="text" name="country" value={formData.country} onChange={handleChange} placeholder="E.g. USA"
                    className="w-full rounded-xl border border-white/15 bg-night-950/50 py-2.5 px-4 text-white outline-none transition-all placeholder:text-stone-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-stone-200">Phone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                      <Phone className="h-5 w-5" />
                    </div>
                    <input 
                      type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 890"
                      className="w-full rounded-xl border border-white/15 bg-night-950/50 py-2.5 pl-10 pr-4 text-white outline-none transition-all placeholder:text-stone-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Security Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="overflow-hidden rounded-3xl border border-white/12 bg-white/8 shadow-xl backdrop-blur-xl"
          >
            <div className="border-b border-white/10 bg-rose-500/10 px-6 py-4">
              <h2 className="text-lg font-bold text-rose-200">Security</h2>
            </div>
            <div className="p-6 md:p-8">
              <p className="mb-4 text-sm text-stone-400">Leave blank if you do not want to change your password.</p>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-stone-200">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input 
                      type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} placeholder="••••••••"
                      className="w-full rounded-xl border border-white/15 bg-night-950/50 py-2.5 pl-10 pr-4 text-white outline-none transition-all placeholder:text-stone-500 focus:border-rose-400/50 focus:ring-2 focus:ring-rose-400/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-stone-200">Confirm New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input 
                      type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••"
                      className="w-full rounded-xl border border-white/15 bg-night-950/50 py-2.5 pl-10 pr-4 text-white outline-none transition-all placeholder:text-stone-500 focus:border-rose-400/50 focus:ring-2 focus:ring-rose-400/20"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={saving}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-8 py-3.5 font-bold text-night-950 shadow-xl transition-all hover:opacity-95 active:scale-95 disabled:opacity-70"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              Save Changes
            </button>
          </div>

        </form>
      </div>
      </div>
    </TravelShell>
  );
}
