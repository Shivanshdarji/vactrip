import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, Sparkles } from 'lucide-react';
import api from '../api/axios.js';
import TravelShell from '../components/TravelShell.jsx';
import AppNavbar from '../components/AppNavbar.jsx';
import { activityImageUrl } from '../config/activityImages.js';

const TYPES = [
  { value: '', label: 'All vibes' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'food', label: 'Food' },
  { value: 'culture', label: 'Culture' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'sightseeing', label: 'Sightseeing' },
  { value: 'shopping', label: 'Shopping' },
];

export default function ActivitiesBrowse() {
  const [activities, setActivities] = useState([]);
  const [type, setType] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const params = {};
        if (type) params.type = type;
        if (cityQuery.trim()) params.city = cityQuery.trim();
        const { data } = await api.get('/activities', { params });
        if (!cancelled) setActivities(Array.isArray(data?.data) ? data.data : []);
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || 'Could not load activities.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    const t = setTimeout(load, 280);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [type, cityQuery]);

  return (
    <TravelShell>
      <AppNavbar />
      <main className="relative flex-1 px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/8 p-8 shadow-2xl backdrop-blur-2xl sm:p-12"
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-fuchsia-500/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="relative z-10">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/90">
                <Sparkles className="h-4 w-4" />
                Experience library
              </p>
              <h1 className="mt-4 max-w-3xl font-display text-4xl font-medium tracking-tight text-white sm:text-5xl">
                Activities worth building a day around.
              </h1>
              <p className="mt-4 max-w-2xl text-sm text-stone-300 sm:text-base">
                Browse the full catalog with rich photography, then add picks to your stops inside
                the trip builder.
              </p>

              <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                  <input
                    value={cityQuery}
                    onChange={(e) => setCityQuery(e.target.value)}
                    placeholder="Filter by city name…"
                    className="w-full rounded-2xl border border-white/15 bg-night-950/40 py-3 pl-11 pr-4 text-sm text-white outline-none backdrop-blur-xl placeholder:text-stone-500 focus:border-cyan-400/40"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {TYPES.map((t) => (
                    <button
                      key={t.value || 'all'}
                      type="button"
                      onClick={() => setType(t.value)}
                      className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                        type === t.value
                          ? 'bg-gradient-to-r from-cyan-400 to-violet-500 text-night-950 shadow-lg'
                          : 'border border-white/15 bg-white/5 text-stone-200 hover:bg-white/10'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          <div className="mt-12">
            {error ? (
              <div className="mb-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-96 animate-pulse rounded-2xl border border-white/10 bg-white/5"
                  />
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 py-16 text-center text-stone-400">
                No activities match these filters.
              </div>
            ) : (
              <motion.div
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.05 } } }}
                className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
              >
                {activities.map((a) => (
                  <motion.article
                    key={a.id}
                    variants={{
                      hidden: { opacity: 0, y: 24 },
                      show: { opacity: 1, y: 0 },
                    }}
                    className="group overflow-hidden rounded-2xl border border-white/12 bg-night-900/35 shadow-xl backdrop-blur-md transition hover:-translate-y-1 hover:border-cyan-400/30"
                  >
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={activityImageUrl(a)}
                        alt={a.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/20 to-transparent" />
                      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                        {a.type ? (
                          <span className="rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                            {a.type}
                          </span>
                        ) : null}
                        {a.city_name ? (
                          <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
                            {a.city_name}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="space-y-2 p-5">
                      <h2 className="font-display text-xl font-semibold text-white">{a.name}</h2>
                      {a.description ? (
                        <p className="line-clamp-2 text-sm text-stone-400">{a.description}</p>
                      ) : null}
                      <Link
                        to="/trips"
                        className="inline-flex text-xs font-bold uppercase tracking-wider text-cyan-200 hover:text-white"
                      >
                        Add via trip builder →
                      </Link>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </TravelShell>
  );
}
