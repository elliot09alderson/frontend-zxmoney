import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import CustomerHome from './CustomerHome'
import RestaurantDetail from './RestaurantDetail'
import AllContests from './AllContests'
import AllWinners from './AllWinners'
import { auth } from '../../lib/auth'

export default function CustomerApp({ phone, onSignOut }) {
  const [view, setView] = useState({ name: 'home' })
  const go = (v) => {
    if (typeof v === 'string') setView({ name: v })
    else setView(v)
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={view.name + (view.id || '')}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.25 }}
      >
        {view.name === 'home' && (
          <CustomerHome
            phone={phone}
            onSignOut={onSignOut}
            openRestaurant={(id) => go({ name: 'restaurant', id })}
            openAllContests={() => go('contests')}
            openAllWinners={() => go('winners')}
            go={go}
          />
        )}
        {view.name === 'restaurant' && (
          <RestaurantDetail restaurantId={view.id} go={go} />
        )}
        {view.name === 'contests' && <AllContests go={go} />}
        {view.name === 'winners' && <AllWinners go={go} />}
      </motion.div>
    </AnimatePresence>
  )
}
