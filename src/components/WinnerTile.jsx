import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'

export default function WinnerTile({ w, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative aspect-square rounded-2xl overflow-hidden glass"
    >
      <img src={w.photoUrl} alt={w.name} className="h-full w-full object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/95 via-ink-950/20 to-transparent" />
      <div className="absolute top-2 left-2">
        <span className="chip backdrop-blur-md">
          <Trophy className="h-3 w-3" /> winner
        </span>
      </div>
      <div className="absolute bottom-2 left-2 right-2">
        <div className="text-[12px] font-semibold leading-tight truncate">{w.name}</div>
        <div className="text-[10px] text-white/65 truncate">{w.prize}</div>
      </div>
    </motion.div>
  )
}
