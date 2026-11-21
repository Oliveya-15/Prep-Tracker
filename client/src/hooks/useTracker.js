import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../utils/api.js'
import { computeStreaks } from '../utils/trackerUtils.js'
import { newlyEarnedBadges } from '../data/badges.js'

function setArrayIndex(arr, index, value, fill = '') {
  const next = Array.isArray(arr) ? [...arr] : Object.assign([], arr || {})
  next[index] = value
  return Array.from(next, (x) => x ?? fill)
}

export function useTracker(trackerType, { showPushTask, onBadgeUnlocked }) {
  const [days, setDays] = useState([])
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const badgeCheckInFlight = useRef(false)

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
      setProgress(updated)
    } catch (err) { setError(err.message) }
  }

  function setNoteLocal(dayId, taskIndex, note) {
    setProgress((p) => ({
      ...p,
      days: {
        ...p.days,
        [dayId]: { ...p.days?.[dayId], taskNotes: setArrayIndex(p.days?.[dayId]?.taskNotes, taskIndex, note) },
      },
    }))
  }

  async function commitNote(dayId, taskIndex, note) {
    try {
      const updated = await api.patch(`/tracker/${trackerType}/progress/note`, { dayId, taskIndex, note })
      setProgress(updated)
    } catch (err) { setError(err.message) }
  }

  async function togglePush(dayId, checked) {
    setProgress((p) => ({ ...p, days: { ...p.days, [dayId]: { ...p.days?.[dayId], pushChecked: checked } } }))
    try {
      const updated = await api.patch(`/tracker/${trackerType}/progress/push`, { dayId, checked })
      setProgress(updated)
    } catch (err) { setError(err.message) }
  }

  function setWeekNoteLocal(month, week, val) {
    const key = `${month}:${week}`
    setProgress((p) => ({ ...p, weekNotes: { ...p.weekNotes, [key]: val } }))
  }

  async function commitWeekNote(month, week, val) {
    try {
      const updated = await api.patch(`/tracker/${trackerType}/progress/weeknote`, { month, week, ...val })
      setProgress(updated)
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
    toggleTask, setNoteLocal, commitNote, togglePush,
    setWeekNoteLocal, commitWeekNote,
    addDay, updateDay, deleteDay,
  }
}
