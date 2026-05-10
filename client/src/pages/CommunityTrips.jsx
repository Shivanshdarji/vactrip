import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Search, Map, Calendar, Users, Copy, Loader2, Compass } from 'lucide-react';
import TravelShell from '../components/TravelShell.jsx';
import AppNavbar from '../components/AppNavbar.jsx';

export default function CommunityTrips() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copyingId, setCopyingId] = useState(null);

  useEffect(() => {
    fetchCommunityTrips();
  }, []);

  const fetchCommunityTrips = async () => {
    try {
      setLoading(true);
      const res = await api.get('/community/trips');
      setTrips(res.data);
    } catch (err) {
      toast.error('Failed to load community trips');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTrip = async (tripId) => {
    try {
      setCopyingId(tripId);
      const loadingToast = toast.loading('Duplicating itinerary...');
      const res = await api.post(`/community/trips/${tripId}/copy`);
      toast.success('Trip successfully copied!', { id: loadingToast });
      navigate(`/trips/${res.data.id}/builder`);
    } catch (err) {
      toast.error('Failed to copy trip. Please try again.');
    } finally {
      setCopyingId(null);
    }
  };

  const filteredTrips = trips.filter(trip => 
    trip.name.toLowerCase().includes(search.toLowerCase()) ||
    trip.Stops?.some(stop => stop.City?.name.toLowerCase().includes(search.toLowerCase()))
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <TravelShell>
      <AppNavbar />
      <div className="min-h-0 flex-1 pb-20 font-sans text-stone-100">
      <div className="relative overflow-hidden py-16 text-white">
        <img
          src="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=2000&q=75"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-night-950/90 via-indigo-950/75 to-night-950" />
        <div className="relative mx-auto max-w-6xl px-4 text-center md:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="mb-4 font-display text-4xl font-medium tracking-tight md:text-6xl text-white">
              Community Journeys
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-stone-200">
              Discover, get inspired, and duplicate itineraries from fellow travelers around the globe.
            </p>
            <div className="mx-auto flex max-w-xl items-center overflow-hidden rounded-full border border-white/20 bg-white/10 p-1 shadow-2xl backdrop-blur-md">
              <div className="pl-4 pr-2">
                <Search className="h-5 w-5 text-stone-400" />
              </div>
              <input
                type="text"
                placeholder="Search destinations, trips..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent py-3 pr-4 text-white placeholder-stone-400 outline-none"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-cyan-300" />
          </div>
        ) : filteredTrips.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/20 bg-white/5 p-16 text-center backdrop-blur-xl"
          >
            <Compass className="mb-4 h-16 w-16 text-stone-500" />
            <h3 className="mb-2 text-xl font-bold text-white">No trips found</h3>
            <p className="text-stone-400">Try adjusting your search terms.</p>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filteredTrips.map(trip => (
              <motion.div 
                key={trip.id} 
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/12 bg-white/8 shadow-xl backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-cyan-400/35 hover:shadow-cyan-500/10"
              >
                <div className="relative h-48 w-full overflow-hidden bg-night-900">
                  {trip.cover_photo ? (
                    <img src={trip.cover_photo} alt={trip.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : trip.Stops?.[0]?.City?.hero_image || trip.Stops?.[0]?.City?.imageUrl ? (
                    <img src={trip.Stops[0].City.hero_image || trip.Stops[0].City.imageUrl} alt={trip.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
                      <Map className="h-12 w-12 text-white/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white/20 backdrop-blur-md">
                        {trip.User?.photo ? (
                          <img src={trip.User.photo} alt={trip.User.name} className="h-full w-full object-cover" />
                        ) : (
                          <Users className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-white drop-shadow-md">
                        {trip.User?.name || 'Traveler'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="mb-2 text-xl font-bold leading-tight text-white line-clamp-2">
                    {trip.name}
                  </h3>
                  
                  <div className="mb-4 flex flex-wrap gap-2">
                    {trip.Stops?.slice(0, 3).map(stop => (
                      <span key={stop.id} className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-semibold text-stone-200">
                        {stop.City?.name}
                      </span>
                    ))}
                    {trip.Stops?.length > 3 && (
                      <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-semibold text-stone-200">
                        +{trip.Stops.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-stone-400">
                      <Calendar className="h-4 w-4" />
                      {trip.Stops?.length || 0} Stops
                    </div>
                    
                    <button 
                      onClick={() => handleCopyTrip(trip.id)}
                      disabled={copyingId === trip.id}
                      className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-sm font-bold text-night-950 shadow-lg transition hover:from-cyan-300 hover:to-blue-400 active:scale-95 disabled:opacity-50"
                    >
                      {copyingId === trip.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      Duplicate
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
      </div>
    </TravelShell>
  );
}
