import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Plus,
  Trash2,
  GripVertical,
  ChevronLeft,
  Activity,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react';
import TravelShell from '../components/TravelShell.jsx';
import AppNavbar from '../components/AppNavbar.jsx';
import { rememberTripId } from '../lib/lastTrip.js';

export default function TripBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add Stop State
  const [cities, setCities] = useState([]);
  const [addingStop, setAddingStop] = useState(false);
  const [newStopForm, setNewStopForm] = useState({ cityId: '', startDate: '', endDate: '' });

  // Add Activity Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeStopId, setActiveStopId] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [activeCityId, setActiveCityId] = useState(null);
  const [cityActivities, setCityActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  useLayoutEffect(() => {
    rememberTripId(id);
  }, [id]);

  // Initial Fetch
  useEffect(() => {
    fetchTripData();
    fetchCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

  const fetchCities = async () => {
    try {
      const response = await api.get('/cities');
      const list = Array.isArray(response.data?.data) ? response.data.data : [];
      setCities(list);
    } catch (err) {
      console.error('Failed to fetch cities:', err);
    }
  };

  // Drag and Drop Handler
  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    if (source.index === destination.index) return;

    // Optimistic UI Update
    const newStops = Array.from(trip.Stops);
    const [reorderedItem] = newStops.splice(source.index, 1);
    newStops.splice(destination.index, 0, reorderedItem);

    // Update orders based on new array
    const orderedIds = newStops.map((stop) => stop.id);
    
    setTrip({ ...trip, Stops: newStops });

    try {
      await api.put(`/trips/${id}/stops/reorder`, { orderedIds });
    } catch (err) {
      console.error('Failed to reorder stops:', err);
      // Revert on failure
      fetchTripData();
    }
  };

  // Add Stop Handler
  const handleAddStop = async (e) => {
    e.preventDefault();
    try {
      setAddingStop(true);
      await api.post(`/trips/${id}/stops`, {
        cityId: newStopForm.cityId,
        startDate: newStopForm.startDate,
        endDate: newStopForm.endDate
      });
      setNewStopForm({ cityId: '', startDate: '', endDate: '' });
      toast.success('Stop added successfully');
      await fetchTripData(); // Refresh UI
    } catch (err) {
      toast.error('Failed to add stop');
    } finally {
      setAddingStop(false);
    }
  };

  // Remove Stop Handler
  const handleRemoveStop = async (stopId) => {
    if (!window.confirm('Are you sure you want to remove this stop?')) return;
    try {
      await api.delete(`/trips/${id}/stops/${stopId}`);
      toast.success('Stop removed');
      await fetchTripData();
    } catch (err) {
      toast.error('Failed to remove stop');
    }
  };

  // Open Activity Drawer
  const openActivityDrawer = async (stop) => {
    setActiveStopId(stop.id);
    setActiveCityId(stop.City?.id);
    setDrawerOpen(true);
    setLoadingActivities(true);
    try {
      const res = await api.get(`/cities/${stop.City?.id}/activities`);
      setCityActivities(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error('Failed to load activities', err);
    } finally {
      setLoadingActivities(false);
    }
  };

  // Add Activity to Stop
  const handleAddActivity = async (activityId) => {
    try {
      await api.post(`/stops/${activeStopId}/activities`, {
        activityId,
      });
      toast.success('Activity added successfully!');
      setDrawerOpen(false);
      await fetchTripData();
    } catch (err) {
      toast.error('Failed to add activity. It might already be assigned.');
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

  if (error) {
    return (
      <TravelShell>
        <AppNavbar />
        <div className="flex flex-1 items-center justify-center px-4 py-32">
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-8 text-center text-rose-100 backdrop-blur-xl">
            <AlertCircle className="mx-auto mb-4 h-12 w-12" />
            <h2 className="text-xl font-bold">{error}</h2>
            <button
              type="button"
              onClick={fetchTripData}
              className="mt-4 rounded-lg bg-rose-500 px-4 py-2 text-white hover:bg-rose-400"
            >
              Try Again
            </button>
          </div>
        </div>
      </TravelShell>
    );
  }

  if (!trip) return null;

  return (
    <TravelShell>
      <AppNavbar />
      <div className="min-h-0 flex-1 pb-20 text-stone-100">
      {/* 1. Trip Hero Header */}
      <div className="relative h-72 w-full overflow-hidden bg-stone-800 lg:h-96">
        {trip.cover_photo ? (
          <img 
            src={trip.cover_photo} 
            alt={trip.name} 
            className="h-full w-full object-cover opacity-60"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-800">
            <ImageIcon className="h-20 w-20 text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white md:p-10">
          <div className="mx-auto max-w-5xl">
            <Link to="/trips" className="mb-4 inline-flex items-center text-sm font-medium text-stone-300 hover:text-white transition-colors">
              <ChevronLeft className="mr-1 h-4 w-4" /> Back to Trips
            </Link>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="mb-2 text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white to-stone-300">
                  {trip.name}
                </h1>
                <p className="max-w-2xl text-lg text-stone-200">{trip.description}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium text-stone-300">
                  <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                    <Calendar className="h-4 w-4" />
                    {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                  </span>
                  {trip.budget && (
                    <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                      <DollarSign className="h-4 w-4" />
                      {trip.budget}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 backdrop-blur-md uppercase tracking-wider">
                    {trip.status}
                  </span>
                </div>
              </motion.div>
              <Link 
                to={`/trips/${id}/view`}
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 font-semibold text-stone-900 shadow-lg transition-all hover:scale-105 hover:bg-stone-100"
              >
                View Itinerary
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-5xl px-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Main Timeline Section */}
          <div className="lg:col-span-2">
            <h2 className="mb-6 text-2xl font-bold text-stone-800 dark:text-stone-100">
              Trip Itinerary
            </h2>
            
            {!trip.Stops || trip.Stops.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white/50 p-12 text-center backdrop-blur-sm dark:border-stone-700 dark:bg-stone-800/50">
                <MapPin className="mb-4 h-12 w-12 text-stone-400" />
                <h3 className="mb-2 text-xl font-bold text-stone-700 dark:text-stone-200">No stops yet</h3>
                <p className="text-stone-500 dark:text-stone-400">Start building your dream trip by adding a destination.</p>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="stops">
                  {(provided) => (
                    <div 
                      {...provided.droppableProps} 
                      ref={provided.innerRef}
                      className="space-y-6"
                    >
                      {trip.Stops.map((stop, index) => (
                        <Draggable key={stop.id.toString()} draggableId={stop.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all dark:bg-stone-800 ${
                                snapshot.isDragging 
                                  ? 'scale-[1.02] border-blue-500 shadow-xl z-50 ring-4 ring-blue-500/20' 
                                  : 'border-stone-200 dark:border-stone-700 hover:shadow-md'
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row">
                                {/* Drag Handle & Image */}
                                <div className="group relative sm:w-48 shrink-0">
                                  <div 
                                    {...provided.dragHandleProps}
                                    className="absolute left-2 top-2 z-10 flex h-8 w-8 cursor-grab items-center justify-center rounded-lg bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60 active:cursor-grabbing"
                                  >
                                    <GripVertical className="h-5 w-5" />
                                  </div>
                                  <img 
                                    src={stop.City?.imageUrl || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=600&auto=format&fit=crop'} 
                                    alt={stop.City?.name || 'City'}
                                    className="h-48 w-full object-cover sm:h-full"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent sm:bg-gradient-to-r" />
                                  <div className="absolute bottom-4 left-4 text-white">
                                    <h3 className="text-xl font-bold leading-tight">{stop.City?.name}</h3>
                                    <p className="text-sm font-medium text-stone-200">{stop.City?.state}</p>
                                  </div>
                                </div>

                                {/* Content */}
                                <div className="flex flex-1 flex-col p-5">
                                  <div className="mb-4 flex items-start justify-between">
                                    <div>
                                      <div className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs dark:bg-blue-900">
                                          {index + 1}
                                        </span>
                                        <Calendar className="h-4 w-4" />
                                        {new Date(stop.start_date).toLocaleDateString()} - {new Date(stop.end_date).toLocaleDateString()}
                                      </div>
                                    </div>
                                    <button 
                                      onClick={() => handleRemoveStop(stop.id)}
                                      className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30"
                                      title="Remove Stop"
                                    >
                                      <Trash2 className="h-5 w-5" />
                                    </button>
                                  </div>

                                  {/* Activities List */}
                                  <div className="flex-1 space-y-3">
                                    <h4 className="text-sm font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                                      Activities ({stop.StopActivities?.length || 0})
                                    </h4>
                                    
                                    {stop.StopActivities?.length > 0 ? (
                                      <div className="grid gap-2">
                                        {stop.StopActivities.map(sa => (
                                          <div key={sa.id} className="flex items-center justify-between rounded-xl bg-stone-50 p-3 dark:bg-stone-700/50">
                                            <div className="flex items-center gap-3">
                                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                                                <Activity className="h-5 w-5" />
                                              </div>
                                              <div>
                                                <p className="font-medium text-stone-800 dark:text-stone-200">{sa.Activity?.name}</p>
                                                <p className="text-xs text-stone-500 dark:text-stone-400">{sa.Activity?.type}</p>
                                              </div>
                                            </div>
                                            <div className="text-right text-sm font-medium text-stone-600 dark:text-stone-300">
                                              {sa.Activity?.cost > 0 ? `$${sa.Activity.cost}` : 'Free'}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="rounded-xl border border-dashed border-stone-200 p-4 text-center text-sm text-stone-500 dark:border-stone-700">
                                        No activities planned yet.
                                      </div>
                                    )}
                                  </div>

                                  <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-700">
                                    <button 
                                      onClick={() => openActivityDrawer(stop)}
                                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-100 py-2.5 font-medium text-stone-700 transition-colors hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-600"
                                    >
                                      <Plus className="h-4 w-4" /> Add Activity
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>

          {/* Sidebar / Add Stop Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-xl shadow-stone-200/50 dark:border-stone-700 dark:bg-stone-800 dark:shadow-none">
              <h3 className="mb-4 text-lg font-bold text-stone-800 dark:text-stone-100">Add New Stop</h3>
              
              <form onSubmit={handleAddStop} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
                    Select Destination
                  </label>
                  <select 
                    required
                    value={newStopForm.cityId}
                    onChange={(e) => setNewStopForm({...newStopForm, cityId: e.target.value})}
                    className="w-full rounded-xl border border-stone-300 bg-transparent px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-stone-600 dark:focus:border-blue-400"
                  >
                    <option value="">Choose a city...</option>
                    {cities.map(city => (
                      <option key={city.id} value={city.id}>
                        {city.name}, {city.state}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
                      Start Date
                    </label>
                    <input 
                      type="date" 
                      required
                      min={trip.start_date ? trip.start_date.split('T')[0] : ''}
                      max={trip.end_date ? trip.end_date.split('T')[0] : ''}
                      value={newStopForm.startDate}
                      onChange={(e) => setNewStopForm({...newStopForm, startDate: e.target.value})}
                      className="w-full rounded-xl border border-stone-300 bg-transparent px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-stone-600"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
                      End Date
                    </label>
                    <input 
                      type="date" 
                      required
                      min={newStopForm.startDate || (trip.start_date ? trip.start_date.split('T')[0] : '')}
                      max={trip.end_date ? trip.end_date.split('T')[0] : ''}
                      value={newStopForm.endDate}
                      onChange={(e) => setNewStopForm({...newStopForm, endDate: e.target.value})}
                      className="w-full rounded-xl border border-stone-300 bg-transparent px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-stone-600"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={addingStop}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-70"
                >
                  {addingStop ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                  Add Stop to Itinerary
                </button>
              </form>
            </div>
          </div>
          
        </div>
      </div>

      {/* Slide-over Drawer for Activities */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white shadow-2xl dark:bg-stone-800 sm:w-96 flex flex-col h-full"
            >
            <div className="flex items-center justify-between border-b border-stone-200 p-6 dark:border-stone-700">
              <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100">Add Activity</h3>
              <button 
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {loadingActivities ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="mb-4 h-8 w-8 animate-spin text-blue-500" />
                  <p className="text-stone-500">Finding best activities...</p>
                </div>
              ) : cityActivities.length === 0 ? (
                <div className="text-center py-12 text-stone-500">
                  <MapPin className="mx-auto mb-3 h-12 w-12 opacity-50" />
                  No activities found for this city.
                </div>
              ) : (
                <div className="space-y-4">
                  {cityActivities.map((activity) => (
                    <div key={activity.id} className="group overflow-hidden rounded-2xl border border-white/12 bg-night-900/50 transition-all hover:border-cyan-400/30 hover:shadow-lg">
                      {(activity.image || activity.imageUrl) && (
                        <img 
                          src={activity.image || activity.imageUrl} 
                          alt={activity.name}
                          className="h-32 w-full object-cover"
                        />
                      )}
                      <div className="p-4">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <h4 className="font-bold text-stone-800 dark:text-stone-100 leading-tight">{activity.name}</h4>
                          <span className="shrink-0 rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                            {activity.type}
                          </span>
                        </div>
                        <div className="mb-4 flex flex-wrap gap-3 text-xs text-stone-400">
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {activity.duration_hrs != null ? `${activity.duration_hrs}h` : activity.duration != null ? `${activity.duration} mins` : '—'}</span>
                          <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> {activity.cost > 0 ? activity.cost : 'Free'}</span>
                        </div>
                        <button 
                          onClick={() => handleAddActivity(activity.id)}
                          className="w-full rounded-xl bg-stone-100 py-2 text-sm font-semibold text-stone-700 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-stone-700 dark:text-stone-200 dark:group-hover:bg-blue-500"
                        >
                          Add to Stop
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </TravelShell>
  );
}
