import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import TravelShell from '../components/TravelShell.jsx';
import AppNavbar from '../components/AppNavbar.jsx';

const STATUS_GROUPS = [
  { key: 'upcoming', title: 'Upcoming', accent: 'from-cyan-400 to-blue-500' },
  { key: 'ongoing', title: 'Ongoing', accent: 'from-emerald-400 to-teal-500' },
  { key: 'completed', title: 'Completed', accent: 'from-fuchsia-400 to-violet-500' },
];

function formatDateRange(start, end) {
  if (!start && !end) return 'Dates not set';
  const startText = start ? new Date(start).toLocaleDateString() : 'Flexible start';
  const endText = end ? new Date(end).toLocaleDateString() : 'Flexible end';
  return `${startText} - ${endText}`;
}

function formatBudget(value) {
  const number = Number(value);
  if (Number.isNaN(number) || number <= 0) return 'Budget not set';
  return `INR ${number.toLocaleString('en-IN')}`;
}

function statusBadgeTone(status) {
  if (status === 'ongoing') return 'bg-emerald-500/20 text-emerald-100 border-emerald-300/30';
  if (status === 'completed') return 'bg-violet-500/20 text-violet-100 border-violet-300/30';
  return 'bg-cyan-500/20 text-cyan-100 border-cyan-300/30';
}

function visibilityBadge(isPublic) {
  return isPublic
    ? 'bg-amber-500/20 text-amber-100 border-amber-300/30'
    : 'bg-stone-700/50 text-stone-100 border-stone-300/20';
}

function TripSkeletonCard() {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/10 shadow-xl backdrop-blur-xl">
      <div className="h-40 animate-pulse bg-white/10" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-3/4 animate-pulse rounded bg-white/15" />
        <div className="h-4 w-full animate-pulse rounded bg-white/10" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="h-8 animate-pulse rounded bg-white/10" />
          <div className="h-8 animate-pulse rounded bg-white/10" />
        </div>
      </div>
    </article>
  );
}

