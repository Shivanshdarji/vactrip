import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Heart, HeartOff, MapPin, Loader2, Plus } from 'lucide-react';
import TravelShell from '../components/TravelShell.jsx';
import AppNavbar from '../components/AppNavbar.jsx';

export default function SavedDestinations() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSaved();
  }, []);

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const res = await api.get('/saved-destinations');
      setSaved(res.data);
    } catch (err) {
      toast.error('Failed to load saved destinations');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    try {
      await api.delete(`/saved-destinations/${id}`);
      setSaved(saved.filter(s => s.id !== id));
      toast.success('Removed from saved');
    } catch (err) {
      toast.error('Failed to remove');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
  };

  return (
    <TravelShell>
      <AppNavbar />
      <div className="min-h-0 flex-1 pb-20 pt-6 font-sans text-stone-100">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-10 overflow-hidden rounded-3xl border border-white/12 shadow-2xl"
        >
          <img
            src="https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1800&q=75"
            alt=""
            className="h-40 w-full object-cover md:h-48"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-rose-900/90 via-night-950/75 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 md:p-8">
            <h1 className="flex items-center gap-3 font-display text-3xl font-medium text-white md:text-4xl">
              <Heart className="h-8 w-8 text-rose-300 fill-rose-400" />
              Saved Destinations
            </h1>
            <p className="mt-2 max-w-xl text-sm text-stone-200 md:text-base">
              Your travel bucket list — cities you want to visit next.
            </p>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-rose-300" />
          </div>
        ) : saved.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/20 bg-white/5 p-16 text-center backdrop-blur-xl"
          >
            <div className="mb-4 rounded-full bg-rose-500/20 p-4">
              <HeartOff className="h-10 w-10 text-rose-300" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">Your bucket list is empty</h3>
            <p className="text-stone-400">
              Start exploring cities and save them from the atlas.
            </p>
            <button 
              type="button"
              onClick={() => navigate('/cities')}
              className="mt-6 rounded-full bg-gradient-to-r from-rose-400 to-fuchsia-500 px-6 py-2.5 font-bold text-night-950 shadow-lg transition hover:opacity-95"
            >
              Explore Cities
            </button>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            <AnimatePresence>
              {saved.map(item => (
                <motion.div 
                  key={item.id}
                  variants={itemVariants}
                  exit="exit"
                  whileHover={{ y: -5 }}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/12 bg-white/8 shadow-xl backdrop-blur-xl"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-night-900">
                    {item.City?.hero_image || item.City?.imageUrl ? (
                      <img src={item.City.hero_image || item.City.imageUrl} alt={item.City.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-stone-300 dark:bg-stone-600">
                        <MapPin className="h-8 w-8 text-stone-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    
                    <button 
                      onClick={() => handleRemove(item.id)}
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-colors hover:bg-rose-500"
                      title="Remove"
                    >
                      <HeartOff className="h-4 w-4" />
                    </button>

                    <div className="absolute bottom-3 left-3">
                      <h3 className="text-lg font-bold text-white drop-shadow-md">{item.City?.name}</h3>
                      <p className="text-xs font-medium text-stone-200 drop-shadow-md">{item.City?.country}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <button 
                      type="button"
                      onClick={() => navigate('/trips/create')}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/20"
                    >
                      <Plus className="h-4 w-4" />
                      Plan Trip Here
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
      </div>
    </TravelShell>
  );
}
