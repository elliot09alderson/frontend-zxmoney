import { motion } from 'framer-motion'
import { Star, Percent } from 'lucide-react'

export default function RestaurantCard({ r, onClick, index = 0 }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative text-left w-full glass rounded-3xl overflow-hidden"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={r.carousel?.[0] || r.profilePhotoUrl}
          alt={r.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/95 via-ink-950/20 to-transparent" />

        <div className="absolute top-3 right-3">
          <div className="chip backdrop-blur-md">
            <Percent className="h-3 w-3" /> {r.discountPct}% off
          </div>
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <div className="font-display text-[17px] font-semibold leading-tight truncate">
              {r.name}
            </div>
            <div className="text-[11px] text-white/60 mt-0.5 truncate">
              {r.cuisine} · {r.priceRange}
            </div>
          </div>
          <div className="inline-flex items-center gap-1 rounded-full glass-subtle px-2 py-1 text-[11px]">
            <Star className="h-3 w-3 fill-crimson-400 text-crimson-400" />
            <span className="tabular-nums">{r.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </motion.button>
  )
}
