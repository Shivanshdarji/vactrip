import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  ChevronLeft,
  Activity,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Edit,
  Globe,
  Lock,
  List,
  Map
} from 'lucide-react';
import TravelShell from '../components/TravelShell.jsx';
import AppNavbar from '../components/AppNavbar.jsx';
import { rememberTripId } from '../lib/lastTrip.js';

export default function ItineraryView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useLayoutEffect(() => {
    rememberTripId(id);
  }, [id]);

  useEffect(() => {
    const fetchTripData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/trips/${id}`);
        setTrip(response.data);
        setError(null);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/login');
        } else {
          setError('Failed to load trip data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTripData();
  }, [id, navigate]);

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

  if (error) {
    return (
      <TravelShell>
        <AppNavbar />
        <div className="flex flex-1 items-center justify-center px-4 py-32">
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-8 text-center text-rose-100 backdrop-blur-xl">
            <AlertCircle className="mx-auto mb-4 h-12 w-12" />
            <h2 className="mb-2 text-2xl font-bold">{error}</h2>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-rose-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-rose-400"
            >
              Try Again
            </button>
          </div>
        </div>
      </TravelShell>
    );
  }

  if (!trip) return null;

  const totalStops = trip.Stops?.length || 0;
  const totalActivities = trip.Stops?.reduce((total, stop) => total + (stop.StopActivities?.length || 0), 0) || 0;
  const startDate = new Date(trip.start_date);
  const endDate = new Date(trip.end_date);
  const tripDurationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

  return (
    <TravelShell>
      <AppNavbar />
      <div className="min-h-0 flex-1 pb-20 font-sans text-stone-100">
      
      {/* 1. Trip Hero Section */}
      <div className="relative h-80 w-full overflow-hidden bg-stone-800 lg:h-[28rem]">
        {trip.cover_photo ? (
          <img 
            src={trip.cover_photo} 
            alt={trip.name} 
            className="h-full w-full object-cover opacity-70"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-blue-700 to-indigo-900">
            <Map className="h-24 w-24 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="mx-auto max-w-6xl">
            <Link to="/trips" className="mb-6 inline-flex items-center text-sm font-semibold text-stone-300 transition-colors hover:text-white">
              <ChevronLeft className="mr-1 h-4 w-4" /> My Trips
            </Link>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex-1">
                <div className="mb-3 flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md ${trip.is_public ? 'public' : 'private' === 'public' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-stone-500/20 text-stone-300 border border-stone-500/30'}`}>
                    {trip.is_public ? 'public' : 'private' === 'public' ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                    {trip.is_public ? 'public' : 'private'}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-300 border border-blue-500/30 backdrop-blur-md">
                    {trip.status}
                  </span>
                </div>
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-3 text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
                  {trip.name}
                </motion.h1>
                <p className="max-w-3xl text-lg font-medium text-stone-200">{trip.description}</p>
                <div className="mt-5 flex flex-wrap gap-5 text-sm font-semibold text-stone-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-400" />
                    <span>{startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  {trip.budget && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-400" />
                      <span>{trip.budget}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-4">
                <Link 
                  to={`/trips/${id}/builder`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 active:scale-95"
                >
                  <Edit className="h-5 w-5" />
                  Edit Itinerary
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        
        {/* 2. Trip Summary Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ staggerChildren: 0.1 }} className="mb-16 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xl shadow-stone-200/40 dark:border-stone-800 dark:bg-stone-800/50">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <MapPin className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Destinations</p>
            <p className="text-2xl font-bold">{totalStops}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xl shadow-stone-200/40 dark:border-stone-800 dark:bg-stone-800/50">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              <Activity className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Activities</p>
            <p className="text-2xl font-bold">{totalActivities}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xl shadow-stone-200/40 dark:border-stone-800 dark:bg-stone-800/50">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
              <Calendar className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Duration</p>
            <p className="text-2xl font-bold">{tripDurationDays} Days</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xl shadow-stone-200/40 dark:border-stone-800 dark:bg-stone-800/50">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <DollarSign className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Budget</p>
            <p className="text-2xl font-bold">{trip.budget || 'N/A'}</p>
          </motion.div>
        </motion.div>

        {/* 3. Day-wise Itinerary Timeline */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight">Your Journey</h2>
        </div>

        {!trip.Stops || trip.Stops.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-stone-300 bg-white/50 p-16 text-center dark:border-stone-700 dark:bg-stone-800/30">
            <Map className="mb-4 h-16 w-16 text-stone-400" />
            <h3 className="mb-2 text-2xl font-bold text-stone-700 dark:text-stone-200">The canvas is blank</h3>
            <p className="mb-6 max-w-md text-stone-500 dark:text-stone-400">
              Your itinerary doesn't have any destinations yet. Head over to the Trip Builder to start mapping out your dream vacation.
            </p>
            <Link 
              to={`/trips/${id}/builder`}
              className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-stone-800 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200"
            >
              <Edit className="h-5 w-5" /> Let's Build It
            </Link>
          </div>
        ) : (
          <div className="relative ml-4 space-y-12 border-l-2 border-stone-200 pl-8 dark:border-stone-800 md:ml-6 md:pl-12">
            
            {trip.Stops.map((stop, index) => {
              const stopStart = new Date(stop.start_date);
              const stopEnd = new Date(stop.end_date);
              
              return (
                <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.4, delay: index * 0.1 }} key={stop.id} className="relative">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[41px] top-6 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 ring-4 ring-white dark:bg-blue-900 dark:ring-stone-900 md:-left-[61px] md:h-8 md:w-8 md:ring-8">
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-600 dark:bg-blue-400 md:h-3.5 md:w-3.5" />
                  </div>

                  {/* Stop Card */}
                  <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-xl shadow-stone-200/40 transition-all hover:shadow-2xl dark:border-stone-800 dark:bg-stone-800/80 dark:shadow-none">
                    <div className="flex flex-col md:flex-row">
                      {/* Destination Image Sidebar */}
                      <div className="relative h-64 shrink-0 md:h-auto md:w-72 lg:w-80">
                        <img 
                          src={stop.City?.hero_image || stop.City?.imageUrl || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=600&auto=format&fit=crop'} 
                          alt={stop.City?.name}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent" />
                        <div className="absolute bottom-6 left-6 right-6 text-white">
                          <span className="mb-2 inline-block rounded-lg bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                            Stop {index + 1}
                          </span>
                          <h3 className="text-3xl font-extrabold tracking-tight">{stop.City?.name}</h3>
                          <p className="mt-1 font-medium text-stone-300">{stop.City?.state}</p>
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 p-6 md:p-8">
                        <div className="mb-8 flex items-center gap-3 border-b border-stone-100 pb-6 dark:border-stone-700/50">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                            <Calendar className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Dates</p>
                            <p className="text-lg font-bold">
                              {stopStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {stopEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>

                        {/* Activities List */}
                        <div>
                          <h4 className="mb-6 flex items-center gap-2 text-lg font-bold">
                            <List className="h-5 w-5 text-stone-400" />
                            Planned Activities
                          </h4>
                          
                          {!stop.StopActivities || stop.StopActivities.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-stone-200 p-8 text-center dark:border-stone-700">
                              <p className="text-stone-500 dark:text-stone-400">No activities scheduled for this destination.</p>
                            </div>
                          ) : (
                            <div className="grid gap-4 lg:grid-cols-2">
                              {stop.StopActivities.map(sa => (
                                <div key={sa.id} className="group flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10">
                                  {sa.Activity?.image || sa.Activity?.imageUrl ? (
                                    <img 
                                      src={sa.Activity.image || sa.Activity.imageUrl} 
                                      alt={sa.Activity.name} 
                                      className="h-20 w-20 shrink-0 rounded-xl object-cover shadow-sm"
                                    />
                                  ) : (
                                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-stone-200 text-stone-400 dark:bg-stone-700">
                                      <ImageIcon className="h-8 w-8" />
                                    </div>
                                  )}
                                  <div className="flex flex-1 flex-col justify-center">
                                    <div className="mb-1 flex items-start justify-between gap-2">
                                      <h5 className="font-bold leading-tight line-clamp-2">{sa.Activity?.name}</h5>
                                    </div>
                                    <span className="mb-2 inline-table self-start rounded-md bg-stone-200/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:bg-stone-700 dark:text-stone-300">
                                      {sa.Activity?.type}
                                    </span>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium text-stone-400">
                                      <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {sa.Activity?.duration_hrs != null ? `${sa.Activity.duration_hrs}h` : sa.Activity?.duration != null ? `${sa.Activity.duration} mins` : '—'}</span>
                                      <span className="flex items-center gap-1.5"><DollarSign className="h-4 w-4" /> {sa.Activity?.cost > 0 ? sa.Activity.cost : 'Free'}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            
            {/* End of Timeline Dot */}
            <div className="absolute -left-[35px] bottom-0 flex h-4 w-4 items-center justify-center rounded-full bg-stone-300 dark:bg-stone-700 md:-left-[51px] md:h-5 md:w-5">
              <div className="h-1.5 w-1.5 rounded-full bg-white dark:bg-stone-900" />
            </div>
            
          </div>
        )}

      </div>
      </div>
    </TravelShell>
  );
}
