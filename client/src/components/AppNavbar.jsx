import { useEffect, useLayoutEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Compass,
  Home,
  MapPinned,
  Sparkles,
  Wallet,
  Users,
  Heart,
  UserCircle,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Wrench,
  Map,
  PlusCircle,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.js';
import AdminTravelerSwitch from './AdminTravelerSwitch.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import { getLastTripId, subscribeLastTrip } from '../lib/lastTrip.js';

const navClass = ({ isActive }) =>
  `flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-white/15 text-white shadow-lg shadow-black/20'
      : 'text-stone-200/90 hover:bg-white/10 hover:text-white'
  }`;

const travelerLinks = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/cities', label: 'Explore', icon: Compass },
  { to: '/activities', label: 'Activities', icon: Sparkles },
  { to: '/trips', label: 'My Trips', icon: MapPinned },
  { to: '/trips/create', label: 'New trip', icon: PlusCircle },
  { to: '/community', label: 'Community', icon: Users },
  { to: '/saved-destinations', label: 'Saved', icon: Heart },
  { to: '/profile', label: 'Profile', icon: UserCircle },
];

export default function AppNavbar({ variant = 'traveler' }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastTripId, setLastTripId] = useState(getLastTripId);
  const [tripMenuOpen, setTripMenuOpen] = useState(false);

  useLayoutEffect(() => {
    setLastTripId(getLastTripId());
  }, [location.pathname]);

  useEffect(() => subscribeLastTrip(() => setLastTripId(getLastTripId())), []);

  useEffect(() => {
    setMobileOpen(false);
    setTripMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!tripMenuOpen) return;
    function handleDocClick(e) {
      const el = e.target;
      if (el instanceof Element && !el.closest('[data-trip-tools]')) {
        setTripMenuOpen(false);
      }
    }
    document.addEventListener('click', handleDocClick);
    return () => document.removeEventListener('click', handleDocClick);
  }, [tripMenuOpen]);

  if (variant === 'admin') {
    return (
      <header className="sticky top-0 z-50 border-b border-white/10 bg-night-950/45 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="font-display text-xl font-semibold tracking-tight text-white">Traveloop</span>
            <span className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
              Admin
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <AdminTravelerSwitch variant="onDark" />
            <ThemeToggle variant="onDark" />
            <span className="hidden text-sm text-stone-200 sm:inline">{user?.name}</span>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-white/10"
            >
              <LogOut className="h-3.5 w-3.5" />
              Log out
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-night-950/40 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/home" className="flex items-center gap-2 font-display text-xl font-semibold text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/90 to-violet-500/90 text-night-950 shadow-glow">
            <Map className="h-5 w-5" strokeWidth={2.2} />
          </span>
          Traveloop
        </Link>

        <nav className="hidden flex-1 flex-wrap items-center justify-center gap-1 lg:flex xl:gap-1.5">
          {travelerLinks.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={navClass} end={to === '/home'}>
              <Icon className="h-4 w-4 opacity-90" />
              {label}
            </NavLink>
          ))}

          <div className="relative" data-trip-tools>
            <button
              type="button"
              onClick={() => setTripMenuOpen((o) => !o)}
              className={`flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition ${
                tripMenuOpen ? 'bg-white/15 text-white' : 'text-stone-200/90 hover:bg-white/10 hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Trip tools
              <ChevronDown className={`h-4 w-4 transition ${tripMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {tripMenuOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-50 mt-2 min-w-[220px] rounded-2xl border border-white/15 bg-night-900/95 p-2 shadow-2xl backdrop-blur-xl"
                >
                  {lastTripId ? (
                    <>
                      <Link
                        to={`/trips/${lastTripId}/builder`}
                        className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-stone-100 hover:bg-white/10"
                        onClick={() => setTripMenuOpen(false)}
                      >
                        <MapPinned className="h-4 w-4 text-cyan-300" />
                        Builder
                      </Link>
                      <Link
                        to={`/trips/${lastTripId}/view`}
                        className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-stone-100 hover:bg-white/10"
                        onClick={() => setTripMenuOpen(false)}
                      >
                        <Sparkles className="h-4 w-4 text-violet-300" />
                        Itinerary
                      </Link>
                      <Link
                        to={`/trips/${lastTripId}/finance`}
                        className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-stone-100 hover:bg-white/10"
                        onClick={() => setTripMenuOpen(false)}
                      >
                        <Wallet className="h-4 w-4 text-emerald-300" />
                        Finance
                      </Link>
                      <Link
                        to={`/trips/${lastTripId}/utilities`}
                        className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-stone-100 hover:bg-white/10"
                        onClick={() => setTripMenuOpen(false)}
                      >
                        <Wrench className="h-4 w-4 text-amber-200" />
                        Checklists &amp; notes
                      </Link>
                    </>
                  ) : (
                    <p className="px-3 py-3 text-xs leading-relaxed text-stone-400">
                      Open any trip once — we&apos;ll remember it here for finance, builder, and utilities.
                    </p>
                  )}
                  <Link
                    to="/trips"
                    className="mt-1 block rounded-xl border border-white/10 px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-cyan-200 hover:bg-white/5"
                    onClick={() => setTripMenuOpen(false)}
                  >
                    All trips
                  </Link>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </nav>

        <div className="flex items-center gap-2">
          <AdminTravelerSwitch variant="onDark" />
          <ThemeToggle variant="onDark" />
          <span className="hidden max-w-[140px] truncate text-sm text-stone-200 xl:inline">{user?.name}</span>
          <button
            type="button"
            onClick={logout}
            className="hidden rounded-full border border-white/20 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-white/10 sm:inline"
          >
            Log out
          </button>
          <button
            type="button"
            className="rounded-full border border-white/20 p-2 text-white lg:hidden"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10 bg-night-950/70 lg:hidden"
          >
            <nav className="flex max-h-[70vh] flex-col gap-1 overflow-y-auto px-4 py-4">
              {travelerLinks.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={navClass} end={to === '/home'} onClick={() => setMobileOpen(false)}>
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
              <p className="mt-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                Trip tools
              </p>
              {lastTripId ? (
                <>
                  <NavLink
                    to={`/trips/${lastTripId}/finance`}
                    className={navClass}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Wallet className="h-4 w-4" />
                    Finance
                  </NavLink>
                  <NavLink
                    to={`/trips/${lastTripId}/utilities`}
                    className={navClass}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Wrench className="h-4 w-4" />
                    Utilities
                  </NavLink>
                  <NavLink
                    to={`/trips/${lastTripId}/builder`}
                    className={navClass}
                    onClick={() => setMobileOpen(false)}
                  >
                    <MapPinned className="h-4 w-4" />
                    Builder
                  </NavLink>
                </>
              ) : (
                <NavLink to="/trips" className={navClass} onClick={() => setMobileOpen(false)}>
                  <MapPinned className="h-4 w-4" />
                  Pick a trip
                </NavLink>
              )}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                }}
                className="mt-2 flex items-center justify-center gap-2 rounded-full border border-rose-400/30 bg-rose-500/10 py-3 text-sm font-semibold text-rose-100"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
