// Works with data as it comes back from the API:
//   day: { _id, month, week, dayNumber, title, concept, tasks: [{type,text,url,tag}] }
//   progress.days: { [dayId]: { taskChecks: [Bool], taskNotes: [String] (old), taskBlocks: { [taskIndex]: [blocks] }, pushChecked: Bool } }

// MongoDB can hand back an object like { "0": true } where we expect an array.
// This turns either shape into a real array so spreading / indexing never crashes.
export const asArray = (v) => (Array.isArray(v) ? v : Object.assign([], v || {}))

export function dayProgress(day, progress) {
  const p = progress?.days?.[day._id] || {}
  return { taskChecks: asArray(p.taskChecks), taskNotes: asArray(p.taskNotes), pushChecked: !!p.pushChecked }
}

export function isDayComplete(day, progress, showPushTask) {
  const p = dayProgress(day, progress)
  const allTasksChecked = day.tasks.every((_, i) => !!p.taskChecks[i])
  if (!showPushTask) return allTasksChecked
  return allTasksChecked && p.pushChecked
}

export function dayTaskCounts(day, progress, showPushTask) {
  const p = dayProgress(day, progress)
  let total = day.tasks.length + (showPushTask ? 1 : 0)
  let done = day.tasks.filter((_, i) => !!p.taskChecks[i]).length + (showPushTask && p.pushChecked ? 1 : 0)
  return { done, total }
}

export function computeCurrentDay(days, progress, showPushTask) {
  for (const d of days) {
    if (!isDayComplete(d, progress, showPushTask)) return d.dayNumber
  }
  return days.length ? days[days.length - 1].dayNumber : 1
}

export function computeOverallProgress(days, progress, showPushTask) {
  let total = 0
  let done = 0
  days.forEach((d) => {
    const c = dayTaskCounts(d, progress, showPushTask)
    total += c.total
    done += c.done
  })
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 }
}

// Streak = consecutive complete days, walked in dayNumber order.
export function computeStreaks(days, progress, showPushTask) {
  let best = 0
  let running = 0
  const sorted = [...days].sort((a, b) => a.dayNumber - b.dayNumber)
  sorted.forEach((d) => {
    if (isDayComplete(d, progress, showPushTask)) {
      running += 1
      best = Math.max(best, running)
    } else {
      running = 0
    }
  })
  let current = 0
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (isDayComplete(sorted[i], progress, showPushTask)) current += 1
    else break
  }
  return { current, best }
}
