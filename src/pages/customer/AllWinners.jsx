import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import TopBar from '../../components/TopBar'
import WinnerTile from '../../components/WinnerTile'
import { listWinners } from '../../lib/store'

export default function AllWinners({ go }) {
  const [ws, setWs] = useState([])
  useEffect(() => { listWinners().then(setWs) }, [])
  return (
    <div className="space-y-5">
      <TopBar onBack={() => go('home')} compactLogo="Winner gallery" />
      {ws.length === 0 ? (
        <div className="glass rounded-3xl p-8 text-center text-white/50 text-sm">
          <Trophy className="h-6 w-6 mx-auto mb-2 text-crimson-400/70" />
          No winners yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {ws.map((w, i) => <WinnerTile key={w.id} w={w} index={i} />)}
        </div>
      )}
    </div>
  )
}
