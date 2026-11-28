import { Loader2, X } from 'lucide-react'

// Small corner badge: "Saving..." while a note is being saved, or a dismissable message if saving failed.
export default function SaveStatus({ pending, error, onDismiss }) {
  if (error) {
    return (
      <div className="fixed bottom-4 right-4 z-40 max-w-xs flex items-start gap-2 bg-danger-soft border border-danger/40 text-danger text-xs rounded-lg px-3 py-2 shadow-lg">
        <span className="flex-1">Couldn't save your notes: {error} — they're still on screen and will retry.</span>
        <button type="button" onClick={onDismiss} aria-label="Dismiss"><X size={14} /></button>
      </div>
    )
  }
  if (pending > 0) {
    return (
      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-1.5 bg-surface border border-line text-muted font-mono text-[11px] rounded-lg px-2.5 py-1.5 shadow">
        <Loader2 size={12} className="animate-spin" /> Saving...
      </div>
    )
  }
  return null
}
