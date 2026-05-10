import { motion } from 'framer-motion';
import { NatureCrossfade } from './NatureSlideshow.jsx';
import { NATURE_SLIDES } from '../config/nature.js';
import { useNatureRotator } from '../hooks/useNatureRotator.js';

/**
 * Full-viewport cinematic background (crossfade photos + aurora orbs + grain)
 * for all authenticated traveler pages.
 */
export default function TravelShell({ children }) {
  const slideIdx = useNatureRotator(NATURE_SLIDES.length, 6500);

  return (
    <div className="relative min-h-[100dvh] text-stone-100">
      <div className="fixed inset-0 z-0">
        <NatureCrossfade
          activeIndex={slideIdx}
          slides={NATURE_SLIDES}
          className="h-full min-h-[100dvh] animate-slow-pan"
          showDots={false}
        />
      </div>

      <div
        className="pointer-events-none fixed inset-0 z-[1] bg-gradient-to-b from-night-950/88 via-indigo-950/65 to-night-950/92"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 z-[1] bg-gradient-to-tr from-cyan-500/10 via-transparent to-fuchsia-500/10"
        aria-hidden
      />

      <motion.div
        className="pointer-events-none fixed -left-32 top-1/4 z-[2] h-72 w-72 rounded-full bg-cyan-400/25 blur-[100px]"
        animate={{ opacity: [0.35, 0.6, 0.35], scale: [1, 1.15, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none fixed -right-24 bottom-1/4 z-[2] h-80 w-80 rounded-full bg-violet-500/25 blur-[110px]"
        animate={{ opacity: [0.3, 0.55, 0.3], scale: [1.1, 1, 1.1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none fixed left-1/3 top-10 z-[2] h-56 w-56 rounded-full bg-emerald-400/15 blur-[90px]"
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      />

      <div
        className="pointer-events-none fixed inset-0 z-[3] opacity-[0.12] mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg_viewBox=%220_0_256_256%22_xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter_id=%22n%22%3E%3CfeTurbulence_type=%22fractalNoise%22_baseFrequency=%220.75%22_numOctaves=%224%22_stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect_width=%22100%25%22_height=%22100%25%22_filter=%22url(%23n)%22/%3E%3C/svg%3E')]"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-[100dvh] flex-col">{children}</div>
    </div>
  );
}
