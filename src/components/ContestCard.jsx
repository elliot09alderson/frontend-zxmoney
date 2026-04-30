import { motion } from 'framer-motion'
import { Gift, Timer } from 'lucide-react'

function timeLeft(ts) {
  const d = Math.max(0, Math.round((ts - Date.now()) / 86400_000))
  if (d <= 0) return 'ending soon'
  if (d === 1) return '1 day left'
  return `${d} days left`
}

export default function ContestCard({ c, index = 0, onClick }) {
  return (
    <motion.button
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="relative snap-start shrink-0 w-[260px] text-left glass rounded-3xl overflow-hidden"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={c.image} alt={c.title} className="h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/10 to-transparent" />
        <div className="absolute top-3 left-3">
          <span className="chip backdrop-blur-md">
            <Gift className="h-3 w-3" /> contest
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="font-display text-[15px] font-semibold leading-tight">{c.title}</div>
        <div className="mt-1 text-[12px] text-white/55 line-clamp-2">{c.description}</div>
        <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-crimson-300/90">
          <Timer className="h-3 w-3" />
          {timeLeft(c.endsAt)}
        </div>
      </div>
    </motion.button>
  )
}
