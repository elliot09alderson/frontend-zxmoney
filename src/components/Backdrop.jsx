// Ambient red/black backdrop: radial glows + floating orbs + subtle noise.
// Pure decoration, no interactivity.
export default function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* deep base */}
      <div className="absolute inset-0 bg-[#070306]" />

      {/* top-left crimson bloom */}
      <div
        className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full blur-3xl opacity-60 animate-pulse-slow"
        style={{
          background:
            'radial-gradient(circle at 30% 30%, rgba(255,43,68,0.55), rgba(229,13,42,0.25) 40%, transparent 70%)',
        }}
      />

      {/* bottom-right ember */}
      <div
        className="absolute -bottom-56 -right-32 h-[620px] w-[620px] rounded-full blur-3xl opacity-55"
        style={{
          background:
            'radial-gradient(circle at 60% 60%, rgba(138,5,32,0.7), rgba(76,2,16,0.35) 45%, transparent 75%)',
        }}
      />

      {/* middle floating orb */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[280px] w-[280px] rounded-full blur-3xl opacity-30 animate-float"
        style={{
          background:
            'radial-gradient(circle, rgba(255,91,108,0.5), transparent 70%)',
        }}
      />

      {/* subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        }}
      />

      {/* film grain */}
      <div className="absolute inset-0 noise" />

      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)',
        }}
      />
    </div>
  )
}
