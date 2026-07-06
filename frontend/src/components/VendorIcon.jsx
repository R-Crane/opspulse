// Simple monogram badges per vendor. Deliberately generic (no reproduced
// brand logos/marks) — just a colored initial that's enough to scan the
// dashboard at a glance.
const VENDOR_STYLES = {
  GitHub: { label: 'GH', className: 'bg-slate-500/20 text-slate-300' },
  Apple: { label: '', className: 'bg-slate-300/20 text-slate-200' },
  'Amazon Web Services': { label: 'AWS', className: 'bg-orange-500/20 text-orange-300' },
  Sony: { label: 'PS', className: 'bg-blue-500/20 text-blue-300' },
  Nintendo: { label: 'N', className: 'bg-red-500/20 text-red-300' },
}

export default function VendorIcon({ vendor }) {
  const style = VENDOR_STYLES[vendor] || { label: vendor?.[0] || '?', className: 'bg-slate-500/20 text-slate-300' }
  return (
    <span
      className={`inline-flex items-center justify-center w-9 h-9 rounded-lg font-display font-semibold text-sm shrink-0 ${style.className}`}
      title={vendor}
    >
      {style.label}
    </span>
  )
}
