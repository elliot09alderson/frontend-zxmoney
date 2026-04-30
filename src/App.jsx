import { useEffect, useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import Backdrop from './components/Backdrop'
import Logo from './components/Logo'
import PhoneEntry from './pages/PhoneEntry'
import OtpVerify from './pages/OtpVerify'
import SetPassword from './pages/SetPassword'
import SignIn from './pages/SignIn'
import PartnerOnboarding from './pages/admin/PartnerOnboarding'
import CustomerApp from './pages/customer/CustomerApp'
import AdminDashboard from './pages/admin/AdminDashboard'
import SuperAdmin from './pages/super/SuperAdmin'
import { auth } from './lib/auth'

export default function App() {
  const [view, setView] = useState('phone')
  const [phone, setPhone] = useState('')
  const [intent, setIntent] = useState('customer')
  const [session, setSession] = useState(null) // { phone, role, restaurant? }
  const [ready, setReady] = useState(false)

  const resolveSession = useCallback(async () => {
    auth.invalidateMe()
    const me = await auth.me()
    if (!me) { setSession(null); return null }
    setSession(me)
    setPhone(me.phone)
    return me
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const me = await resolveSession()
      // Deep-link: /<10-digit-phone> → pre-fill phone and route into OTP or sign-in
      const match = window.location.pathname.match(/^\/(\d{10})\/?$/)
      if (match && !me && !cancelled) {
        const deepPhone = match[1]
        setPhone(deepPhone)
        setIntent('customer')
        window.history.replaceState({}, '', '/')
        try {
          const { status } = await auth.lookup(deepPhone)
          if (cancelled) return
          if (status === 'needs-password') {
            setView('signin')
          } else {
            await auth.requestOtp(deepPhone)
            if (!cancelled) setView('otp')
          }
        } catch {
          // Fall back to manual phone entry on any error
        }
      }
      if (!cancelled) setReady(true)
    })()
    return () => { cancelled = true }
  }, [resolveSession])

  async function go(v) {
    if (v === 'home') {
      await resolveSession()
      setView('home')
      return
    }
    setView(v)
  }

  function signOut() {
    auth.signOut()
    setSession(null)
    setPhone('')
    setIntent('customer')
    setView('phone')
  }

  if (!ready) {
    return (
      <div className="relative min-h-[100dvh] grid place-items-center">
        <Backdrop />
        <div className="text-white/40 text-sm">Loading…</div>
      </div>
    )
  }

  // Partner onboarding takes priority: user has customer token but wants to become admin.
  if (view === 'partner-onboarding' && session) {
    return (
      <Shell withHeader>
        <PartnerOnboarding phone={session.phone} onDone={async () => {
          await resolveSession()
          setView('home')
        }} />
      </Shell>
    )
  }

  // Authenticated app routes
  if (session) {
    return (
      <div className="relative min-h-[100dvh] flex flex-col">
        <Backdrop />
        <main className="flex-1 px-5 pb-10 pt-6 sm:pt-8">
          <div className={`mx-auto ${
            session.role === 'super' ? 'max-w-6xl'
            : session.role === 'admin' ? 'max-w-3xl'
            : 'max-w-lg'
          }`}>
            {session.role === 'customer' && <CustomerApp phone={session.phone} onSignOut={signOut} />}
            {session.role === 'admin' && <AdminDashboard phone={session.phone} session={session} onRefresh={resolveSession} onSignOut={signOut} />}
            {session.role === 'super' && <SuperAdmin onSignOut={signOut} />}

            <footer className="mt-10 text-center">
              <div className="inline-flex items-center gap-2 text-[11px] text-white/35">
                <span className="h-1 w-1 rounded-full bg-crimson-400/70" />
                <span>zx.money · crafted with care</span>
                <span className="h-1 w-1 rounded-full bg-crimson-400/70" />
              </div>
            </footer>
          </div>
        </main>
      </div>
    )
  }

  // Auth flow (no session)
  return (
    <Shell withHeader>
      <AnimatePresence mode="wait">
        {view === 'phone' && (
          <PhoneEntry
            key="phone"
            phone={phone}
            setPhone={setPhone}
            intent={intent}
            setIntent={setIntent}
            go={go}
          />
        )}
        {view === 'otp' && <OtpVerify key="otp" phone={phone} go={go} />}
        {view === 'setpw' && (
          <SetPassword key="setpw" phone={phone} intent={intent} go={go} />
        )}
        {view === 'signin' && <SignIn key="signin" phone={phone} go={go} />}
      </AnimatePresence>
    </Shell>
  )
}

function Shell({ children, withHeader }) {
  return (
    <div className="relative min-h-[100dvh] flex flex-col">
      <Backdrop />
      {withHeader && (
        <header className="px-5 pt-6 sm:pt-8">
          <div className="mx-auto max-w-md flex items-center justify-between">
            <Logo />
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">
              v0.3 · beta
            </div>
          </div>
        </header>
      )}
      <main className="flex-1 px-5 pb-10 pt-6 sm:pt-10">
        <div className="mx-auto max-w-md">
          {children}
          <footer className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-[11px] text-white/35">
              <span className="h-1 w-1 rounded-full bg-crimson-400/70" />
              <span>zx.money · crafted with care</span>
              <span className="h-1 w-1 rounded-full bg-crimson-400/70" />
            </div>
          </footer>
        </div>
      </main>
    </div>
  )
}