function DeleteTripModal({ trip, pending, onCancel, onConfirm }) {
  if (!trip) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/20 bg-stone-900/95 p-6 text-stone-100 shadow-2xl">
        <h3 className="text-xl font-semibold">Delete this trip?</h3>
        <p className="mt-3 text-sm leading-relaxed text-stone-300">
          You are about to delete <span className="font-semibold text-white">{trip.name}</span>.
          This action is permanent and removes stops and itinerary data too.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded-xl border border-white/20 px-4 py-2 text-sm font-medium transition hover:bg-white/10 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:opacity-60"
          >
            {pending ? 'Deleting...' : 'Delete Trip'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TripCard({ trip, onDeleteClick }) {
  const coverSrc = trip.cover_photo || '/uploads/default-trip-cover.jpg';

  return (
    <motion.article 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      className="group overflow-hidden rounded-2xl border border-white/15 bg-white/10 shadow-2xl backdrop-blur-xl transition duration-300 hover:shadow-cyan-500/10"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={coverSrc}
          alt={trip.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=60';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-900/35 to-transparent" />
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
          <span
            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusBadgeTone(trip.status)}`}
          >
            {trip.status}
          </span>
          <span
            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${visibilityBadge(
              trip.is_public
            )}`}
          >
            {trip.is_public ? 'Public' : 'Private'}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="line-clamp-1 text-xl font-semibold text-white">{trip.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-300">
          {trip.description || 'No description yet. Open builder to personalize your itinerary.'}
        </p>

        <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-stone-300 sm:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-stone-400">Dates</p>
            <p className="mt-1">{formatDateRange(trip.start_date, trip.end_date)}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-stone-400">Budget</p>
            <p className="mt-1">{formatBudget(trip.budget)}</p>
          </div>
        </div>

        <div className="mt-3 text-xs text-stone-300">
          Stops planned: <span className="font-semibold text-white">{trip.stop_count || 0}</span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Link
            to={`/trips/${trip.id}/builder`}
            className="rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 px-3 py-2 text-center text-xs font-semibold text-stone-900 transition hover:from-cyan-300 hover:to-blue-400"
          >
            Open Builder
          </Link>
          <Link
            to={`/trips/${trip.id}/view`}
            className="rounded-lg border border-white/25 bg-white/5 px-3 py-2 text-center text-xs font-semibold text-white transition hover:bg-white/10"
          >
            View Itinerary
          </Link>
          <button
            type="button"
            className="rounded-lg border border-amber-300/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-100 transition hover:bg-amber-500/20"
          >
            Edit Trip
          </button>
          <button
            type="button"
            onClick={() => onDeleteClick(trip)}
            className="rounded-lg border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/20"
          >
            Delete Trip
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export default function MyTrips() {
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletePending, setDeletePending] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadTrips() {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/trips');
        if (!cancelled) {
          setTrips(Array.isArray(data?.trips) ? data.trips : []);
        }
      } catch (err) {
        if (cancelled) return;
        if (err.response?.status === 401) {
          setError('Your session expired. Please login again.');
          navigate('/login', { replace: true });
          return;
        }
        setError(
          err.response?.data?.message ||
            'Could not load your trips. Please check your connection and try again.'
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTrips();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // Group trips by status to show upcoming/ongoing/completed sections.
  const groupedTrips = useMemo(() => {
    const base = {
      upcoming: [],
      ongoing: [],
      completed: [],
    };

    for (const trip of trips) {
      if (base[trip.status]) base[trip.status].push(trip);
    }
    return base;
  }, [trips]);

  const hasTrips = trips.length > 0;

  function openDeleteModal(trip) {
    setDeleteTarget(trip);
  }

  function closeDeleteModal() {
    if (deletePending) return;
    setDeleteTarget(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    const removedTrip = deleteTarget;
    const previousTrips = trips;

    // Optimistic UI: remove card immediately for snappy UX.
    setTrips((prev) => prev.filter((item) => item.id !== removedTrip.id));
    setDeletePending(true);

    try {
      await api.delete(`/trips/${removedTrip.id}`);
      setDeleteTarget(null);
      toast.success('Trip deleted successfully');
    } catch (err) {
      // Roll back UI if delete fails.
      setTrips(previousTrips);
      if (err.response?.status === 401) {
        setError('Your session expired. Please login again.');
        navigate('/login', { replace: true });
      } else {
        toast.error(err.response?.data?.message || 'Failed to delete trip. Please try again.');
      }
    } finally {
      setDeletePending(false);
    }
  }

  return (
    <TravelShell>
      <AppNavbar />
      <section className="relative flex-1 overflow-hidden px-4 pb-14 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-10 overflow-hidden rounded-3xl border border-white/12 shadow-2xl"
          >
            <img
              src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=75"
              alt=""
              className="h-48 w-full object-cover sm:h-56"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-night-950/95 via-indigo-950/65 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/90">
                Your travel dashboard
              </p>
              <h1 className="mt-2 font-display text-3xl font-medium text-white sm:text-4xl">My Trips</h1>
            </div>
          </motion.div>

          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-stone-300 sm:text-base">
                Track every adventure phase, open the builder, and keep your itinerary polished.
              </p>
            </div>
            <Link
              to="/trips/create"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-semibold text-stone-900 shadow-lg shadow-cyan-500/30 transition hover:from-cyan-300 hover:to-blue-400"
            >
              + Create New Trip
            </Link>
          </div>

          {error ? (
            <div className="mb-6 rounded-xl border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="space-y-10">
              {STATUS_GROUPS.map((group) => (
                <section key={group.key}>
                  <div className="mb-4 h-7 w-40 animate-pulse rounded bg-white/15" />
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <TripSkeletonCard key={`${group.key}-${idx}`} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : !hasTrips ? (
            <div className="mx-auto max-w-3xl rounded-2xl border border-white/15 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl sm:p-12">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400/20 text-3xl">
                🧳
              </div>
              <h2 className="text-2xl font-semibold text-white">No trips yet</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-stone-300">
                Start with your first itinerary and turn your travel idea into a complete,
                day-by-day plan.
              </p>
              <Link
                to="/trips/create"
                className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-semibold text-stone-900 transition hover:from-cyan-300 hover:to-blue-400"
              >
                Create Your First Trip
              </Link>
            </div>
          ) : (
            <div className="space-y-12">
              {STATUS_GROUPS.map((group) => {
                const sectionTrips = groupedTrips[group.key];
                return (
                  <section key={group.key}>
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-2xl font-semibold text-white">{group.title}</h2>
                      <span
                        className={`rounded-full bg-gradient-to-r ${group.accent} px-3 py-1 text-xs font-semibold text-stone-900`}
                      >
                        {sectionTrips.length}
                      </span>
                    </div>

                    {sectionTrips.length === 0 ? (
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-stone-300">
                        No {group.title.toLowerCase()} trips yet.
                      </div>
                    ) : (
                      <motion.div layout className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        <AnimatePresence>
                          {sectionTrips.map((trip) => (
                            <TripCard key={trip.id} trip={trip} onDeleteClick={openDeleteModal} />
                          ))}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <DeleteTripModal
        trip={deleteTarget}
        pending={deletePending}
        onCancel={closeDeleteModal}
        onConfirm={confirmDelete}
      />
    </TravelShell>
  );
}
