import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, IndianRupee, MapPin } from 'lucide-react';
import api from '../api/axios.js';
import TravelShell from '../components/TravelShell.jsx';
import AppNavbar from '../components/AppNavbar.jsx';
import { activityImageUrl } from '../config/activityImages.js';

const TYPE_CHIPS = [
  { value: '', label: 'All' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'food', label: 'Food' },
  { value: 'culture', label: 'Culture' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'sightseeing', label: 'Sightseeing' },
  { value: 'shopping', label: 'Shopping' },
];

export default function CityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [city, setCity] = useState(null);
  const [activities, setActivities] = useState([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [cityRes, actRes] = await Promise.all([
          api.get(`/cities/${id}`),
          api.get(`/cities/${id}/activities`, {
            params: typeFilter ? { type: typeFilter } : {},
          }),
        ]);
        if (cancelled) return;
        if (!cityRes.data?.success) throw new Error('City not found');
        setCity(cityRes.data.data);
        setActivities(Array.isArray(actRes.data?.data) ? actRes.data.data : []);
      } catch (e) {
        if (!cancelled) {
          if (e.response?.status === 404) setError('City not found.');
          else setError(e.response?.data?.message || 'Could not load city.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id, typeFilter]);

  if (loading) {
    return (
      <TravelShell>
        <AppNavbar />
        <div className="flex flex-1 items-center justify-center py-32">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      </TravelShell>
    );
  }

  if (error || !city) {
    return (
      <TravelShell>
        <AppNavbar />
        <div className="mx-auto max-w-lg flex-1 px-4 py-24 text-center">
          <p className="text-lg text-rose-200">{error || 'Not found'}</p>
          <Link
            to="/cities"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to explore
          </Link>
        </div>
      </TravelShell>
    );
  }

  const hero =
    city.hero_image ||
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2000&q=75';

  return (
    <TravelShell>
      <AppNavbar />
      <main className="relative flex-1">
        <section className="relative h-[min(52vh,520px)] w-full overflow-hidden">
          <img src={hero} alt={city.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/55 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
            <div className="mx-auto max-w-5xl">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-stone-300 transition hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-4xl font-medium text-white sm:text-5xl md:text-6xl"
              >
                {city.name}
              </motion.h1>
              <p className="mt-3 flex flex-wrap items-center gap-3 text-stone-300">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-cyan-300" />
                  {city.state}
                  {city.region ? ` · ${city.region}` : ''}
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                  {city.cost_index || 'mid'} tier
                </span>
              </p>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-5xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
          {city.description ? (
            <motion.article
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/12 bg-white/8 p-6 backdrop-blur-xl sm:p-8"
            >
              <h2 className="font-display text-2xl text-white">About</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-stone-300">
                {city.description}
              </p>
            </motion.article>
          ) : null}

          <section>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-medium text-white">Things to do</h2>
                <p className="mt-1 text-sm text-stone-400">
                  Filter the activity catalog for this destination.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {TYPE_CHIPS.map((c) => (
                  <button
                    key={c.value || 'all'}
                    type="button"
                    onClick={() => setTypeFilter(c.value)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                      typeFilter === c.value
                        ? 'bg-cyan-400 text-night-950'
                        : 'border border-white/15 bg-white/5 text-stone-300 hover:bg-white/10'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {activities.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-white/5 py-12 text-center text-stone-400">
                No activities in this filter yet.
              </p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {activities.map((a, idx) => (
                  <motion.article
                    key={a.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="group overflow-hidden rounded-2xl border border-white/12 bg-night-900/40 shadow-lg backdrop-blur-md"
                  >
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={activityImageUrl(a)}
                        alt={a.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-night-950/90 to-transparent" />
                      {a.type ? (
                        <span className="absolute bottom-2 left-2 rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                          {a.type}
                        </span>
                      ) : null}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-white">{a.name}</h3>
                      {a.description ? (
                        <p className="mt-2 line-clamp-2 text-sm text-stone-400">{a.description}</p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-stone-400">
                        {a.duration_hrs != null ? (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {a.duration_hrs}h
                          </span>
                        ) : null}
                        {a.cost != null ? (
                          <span className="inline-flex items-center gap-1">
                            <IndianRupee className="h-3.5 w-3.5" />
                            {Number(a.cost).toLocaleString('en-IN')}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </section>

          <div className="rounded-2xl border border-cyan-400/25 bg-gradient-to-r from-cyan-500/15 to-violet-600/15 p-6 text-center backdrop-blur-xl">
            <p className="text-sm text-stone-200">
              Ready to route this city into a real trip? Head to the builder and add it as a stop.
            </p>
            <Link
              to="/trips"
              className="mt-4 inline-flex rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-night-950 shadow-lg transition hover:bg-stone-100"
            >
              Open My Trips
            </Link>
          </div>
        </div>
      </main>
    </TravelShell>
  );
}
