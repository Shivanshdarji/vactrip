import { NATURE } from '../../config/nature.js';
import TravelShell from '../../components/TravelShell.jsx';
import AppNavbar from '../../components/AppNavbar.jsx';

export default function AdminDashboard() {
  return (
    <TravelShell>
      <AppNavbar variant="admin" />
      <div className="min-h-0 flex-1 pb-20 text-stone-100">
        <section className="relative overflow-hidden px-5 pt-10">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-white/12 shadow-2xl">
            <img
              src={NATURE.ridge}
              alt=""
              className="h-56 w-full object-cover md:h-72"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-night-950/95 via-indigo-950/70 to-emerald-900/40" />
            <div className="absolute bottom-0 left-0 p-8 md:p-10">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-emerald-200/90">
                Console
              </p>
              <h1 className="mt-3 max-w-2xl font-display text-4xl font-medium leading-tight tracking-tight text-white md:text-5xl">
                Command center for the journey.
              </h1>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-stone-200">
                Analytics, travelers, and platform momentum — this space will fill with live data in
                the next phase.
              </p>
            </div>
          </div>
        </section>

        <section className="relative z-20 px-5 pb-20 pt-10">
          <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-3">
            {[
              {
                label: 'Travelers',
                hint: 'Signups, roles, retention',
                img: NATURE.mountainLake,
              },
              {
                label: 'Trips',
                hint: 'Created, completed, public',
                img: NATURE.valley,
              },
              {
                label: 'Cities',
                hint: 'Stops, saves, momentum',
                img: NATURE.coast,
              },
            ].map((card) => (
              <article
                key={card.label}
                className="overflow-hidden rounded-2xl border border-white/12 bg-white/8 shadow-xl backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-400/30"
              >
                <div className="relative h-36">
                  <img src={card.img} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-night-950/80 to-transparent" />
                </div>
                <div className="p-5">
                  <h2 className="font-display text-xl font-medium text-white">{card.label}</h2>
                  <p className="mt-2 text-xs leading-relaxed text-stone-400">{card.hint}</p>
                  <div className="mt-4 h-px w-full bg-white/10">
                    <div className="h-px w-2/5 bg-cyan-400/80" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </TravelShell>
  );
}
