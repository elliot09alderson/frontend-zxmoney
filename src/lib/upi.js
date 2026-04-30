// Build UPI deep links. All UPI apps accept the standard spec, but each has its
// own scheme too — we'll offer the universal `upi://` first and app-specific fallbacks.

export function buildUpi({ scheme = 'upi', vpa, name, amount, note }) {
  const params = new URLSearchParams()
  params.set('pa', vpa)
  params.set('pn', name || '')
  if (amount != null) params.set('am', Number(amount).toFixed(2))
  params.set('cu', 'INR')
  if (note) params.set('tn', note)
  return `${scheme}://pay?${params.toString()}`
}

export const UPI_APPS = [
  { id: 'gpay',   label: 'Google Pay', scheme: 'tez',     accent: '#4285F4' },
  { id: 'phonpe', label: 'PhonePe',    scheme: 'phonepe', accent: '#6739B7' },
  { id: 'paytm',  label: 'Paytm',      scheme: 'paytmmp', accent: '#00BAF2' },
  { id: 'any',    label: 'Any UPI app', scheme: 'upi',    accent: '#ff2b44' },
]
