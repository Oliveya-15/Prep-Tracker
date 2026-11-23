import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../utils/api.js'
import { computeStreaks } from '../utils/trackerUtils.js'
import { newlyEarnedBadges } from '../data/badges.js'

// MongoDB can return { "0": ... } (an object) instead of an array — never spread it directly.
function setArrayIndex(arr, index, value, fill = '') {
  const next = Array.isArray(arr) ? [...arr] : Object.assign([], arr || {})
  next[index] = value
  return Array.from(next, (x) => x ?? fill)
}

// When the server answers a checkbox request it sends back the whole progress document.
// Notes are saved a moment after you type, so that answer can be slightly behind what's on screen:
// keep the local notes (they're the newest) and take everything else from the server.
function keepLocalNotes(updated, local) {
  if (!local) return updated
  const days = { ...updated.days }
  for (const [id, d] of Object.entries(local.days || {})) {
    if (d?.taskBlocks) days[id] = { ...days[id], taskBlocks: d.taskBlocks }
  }
  return { ...updated, days, weekNotes: local.weekNotes ?? updated.weekNotes }
}

export function useTracker(trackerType, { showPushTask, onBadgeUnlocked }) {
  const [days, setDays] = useState([])
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const badgeCheckInFlight = useRef(false)
  // Saving notes must never blank the page, so note-save problems live in their own state
  const [pendingSaves, setPendingSaves] = useState(0)
  const [saveError, setSaveError] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.get(`/tracker/${trackerType}`)
      setDays(data.days)
      setProgress(data.progress)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }, [trackerType])

  useEffect(() => { reload() }, [reload])

  // ---- Badge detection: runs whenever progress changes ----
  useEffect(() => {
    if (!progress || days.length === 0 || badgeCheckInFlight.current) return
    const { current } = computeStreaks(days, progress, showPushTask)
    const earned = newlyEarnedBadges(current, progress.badges || [])
    if (earned.length === 0) return

    badgeCheckInFlight.current = true
    const ids = earned.map((b) => b.id)
    setProgress((p) => ({ ...p, badges: [...(p.badges || []), ...ids] }))
    api.patch(`/tracker/${trackerType}/progress/badges`, { badgeIds: ids })
      .catch(() => {})
      .finally(() => { badgeCheckInFlight.current = false })

    if (onBadgeUnlocked) onBadgeUnlocked(earned[earned.length - 1])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, days, showPushTask])

  async function toggleTask(dayId, taskIndex, checked) {
    setProgress((p) => ({
      ...p,
      days: {
        ...p.days,
        [dayId]: { ...p.days?.[dayId], taskChecks: setArrayIndex(p.days?.[dayId]?.taskChecks, taskIndex, checked, false) },
      },
    }))
    try {
      const updated = await api.patch(`/tracker/${trackerType}/progress/task`, { dayId, taskIndex, checked })
      setProgress((p) => keepLocalNotes(updated, p))
    } catch (err) { setError(err.message) }
  }

  // Run a save request while tracking "Saving..." / error state. Resolves true/false, never throws.
  async function trackSave(request) {
    setPendingSaves((n) => n + 1)
    try {
      await request()
      setSaveError('')
      return true
    } catch (err) {
      setSaveError(err?.message || "Couldn't save your notes.")
      return false
    } finally {
      setPendingSaves((n) => n - 1)
    }
  }

  // Rich notes (text + images + drawings) for one question of one day.
  // Updates the local copy straight away, then saves in the background.
  function commitTaskBlocks(dayId, taskIndex, blocks) {
    setProgress((p) => ({
      ...p,
      days: {
        ...p?.days,
        [dayId]: {
          ...p?.days?.[dayId],
          taskBlocks: { ...p?.days?.[dayId]?.taskBlocks, [taskIndex]: blocks },
        },
      },
    }))
    return trackSave(() => api.patch(`/tracker/${trackerType}/progress/blocks`, { dayId, taskIndex, blocks }))
  }

  // Rich notes for a whole week
  function commitWeekBlocks(month, week, blocks) {
    const key = `${month}:${week}`
    setProgress((p) => ({
      ...p,
      weekNotes: { ...p?.weekNotes, [key]: { ...p?.weekNotes?.[key], blocks } },
    }))
    return trackSave(() => api.patch(`/tracker/${trackerType}/progress/weeknote`, { month, week, blocks }))
  }

  async function togglePush(dayId, checked) {
    setProgress((p) => ({ ...p, days: { ...p.days, [dayId]: { ...p.days?.[dayId], pushChecked: checked } } }))
    try {
      const updated = await api.patch(`/tracker/${trackerType}/progress/push`, { dayId, checked })
      setProgress((p) => keepLocalNotes(updated, p))
    } catch (err) { setError(err.message) }
  }

  async function addDay(payload) {
    await api.post(`/tracker/${trackerType}/days`, payload)
    await reload()
  }
  async function updateDay(dayId, payload) {
    await api.put(`/tracker/${trackerType}/days/${dayId}`, payload)
    await reload()
  }
  async function deleteDay(dayId) {
    await api.del(`/tracker/${trackerType}/days/${dayId}`)
    await reload()
  }

  return {
    days, progress, loading, error, reload,
    toggleTask, togglePush,
    commitTaskBlocks, commitWeekBlocks,
    pendingSaves, saveError, clearSaveError: () => setSaveError(''),
    addDay, updateDay, deleteDay,
  }
}
