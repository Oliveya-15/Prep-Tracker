import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { X } from 'lucide-react'

export default function RewardModal({ badge, onClose }) {
  useEffect(() => {
    if (!badge) return
    const duration = 1400
    const end = Date.now() + duration
    const colors = ['#2C4FE0', '#D98C22', '#2C8F5C', '#C9A227']

    ;(function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 65, origin: { x: 0 }, colors })
      confetti({ particleCount: 4, angle: 120, spread: 65, origin: { x: 1 }, colors })
      if (Date.now() < end) requestAnimationFrame(frame)
    })()

    confetti({ particleCount: 90, spread: 100, origin: { y: 0.4 }, colors })
  }, [badge])

  if (!badge) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-surface border border-line rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center animate-[pop_.35s_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="absolute top-3 right-3 text-muted hover:text-ink" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <div className="text-6xl mb-3">{badge.emoji}</div>
        <div className="font-mono text-xs uppercase tracking-widest text-amber mb-1">Badge unlocked</div>
        <h2 className="text-xl font-bold font-mono mb-3">{badge.label}</h2>
        <p className="text-sm text-muted leading-relaxed mb-6">{badge.message}</p>
        <button className="btn-primary mx-auto" onClick={onClose}>Keep going</button>
      </div>
      <style>{`
        @keyframes pop {
          0% { transform: scale(0.85); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
