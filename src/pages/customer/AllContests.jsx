import { useEffect, useState } from 'react'
import { Gift } from 'lucide-react'
import TopBar from '../../components/TopBar'
import ContestCard from '../../components/ContestCard'
import { listContests } from '../../lib/store'

export default function AllContests({ go }) {
  const [cs, setCs] = useState([])
  useEffect(() => { listContests().then(setCs) }, [])
  return (
    <div className="space-y-5">
      <TopBar onBack={() => go('home')} compactLogo="All contests" />
      {cs.length === 0 ? (
        <div className="glass rounded-3xl p-8 text-center text-white/50 text-sm">
          <Gift className="h-6 w-6 mx-auto mb-2 text-crimson-400/70" />
          No active contests right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {cs.map((c, i) => (
            <div key={c.id} className="w-full">
              <ContestCard c={c} index={i} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
