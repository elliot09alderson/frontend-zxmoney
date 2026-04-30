import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Trophy, Gift, ChevronRight } from 'lucide-react'
import TopBar from '../../components/TopBar'
import RestaurantCard from '../../components/RestaurantCard'
import ContestCard from '../../components/ContestCard'
import WinnerTile from '../../components/WinnerTile'
import { auth, formatPhone } from '../../lib/auth'
import { listRestaurants, listContests, listWinners } from '../../lib/store'

export default function CustomerHome({ phone, go, onSignOut, openRestaurant, openAllContests, openAllWinners }) {
  const [rs, setRs] = useState([])
  const [cs, setCs] = useState([])
  const [ws, setWs] = useState([])
  const [q, setQ] = useState('')

  useEffect(() => {
    listRestaurants().then(setRs)
    listContests().then((list) => setCs(list.filter((c) => c.active !== false)))
    listWinners().then(setWs)
  }, [])

  const filtered = q
    ? rs.filter((r) =>
        (r.name + ' ' + (r.cuisine || '')).toLowerCase().includes(q.toLowerCase())
      )
    : rs

  return (
    <div className="space-y-6">
      <TopBar onSignOut={onSignOut} />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="glass rounded-3xl p-5 sm:p-6"
      >
        <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">
          Hey there
        </div>
        <div className="mt-1 font-display text-[22px] font-bold leading-tight">
          +91 {formatPhone(phone)} <span className="text-crimson-400">.</span>
        </div>
        <div className="mt-1 text-[13px] text-white/55">
          Scan restaurants, apply the zx coupon, pay with UPI & win rewards.
        </div>

        <label className="mt-4 glass-input flex items-center gap-3 rounded-2xl px-4 h-12">
          <Search className="h-[18px] w-[18px] text-white/55" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search restaurants or cuisines"
            className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-white/30"
          />
        </label>
      </motion.div>

      {/* Contests strip */}
      <section>
        <SectionHeader
          icon={Gift}
          title="Running contests"
          action={cs.length > 3 ? { label: 'View all', onClick: openAllContests } : null}
        />
        {cs.length === 0 ? (
          <EmptyMini text="No contests right now — check back soon." />
        ) : (
          <div className="-mx-5 px-5 overflow-x-auto snap-x snap-mandatory flex gap-3 pb-2 no-scrollbar">
            {cs.map((c, i) => (
              <ContestCard key={c.id} c={c} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Restaurants */}
      <section>
        <SectionHeader title="Restaurants near you" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((r, i) => (
            <RestaurantCard key={r.id} r={r} index={i} onClick={() => openRestaurant(r.id)} />
          ))}
          {filtered.length === 0 && <EmptyMini text="No matches." />}
        </div>
      </section>

      {/* Winners preview */}
      <section>
        <SectionHeader
          icon={Trophy}
          title="Winner gallery"
          action={ws.length > 0 ? { label: 'See all', onClick: openAllWinners } : null}
        />
        {ws.length === 0 ? (
          <EmptyMini text="No winners yet — be the first ✨" />
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {ws.slice(0, 6).map((w, i) => (
              <WinnerTile key={w.id} w={w} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function SectionHeader({ icon: Icon, title, action }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-crimson-400" />}
        <h2 className="font-display text-[17px] font-semibold tracking-tight">{title}</h2>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-1 text-[12px] text-crimson-300 hover:text-crimson-200 transition-colors"
        >
          {action.label}
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

function EmptyMini({ text }) {
  return (
    <div className="glass-subtle rounded-2xl p-5 text-center text-[13px] text-white/45">
      {text}
    </div>
  )
}
