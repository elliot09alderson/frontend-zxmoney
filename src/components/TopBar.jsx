import { LogOut, ArrowLeft } from 'lucide-react'
import Logo from './Logo'

export default function TopBar({ onBack, right, onSignOut, compactLogo }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            className="btn-ghost grid place-items-center h-9 w-9 rounded-full shrink-0"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        {!compactLogo && <Logo />}
        {compactLogo && (
          <div className="min-w-0 truncate font-display text-lg font-semibold tracking-tight">
            {compactLogo}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {right}
        {onSignOut && (
          <button
            onClick={onSignOut}
            className="btn-ghost inline-flex items-center gap-1.5 rounded-full px-3 h-9 text-[12px]"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        )}
      </div>
    </div>
  )
}
