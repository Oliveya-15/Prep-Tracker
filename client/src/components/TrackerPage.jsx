import { useState, useMemo } from 'react'
import { ChevronRight, Pencil, Trash2, Plus, ImagePlus, Loader2 } from 'lucide-react'
import { useTracker } from '../hooks/useTracker.js'
import { dayProgress, isDayComplete, dayTaskCounts, computeCurrentDay, computeOverallProgress, computeStreaks } from '../utils/trackerUtils.js'
import DayEditor from './DayEditor.jsx'
import RewardModal from './RewardModal.jsx'

function tagClass(tag) {
  const t = (tag || '').toLowerCase()
  if (t === 'medium') return 'tag tag-medium'
  if (t === 'topic') return 'tag tag-topic'
  return 'tag tag-easy'
}

function WeekNotes({ week, value, onLocalChange, onCommit }) {
  const v = value || { text: '', image: null }

  function handleImage(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 900_000) {
      alert('That image is a bit large — try one under ~900KB (a screenshot works better than a full-res photo).')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const next = { ...v, image: reader.result }
      onLocalChange(next)
      onCommit(next)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="border border-dashed border-line rounded-xl p-4 my-3 bg-surface">
      <h3 className="font-mono text-[11px] uppercase tracking-wide text-muted mb-2">Week {week} — notes & diagrams</h3>
      <textarea
        className="textarea-note min-h-[80px]"
        placeholder="Formulas, diagrams described in words, a summary of the week — whatever's useful..."
        value={v.text}
        onChange={(e) => onLocalChange({ ...v, text: e.target.value })}
        onBlur={() => onCommit(v)}
      />
      <div className="flex items-center gap-3 mt-2 flex-wrap">
        <label className="btn-ghost cursor-pointer">
          <ImagePlus size={13} /> {v.image ? 'Replace image' : 'Attach a diagram / photo'}
          <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
        </label>
        {v.image && (
          <>
            <img src={v.image} alt={`Week ${week} attachment`} className="max-w-[140px] max-h-[100px] rounded-lg border border-line object-cover" />
            <button
              type="button"
              className="btn-danger-ghost"
              onClick={() => { const next = { ...v, image: null }; onLocalChange(next); onCommit(next) }}
            >
              Remove
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function TrackerPage({ trackerType, title, subtitle, showPushTask, pushLabel, graphLabel, methodBox, referenceSections }) {
  const [rewardBadge, setRewardBadge] = useState(null)
  const { days, progress, loading, error, toggleTask, setNoteLocal, commitNote, togglePush, setWeekNoteLocal, commitWeekNote, addDay, updateDay, deleteDay } =
    useTracker(trackerType, { showPushTask, onBadgeUnlocked: setRewardBadge })

  const [selectedMonth, setSelectedMonth] = useState(1)
  const [openDay, setOpenDay] = useState(null) // dayNumber, or 'all' / 'none'
  const [editingDayId, setEditingDayId] = useState(null) // '_id' or `new-${week}`

  const months = useMemo(() => {
    const set = new Set(days.map((d) => d.month))
    set.add(1)
    return [...set].sort((a, b) => a - b)
  }, [days])

  const monthDays = useMemo(
    () => days.filter((d) => d.month === selectedMonth).sort((a, b) => a.dayNumber - b.dayNumber),
    [days, selectedMonth]
  )

  const currentDay = useMemo(() => computeCurrentDay(monthDays, progress, showPushTask), [monthDays, progress, showPushTask])
  const overall = useMemo(() => computeOverallProgress(monthDays, progress, showPushTask), [monthDays, progress, showPushTask])
  const streaks = useMemo(() => computeStreaks(monthDays, progress, showPushTask), [monthDays, progress, showPushTask])

  const weekNumbers = useMemo(() => {
    const set = new Set(monthDays.map((d) => d.week))
    ;[1, 2, 3, 4].forEach((w) => set.add(w))
    return [...set].sort((a, b) => a - b)
  }, [monthDays])

  function isOpen(dayNumber) {
    if (openDay === 'all') return true
    if (openDay === 'none') return false
    return openDay === dayNumber
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted text-sm py-10">
        <Loader2 size={16} className="animate-spin" /> Loading {title}...
      </div>
    )
  }

  if (error) {
    return (
      <div className="card border-danger/40 bg-danger-soft text-sm">
        <div className="font-semibold text-danger mb-1">Couldn't load this tracker</div>
        <div className="text-ink/80">{error}</div>
        <div className="text-muted mt-2 text-xs">Check that the backend server is running and VITE_API_URL is set correctly.</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
        <div className="font-mono text-[11.5px] uppercase tracking-wide text-muted">Month {selectedMonth}</div>
        <div className="flex gap-1.5">
          {months.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMonth(m)}
              className={`font-mono text-xs px-2.5 py-1 rounded-md border ${m === selectedMonth ? 'bg-accent text-white border-accent' : 'border-line text-muted hover:border-accent hover:text-accent'}`}
            >
              M{m}
            </button>
          ))}
          <button
            className="font-mono text-xs px-2.5 py-1 rounded-md border border-dashed border-line text-muted hover:border-accent hover:text-accent"
            onClick={() => setSelectedMonth(Math.max(...months) + 1)}
            title="Start a new month"
          >
            + Month
          </button>
        </div>
      </div>
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">{title}</h1>
      <p className="text-muted text-sm mb-6 max-w-2xl">{subtitle}</p>

      {methodBox}

      <div className="card mb-6">
        <div className="flex flex-wrap gap-6 items-end justify-between mb-4">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-wide text-muted">Current streak</div>
            <div className="font-mono text-2xl font-semibold text-amber">{streaks.current} {streaks.current === 1 ? 'day' : 'days'}</div>
          </div>
          <div>
            <div className="font-mono text-[11px] uppercase tracking-wide text-muted">Best streak</div>
            <div className="font-mono text-2xl font-semibold">{streaks.best} {streaks.best === 1 ? 'day' : 'days'}</div>
          </div>
          <div>
            <div className="font-mono text-[11px] uppercase tracking-wide text-muted">Tasks done</div>
            <div className="font-mono text-2xl font-semibold text-accent">{overall.done} / {overall.total}</div>
          </div>
        </div>
        <div className="h-2 rounded-full bg-surface-alt overflow-hidden mb-4">
          <div className="h-full bg-accent transition-all" style={{ width: `${overall.pct}%` }} />
        </div>
        <div className="font-mono text-[11px] uppercase tracking-wide text-muted mb-2">{graphLabel}</div>
        <div className="grid grid-cols-7 gap-1.5 max-w-[300px]">
          {monthDays.map((d) => {
            const done = isDayComplete(d, progress, showPushTask)
            return (
              <div
                key={d._id}
                title={`Day ${d.dayNumber}${done ? ' — complete' : ''}`}
                className={`aspect-square rounded border ${done ? 'bg-amber border-amber' : 'bg-surface-alt border-line'} ${d.dayNumber === currentDay ? 'ring-2 ring-accent ring-offset-1' : ''}`}
              />
            )
          })}
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button className="btn-ghost" onClick={() => setOpenDay('none')}>Collapse all</button>
        <button className="btn-ghost" onClick={() => setOpenDay('all')}>Expand all</button>
      </div>

      {weekNumbers.map((week) => (
        <div key={week}>
          <div className="flex items-baseline gap-2.5 mt-7 mb-3">
            <span className="font-mono text-xs font-semibold bg-ink text-bg px-2 py-0.5 rounded">WEEK {week}</span>
          </div>

          {monthDays.filter((d) => d.week === week).map((d) => {
            const { done, total } = dayTaskCounts(d, progress, showPushTask)
            const complete = total > 0 && done === total
            const open = isOpen(d.dayNumber)
            const p = dayProgress(d, progress)
            const editing = editingDayId === d._id

            return (
              <div key={d._id} className={`bg-surface border rounded-xl mb-2 overflow-hidden ${open ? 'border-accent' : 'border-line'}`}>
                <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => setOpenDay(open ? 'none' : d.dayNumber)}>
                  <span className="font-mono text-xs text-muted min-w-[46px]">DAY {d.dayNumber}</span>
                  <span className="font-semibold text-sm flex-1">{d.title}</span>
                  <span className={`font-mono text-xs whitespace-nowrap ${complete ? 'text-done' : 'text-muted'}`}>{done}/{total}</span>
                  <button
                    className="text-muted hover:text-accent p-1"
                    onClick={(e) => { e.stopPropagation(); setEditingDayId(editing ? null : d._id); setOpenDay(d.dayNumber) }}
                    aria-label="Edit day"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="text-muted hover:text-danger p-1"
                    onClick={(e) => { e.stopPropagation(); if (confirm(`Delete Day ${d.dayNumber} — "${d.title}"? This can't be undone.`)) deleteDay(d._id) }}
                    aria-label="Delete day"
                  >
                    <Trash2 size={14} />
                  </button>
                  <ChevronRight size={14} className={`text-muted transition-transform ${open ? 'rotate-90' : ''}`} />
                </div>

                {open && (
                  <div className="px-4 pb-4 border-t border-line">
                    {editing ? (
                      <DayEditor
                        initial={d}
                        onSave={async (payload) => { await updateDay(d._id, payload); setEditingDayId(null) }}
                        onCancel={() => setEditingDayId(null)}
                      />
                    ) : (
                      <>
                        {d.concept.length > 0 && (
                          <div className="my-3 p-3 bg-surface-alt rounded-lg space-y-1.5">
                            {d.concept.map((c, i) => (
                              <p key={i} className="text-[13.5px] leading-relaxed"><span className="text-muted">→ </span>{c}</p>
                            ))}
                          </div>
                        )}

                        {d.tasks.map((t, i) => {
                          const checked = !!p.taskChecks[i]
                          return (
                            <div key={i} className="py-2.5 border-b border-line last:border-b-0">
                              <div className="flex items-start gap-2.5">
                                <input
                                  type="checkbox"
                                  className="mt-0.5 w-4 h-4 accent-accent shrink-0"
                                  checked={checked}
                                  onChange={(e) => toggleTask(d._id, i, e.target.checked)}
                                />
                                <label className={`text-[13.5px] leading-snug ${checked ? 'text-muted line-through' : ''}`}>
                                  {t.type === 'link'
                                    ? <a href={t.url} target="_blank" rel="noopener noreferrer" className="text-accent underline decoration-accent-soft hover:decoration-accent">{t.text}</a>
                                    : t.text}
                                  {t.tag && <span className={`${tagClass(t.tag)} ml-1.5`}>{t.tag}</span>}
                                </label>
                              </div>
                              <textarea
                                className="textarea-note ml-6 mt-1.5"
                                style={{ width: 'calc(100% - 1.5rem)' }}
                                placeholder="Your notes on this..."
                                value={p.taskNotes[i] || ''}
                                onChange={(e) => setNoteLocal(d._id, i, e.target.value)}
                                onBlur={(e) => commitNote(d._id, i, e.target.value)}
                              />
                            </div>
                          )
                        })}

                        {showPushTask && (
                          <div className="py-2.5">
                            <div className="flex items-start gap-2.5">
                              <input
                                type="checkbox"
                                className="mt-0.5 w-4 h-4 accent-accent shrink-0"
                                checked={p.pushChecked}
                                onChange={(e) => togglePush(d._id, e.target.checked)}
                              />
                              <label className={`text-[13.5px] leading-snug ${p.pushChecked ? 'text-muted line-through' : ''}`}>
                                <span className="text-amber">⤴ </span>{pushLabel}
                              </label>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {editingDayId === `new-${week}` ? (
            <DayEditor
              defaultWeek={week}
              onSave={async (payload) => { await addDay({ ...payload, month: selectedMonth }); setEditingDayId(null) }}
              onCancel={() => setEditingDayId(null)}
            />
          ) : (
            <button className="btn-ghost" onClick={() => setEditingDayId(`new-${week}`)}>
              <Plus size={13} /> Add day to Week {week}
            </button>
          )}

          <WeekNotes
            month={selectedMonth}
            week={week}
            value={progress?.weekNotes?.[`${selectedMonth}:${week}`]}
            onLocalChange={(val) => setWeekNoteLocal(selectedMonth, week, val)}
            onCommit={(val) => commitWeekNote(selectedMonth, week, val)}
          />
        </div>
      ))}

      {referenceSections && referenceSections.length > 0 && (
        <div className="mt-8 space-y-2">
          {referenceSections.map((r, i) => (
            <details key={i} className="bg-surface border border-line rounded-xl px-4">
              <summary className="py-3 font-semibold text-sm cursor-pointer">{r.title}</summary>
              <div className="pb-4 text-sm leading-relaxed text-ink/90">{r.body}</div>
            </details>
          ))}
        </div>
      )}

      <RewardModal badge={rewardBadge} onClose={() => setRewardBadge(null)} />
    </div>
  )
}
