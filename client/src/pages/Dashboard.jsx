import { Link } from 'react-router-dom'
import { Code2, Calculator, CheckSquare, Loader2 } from 'lucide-react'
import { useTracker } from '../hooks/useTracker.js'
import { useTodos } from '../hooks/useTodos.js'
import { usePagesContext } from '../context/PagesContext.jsx'
import { computeCurrentDay, computeOverallProgress, computeStreaks } from '../utils/trackerUtils.js'
import { BADGES } from '../data/badges.js'

function AchievementShelf({ dsaBadges, aptBadges }) {
  const unlocked = new Set([...(dsaBadges || []), ...(aptBadges || [])])
  return (
    <div className="card mb-6">
      <div className="font-mono text-[11px] uppercase tracking-wide text-muted mb-3">Achievements</div>
      <div className="flex flex-wrap gap-2.5">
        {BADGES.map((b) => {
          const has = unlocked.has(b.id)
          return (
            <div
              key={b.id}
              title={has ? b.label : 'Keep going to unlock this one'}
              className={`flex flex-col items-center justify-center w-[72px] h-[72px] rounded-xl border text-center px-1 ${has ? 'border-gold bg-gold-soft' : 'border-line bg-surface-alt opacity-60'}`}
            >
              <span className="text-xl leading-none mb-1">{has ? b.emoji : '🔒'}</span>
              <span className="text-[9.5px] font-mono leading-tight text-muted">{has ? b.label : '???'}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const dsa = useTracker('dsa', { showPushTask: true })
  const apt = useTracker('aptitude', { showPushTask: false })
  const { todos } = useTodos()
  const { pages } = usePagesContext()

  const loading = dsa.loading || apt.loading

  if (loading) {
    return <div className="flex items-center gap-2 text-muted text-sm py-10"><Loader2 size={16} className="animate-spin" /> Loading dashboard...</div>
  }

  const dsaMonth1 = dsa.days.filter((d) => d.month === 1)
  const aptMonth1 = apt.days.filter((d) => d.month === 1)

  const dsaProgress = computeOverallProgress(dsaMonth1, dsa.progress, true)
  const dsaStreak = computeStreaks(dsaMonth1, dsa.progress, true)
  const dsaDay = computeCurrentDay(dsaMonth1, dsa.progress, true)

  const aptProgress = computeOverallProgress(aptMonth1, apt.progress, false)
  const aptStreak = computeStreaks(aptMonth1, apt.progress, false)
  const aptDay = computeCurrentDay(aptMonth1, apt.progress, false)

  const openTodos = todos.filter((t) => !t.done).length

  const dsaTodayTitle = dsaMonth1.find((d) => d.dayNumber === dsaDay)?.title || 'Month 1 complete 🎉'
  const aptTodayTitle = aptMonth1.find((d) => d.dayNumber === aptDay)?.title || 'Month 1 complete 🎉'

  return (
    <div>
      <div className="font-mono text-[11.5px] uppercase tracking-wide text-muted">Overview</div>
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">Dashboard</h1>
      <p className="text-muted text-sm mb-6 max-w-2xl">Everything in one place. Two things matter most right now — keep your DSA and Aptitude streaks alive.</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <Link to="/dsa" className="card hover:border-accent transition">
          <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-muted"><Code2 size={13} /> DSA</div>
          <div className="font-mono text-2xl font-semibold mt-1.5">{dsaProgress.pct}%</div>
          <div className="text-[12.5px] text-muted mt-0.5">Day {dsaDay}/{dsaMonth1.length || 28} · streak {dsaStreak.current}</div>
        </Link>
        <Link to="/aptitude" className="card hover:border-accent transition">
          <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-muted"><Calculator size={13} /> Aptitude</div>
          <div className="font-mono text-2xl font-semibold mt-1.5">{aptProgress.pct}%</div>
          <div className="text-[12.5px] text-muted mt-0.5">Day {aptDay}/{aptMonth1.length || 28} · streak {aptStreak.current}</div>
        </Link>
        <Link to="/todo" className="card hover:border-accent transition">
          <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-muted"><CheckSquare size={13} /> Todo</div>
          <div className="font-mono text-2xl font-semibold mt-1.5">{openTodos}</div>
          <div className="text-[12.5px] text-muted mt-0.5">open task{openTodos === 1 ? '' : 's'}</div>
        </Link>
        {pages.slice(0, 3).map((p) => (
          <Link key={p._id} to={`/pages/${p._id}`} className="card hover:border-accent transition">
            <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-muted">
              <span className="text-sm leading-none">{p.icon}</span> {p.title}
            </div>
            <div className="font-mono text-2xl font-semibold mt-1.5">{p.entries.length}</div>
            <div className="text-[12.5px] text-muted mt-0.5">entries</div>
          </Link>
        ))}
      </div>

      <AchievementShelf dsaBadges={dsa.progress?.badges} aptBadges={apt.progress?.badges} />

      <div className="card mb-6">
        <div className="font-mono text-[11px] uppercase tracking-wide text-muted mb-3">Today's focus</div>
        <div className="space-y-2 text-sm">
          <div><strong>DSA — Day {dsaDay}:</strong> {dsaTodayTitle}</div>
          <div><strong>Aptitude — Day {aptDay}:</strong> {aptTodayTitle}</div>
        </div>
      </div>

      <div className="card border-l-[3px] border-l-accent">
        <h2 className="font-mono text-xs uppercase tracking-wide text-accent mb-2.5">The rule that matters most</h2>
        <ul className="list-disc pl-4 space-y-1 text-[13.5px] leading-relaxed">
          <li>Struggle on a problem for 20-25 minutes before looking at any hint — that's what actually builds logic.</li>
          <li>Two done beats five planned. Missing a day isn't failure; missing a week is what breaks the habit.</li>
          <li>DSA and Aptitude both get a little every day. Don't let one eat the whole week.</li>
        </ul>
      </div>
    </div>
  )
}
