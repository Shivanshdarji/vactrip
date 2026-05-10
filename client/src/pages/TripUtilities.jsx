import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft, CheckCircle2, Circle, Trash2, Edit2, 
  Plus, BookOpen, Lightbulb, Map as MapIcon, Loader2,
  AlertCircle, CheckSquare, X
} from 'lucide-react';
import TravelShell from '../components/TravelShell.jsx';
import AppNavbar from '../components/AppNavbar.jsx';
import { rememberTripId } from '../lib/lastTrip.js';

export default function TripUtilities() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [newItemName, setNewItemName] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [editNoteContent, setEditNoteContent] = useState('');

  useLayoutEffect(() => {
    rememberTripId(id);
  }, [id]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tripRes, checklistRes, notesRes] = await Promise.all([
        api.get(`/trips/${id}`),
        api.get(`/trips/${id}/checklist`),
        api.get(`/trips/${id}/notes`)
      ]);
      setTrip(tripRes.data);
      setChecklist(checklistRes.data);
      setNotes(notesRes.data);
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to load utilities data. Please try again.');
        toast.error('Failed to load data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddChecklist = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    try {
      const res = await api.post(`/trips/${id}/checklist`, { name: newItemName });
      setChecklist([res.data, ...checklist]);
      setNewItemName('');
    } catch (err) {
      toast.error('Failed to add item');
    }
  };

  const handleToggleChecklist = async (item) => {
    try {
      const updatedStatus = !item.is_packed;
      setChecklist(checklist.map(i => i.id === item.id ? { ...i, is_packed: updatedStatus } : i));
      await api.put(`/checklist/${item.id}`, { is_packed: updatedStatus });
    } catch (err) {
      fetchData();
      toast.error('Failed to update status');
    }
  };

  const handleDeleteChecklist = async (itemId) => {
    try {
      await api.delete(`/checklist/${itemId}`);
      setChecklist(checklist.filter(i => i.id !== itemId));
    } catch (err) {
      toast.error('Failed to delete item');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    const toastId = toast.loading('Saving note...');
    try {
      const res = await api.post(`/trips/${id}/notes`, { content: newNoteContent });
      setNotes([res.data, ...notes]);
      setNewNoteContent('');
      toast.success('Note saved', { id: toastId });
    } catch (err) {
      toast.error('Failed to add note', { id: toastId });
    }
  };

  const handleSaveEditNote = async () => {
    if (!editNoteContent.trim()) return;
    try {
      const res = await api.put(`/notes/${editingNote.id}`, { content: editNoteContent });
      setNotes(notes.map(n => n.id === editingNote.id ? res.data : n));
      setEditingNote(null);
      setEditNoteContent('');
      toast.success('Note updated');
    } catch (err) {
      toast.error('Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await api.delete(`/notes/${noteId}`);
      setNotes(notes.filter(n => n.id !== noteId));
      toast.success('Note deleted');
    } catch (err) {
      toast.error('Failed to delete note');
    }
  };

  if (loading) {
    return (
      <TravelShell>
        <AppNavbar />
        <div className="flex flex-1 items-center justify-center py-32">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-400" />
        </div>
      </TravelShell>
    );
  }

  if (error || !trip) {
    return (
      <TravelShell>
        <AppNavbar />
        <div className="flex flex-1 items-center justify-center px-4 py-32">
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-8 text-center text-rose-100 backdrop-blur-xl">
            <AlertCircle className="mx-auto mb-4 h-12 w-12" />
            <h2 className="mb-2 text-2xl font-bold">{error || 'Trip not found'}</h2>
            <button
              type="button"
              onClick={fetchData}
              className="mt-4 rounded-xl bg-rose-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-rose-400"
            >
              Try Again
            </button>
          </div>
        </div>
      </TravelShell>
    );
  }

  const totalItems = checklist.length;
  const completedItems = checklist.filter(i => i.is_packed).length;
  const remainingItems = totalItems - completedItems;
  const progressPercentage = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
  
  const circleRadius = 20;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference - (progressPercentage / 100) * circleCircumference;

  return (
    <TravelShell>
      <AppNavbar />
      <div className="min-h-0 flex-1 pb-20 font-sans text-stone-100">
      
      {/* Hero Section */}
      <div className="relative h-64 w-full overflow-hidden bg-stone-900 lg:h-80">
        <motion.div initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 1.5 }} className="absolute inset-0">
          {trip.cover_photo ? (
            <img src={trip.cover_photo} alt={trip.name} className="h-full w-full object-cover opacity-50" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-emerald-700 to-teal-900">
              <MapIcon className="h-24 w-24 text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/60 to-transparent" />
        </motion.div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="mx-auto max-w-6xl">
            <Link to="/trips" className="mb-4 inline-flex items-center text-sm font-semibold text-stone-300 transition-colors hover:text-white">
              <ArrowLeft className="mr-1 h-4 w-4" /> My Trips
            </Link>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-white md:text-5xl">Trip Utilities</h1>
                <p className="text-lg font-medium text-stone-300">{trip.name}</p>
              </motion.div>
              
              {/* Circular Progress Widget */}
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="flex items-center gap-4 rounded-2xl bg-white/10 px-6 py-4 backdrop-blur-md shadow-2xl border border-white/10">
                <div className="relative flex h-14 w-14 items-center justify-center">
                  <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r={circleRadius} stroke="currentColor" strokeWidth="4" fill="none" className="text-white/20" />
                    <motion.circle 
                      cx="24" cy="24" r={circleRadius} stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round"
                      className="text-emerald-400"
                      initial={{ strokeDashoffset: circleCircumference }}
                      animate={{ strokeDashoffset }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      style={{ strokeDasharray: circleCircumference }}
                    />
                  </svg>
                  <div className="absolute flex items-center justify-center text-[10px] font-bold text-white">
                    {progressPercentage}%
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-300">Packing Ready</p>
                  <p className="text-xl font-bold text-white">{completedItems} of {totalItems} items</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Packing Checklist Panel */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xl shadow-stone-200/40 dark:border-stone-800 dark:bg-stone-800 dark:shadow-none">
              <div className="mb-6 flex items-center justify-between border-b border-stone-100 pb-4 dark:border-stone-700">
                <h2 className="flex items-center gap-2 text-xl font-bold text-stone-800 dark:text-stone-100">
                  <CheckSquare className="h-6 w-6 text-emerald-500" />
                  Packing List
                </h2>
              </div>

              <form onSubmit={handleAddChecklist} className="mb-6 flex gap-2">
                <input 
                  type="text" placeholder="Add an item (e.g. Passport)" value={newItemName} onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-stone-600 dark:bg-stone-900/50 dark:focus:border-emerald-400"
                />
                <button type="submit" className="rounded-xl bg-emerald-500 p-2.5 text-white transition-colors hover:bg-emerald-600 active:scale-95">
                  <Plus className="h-5 w-5" />
                </button>
              </form>

              <div className="space-y-3">
                <AnimatePresence>
                  {checklist.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-2xl border border-dashed border-stone-200 p-8 text-center text-sm text-stone-500 dark:border-stone-700">
                      No items yet. Add your first packing item!
                    </motion.div>
                  ) : (
                    checklist.map(item => (
                      <motion.div 
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className={`group flex items-center justify-between rounded-2xl border px-4 py-3 transition-colors ${
                          item.is_packed ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-900/10' : 'border-stone-200 bg-white hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800/50 dark:hover:bg-stone-800'
                        }`}
                      >
                        <div className="flex flex-1 items-center gap-3 cursor-pointer" onClick={() => handleToggleChecklist(item)}>
                          <motion.div whileTap={{ scale: 0.8 }}>
                            {item.is_packed ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                            ) : (
                              <Circle className="h-5 w-5 text-stone-300 dark:text-stone-600 shrink-0" />
                            )}
                          </motion.div>
                          <span className={`text-sm font-medium transition-all ${item.is_packed ? 'text-emerald-700 line-through opacity-60 dark:text-emerald-400' : 'text-stone-800 dark:text-stone-200'}`}>
                            {item.name}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleDeleteChecklist(item.id)}
                          className="opacity-0 group-hover:opacity-100 rounded-md p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-500 transition-all dark:hover:bg-red-900/20 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Travel Tips Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 shadow-sm dark:border-blue-900/30 dark:from-blue-900/20 dark:to-blue-900/10">
              <h3 className="mb-4 flex items-center gap-2 font-bold text-blue-800 dark:text-blue-300">
                <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Pro Travel Tips
              </h3>
              <ul className="space-y-4 text-sm font-medium text-blue-900/80 dark:text-blue-200/80">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 rounded-full bg-blue-200 p-1 dark:bg-blue-800/50"><CheckSquare className="h-3 w-3 text-blue-700 dark:text-blue-300"/></span>
                  Carry offline maps on your phone.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 rounded-full bg-blue-200 p-1 dark:bg-blue-800/50"><CheckSquare className="h-3 w-3 text-blue-700 dark:text-blue-300"/></span>
                  Backup important documents digitally.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 rounded-full bg-blue-200 p-1 dark:bg-blue-800/50"><CheckSquare className="h-3 w-3 text-blue-700 dark:text-blue-300"/></span>
                  Keep emergency cash in different places.
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Trip Notes Panel */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xl shadow-stone-200/40 dark:border-stone-800 dark:bg-stone-800 dark:shadow-none">
              <div className="mb-6 flex items-center justify-between border-b border-stone-100 pb-4 dark:border-stone-700">
                <h2 className="flex items-center gap-2 text-xl font-bold text-stone-800 dark:text-stone-100">
                  <BookOpen className="h-6 w-6 text-blue-500" />
                  Travel Journal
                </h2>
              </div>

              <form onSubmit={handleAddNote} className="mb-8">
                <textarea 
                  rows="3" placeholder="Write a thought, reminder, or journal entry..." value={newNoteContent} onChange={(e) => setNewNoteContent(e.target.value)}
                  className="mb-3 w-full resize-none rounded-2xl border border-stone-300 bg-stone-50 p-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-stone-600 dark:bg-stone-900/50 dark:focus:border-blue-400"
                />
                <div className="flex justify-end">
                  <button type="submit" className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 hover:scale-105 active:scale-95">
                    <Plus className="h-4 w-4" /> Save Entry
                  </button>
                </div>
              </form>

              <div className="space-y-4">
                <AnimatePresence>
                  {notes.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-stone-200 p-16 text-center dark:border-stone-700">
                      <BookOpen className="mb-4 h-12 w-12 text-stone-300 dark:text-stone-600" />
                      <p className="text-stone-500 dark:text-stone-400 font-medium">Your journal is empty. Start writing your travel thoughts!</p>
                    </motion.div>
                  ) : (
                    notes.map((note, idx) => (
                      <motion.div 
                        key={note.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group relative overflow-hidden rounded-2xl border border-stone-100 bg-stone-50/50 p-6 transition-all hover:bg-white hover:shadow-lg dark:border-stone-700/50 dark:bg-stone-800/30 dark:hover:bg-stone-800/80"
                      >
                        {editingNote?.id === note.id ? (
                          <div className="space-y-3">
                            <textarea 
                              rows="3" value={editNoteContent} onChange={(e) => setEditNoteContent(e.target.value)}
                              className="w-full resize-none rounded-xl border border-blue-300 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-blue-600 dark:bg-stone-900 dark:focus:border-blue-400"
                            />
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setEditingNote(null)} className="rounded-lg px-4 py-2 text-sm font-semibold text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-700">Cancel</button>
                              <button onClick={handleSaveEditNote} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">Save Update</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="mb-4 whitespace-pre-wrap text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                              {note.content}
                            </p>
                            <div className="flex items-center justify-between border-t border-stone-200/60 pt-4 text-xs font-medium text-stone-400 dark:border-stone-700 dark:text-stone-500">
                              <span>{new Date(note.createdAt).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}</span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setEditingNote(note); setEditNoteContent(note.content); }} className="rounded-md p-1.5 hover:bg-stone-200 hover:text-blue-600 dark:hover:bg-stone-700 dark:hover:text-blue-400">
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button onClick={() => handleDeleteNote(note.id)} className="rounded-md p-1.5 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
          
        </div>
      </div>
      </div>
    </TravelShell>
  );
}
