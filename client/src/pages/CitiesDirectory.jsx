import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Sparkles } from 'lucide-react';
import api from '../api/axios.js';
import TravelShell from '../components/TravelShell.jsx';
import AppNavbar from '../components/AppNavbar.jsx';

const COST_FILTERS = [
  { value: '', label: 'Any budget' },
  { value: 'budget', label: 'Budget' },
  { value: 'mid', label: 'Mid' },
  { value: 'premium', label: 'Premium' },
];

function costBadge(cost) {
  if (cost === 'premium') return 'border-amber-300/40 bg-amber-500/20 text-amber-100';
  if (cost === 'mid') return 'border-sky-300/40 bg-sky-500/20 text-sky-100';
  return 'border-emerald-300/40 bg-emerald-500/20 text-emerald-100';
}

export default function CitiesDirectory() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [cost, setCost] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const params = {};
        if (search.trim()) params.search = search.trim();
        if (cost) params.cost = cost;
        const { data } = await api.get('/cities', { params });
        if (!cancelled) {
          setCities(Array.isArray(data?.data) ? data.data : []);
        }
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || 'Could not load cities.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    const t = setTimeout(load, 320);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [search, cost]);

  const heroImage = useMemo(
    () =>
      cities[0]?.hero_image ||
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=2000&q=75',
    [cities]
  );

  return (
    <TravelShell>
      <AppNavbar />
      <main className="relative flex-1 px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        <section className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-white/15 shadow-2xl">
          <div className="absolute inset-0">
            <img src={heroImage} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-night-950/95 via-night-950/75 to-cyan-900/50" />
          </div>
          <div className="relative z-10 px-6 py-14 sm:px-12 sm:py-20">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/90">
                <MapPin className="h-4 w-4" />
                Destination atlas
              </p>
              <h1 className="mt-4 max-w-2xl font-display text-4xl font-medium tracking-tight text-white sm:text-5xl md:text-6xl">
                Explore cities crafted for real itineraries.
              </h1>
              <p className="mt-4 max-w-xl text-base text-stone-200/95">
                Search the catalog, filter by spend level, and dive into local highlights before you
                add stops to your trip.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search city name…"
                  className="w-full rounded-2xl border border-white/20 bg-night-950/50 py-3.5 pl-12 pr-4 text-sm text-white outline-none backdrop-blur-xl placeholder:text-stone-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {COST_FILTERS.map((f) => (
                  <button
                    key={f.value || 'all'}
                    type="button"
                    onClick={() => setCost(f.value)}
                    className={`rounded-full px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition ${
                      cost === f.value
                        ? 'bg-white text-night-950 shadow-lg'
                        : 'border border-white/20 bg-white/5 text-stone-200 hover:bg-white/10'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <div className="mx-auto mt-12 max-w-7xl">
          {error ? (
            <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-80 animate-pulse rounded-2xl border border-white/10 bg-white/5"
                />
              ))}
            </div>
          ) : cities.length === 0 ? (
            <div className="rounded-2xl border border-white/15 bg-white/5 p-12 text-center backdrop-blur-xl">
              <Sparkles className="mx-auto h-10 w-10 text-cyan-300" />
              <p className="mt-4 text-lg font-semibold text-white">No cities match</p>
              <p className="mt-2 text-sm text-stone-400">Try another search or budget filter.</p>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.06 } },
              }}
              className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
            >
              {cities.map((city) => (
                <motion.article
                  key={city.id}
                  variants={{
                    hidden: { opacity: 0, y: 22 },
                    show: { opacity: 1, y: 0 },
                  }}
                  className="group overflow-hidden rounded-2xl border border-white/12 bg-white/8 shadow-xl backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-400/35"
                >
                  <Link to={`/cities/${city.id}`} className="block">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={
                          city.hero_image ||
                          'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=70'
                        }
                        alt={city.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-night-950/90 via-night-950/25 to-transparent" />
                      <span
                        className={`absolute bottom-3 left-3 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${costBadge(
                          city.cost_index
                        )}`}
                      >
                        {city.cost_index || 'mid'}
                      </span>
                    </div>
                    <div className="p-5">
                      <h2 className="font-display text-xl font-semibold text-white">
                        {city.name}
                        <span className="ml-2 text-sm font-normal text-stone-400">{city.state}</span>
                      </h2>
                      <p className="mt-2 line-clamp-2 text-sm text-stone-300">
                        {Array.isArray(city.highlights) && city.highlights.length
                          ? city.highlights.slice(0, 3).join(' · ')
                          : 'Curated stops, food, and culture — open for the full guide.'}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-cyan-200">
                        View city guide →
                      </span>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </motion.div>
          )}
        </div>
      </main>
    </TravelShell>
  );
}
