import { Router } from 'express'
import TrackerDay from '../models/TrackerDay.js'
import TrackerProgress from '../models/TrackerProgress.js'
import { ID_RE, cleanBlocks } from '../utils/blocks.js'

const router = Router()

function validType(req, res, next) {
  if (!['dsa', 'aptitude'].includes(req.params.type)) {
    return res.status(400).json({ error: 'Unknown tracker type' })
  }
  next()
}

async function getOrCreateProgress(trackerType) {
  let progress = await TrackerProgress.findOne({ trackerType })
  if (!progress) {
    progress = await TrackerProgress.create({ trackerType, days: {}, weekNotes: {}, badges: [] })
  }
  return progress
}

// ---------- helpers ----------

// Build a real array (never an object) and fill any gaps.
// (MongoDB turns "days.X.taskNotes.0" into an OBJECT when the parent doesn't exist yet,
//  which is what crashed the client before — these routes read, fix and write whole arrays.)
function setAt(value, index, newValue, fill) {
  let arr = []
  if (Array.isArray(value)) arr = [...value]
  else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([k, v]) => { arr[Number(k)] = v })
  }
  arr[Number(index)] = newValue
  return Array.from(arr, (x) => x ?? fill)
}


// GET /api/tracker/:type -> { days: [...], progress: {...} }
router.get('/:type', validType, async (req, res) => {
  const days = await TrackerDay.find({ trackerType: req.params.type }).sort({ month: 1, dayNumber: 1 })
  const progress = await getOrCreateProgress(req.params.type)
  res.json({ days, progress })
})

// POST /api/tracker/:type/days -> create a new day (auto-numbered within its month)
router.post('/:type/days', validType, async (req, res) => {
  const { month = 1, week, title, concept = [], tasks = [] } = req.body || {}
  if (!week || !title) {
    return res.status(400).json({ error: 'week and title are required' })
  }

  const last = await TrackerDay.findOne({ trackerType: req.params.type, month })
    .sort({ dayNumber: -1 })
    .select('dayNumber')
  const dayNumber = last ? last.dayNumber + 1 : 1

  const day = await TrackerDay.create({
    trackerType: req.params.type,
    month,
    week,
    dayNumber,
    title,
    concept,
    tasks,
  })
  res.status(201).json(day)
})

// PUT /api/tracker/:type/days/:dayId -> edit a day's content
router.put('/:type/days/:dayId', validType, async (req, res) => {
  const { week, title, concept, tasks } = req.body || {}
  const day = await TrackerDay.findOneAndUpdate(
    { _id: req.params.dayId, trackerType: req.params.type },
    { $set: { ...(week !== undefined && { week }), ...(title !== undefined && { title }), ...(concept !== undefined && { concept }), ...(tasks !== undefined && { tasks }) } },
    { new: true }
  )
  if (!day) return res.status(404).json({ error: 'Day not found' })
  res.json(day)
})

// DELETE /api/tracker/:type/days/:dayId
router.delete('/:type/days/:dayId', validType, async (req, res) => {
  const day = await TrackerDay.findOneAndDelete({ _id: req.params.dayId, trackerType: req.params.type })
  if (!day) return res.status(404).json({ error: 'Day not found' })
  // also drop any progress recorded against this day to avoid orphaned data
  await TrackerProgress.updateOne(
    { trackerType: req.params.type },
    { $unset: { [`days.${req.params.dayId}`]: '' } }
  )
  res.json({ ok: true })
})

// PATCH /api/tracker/:type/progress/task -> toggle a task checkbox
router.patch('/:type/progress/task', validType, async (req, res) => {
  const { dayId, taskIndex, checked } = req.body || {}
  const current = await getOrCreateProgress(req.params.type)
  const checks = setAt(current.days?.[dayId]?.taskChecks, taskIndex, !!checked, false)
  const progress = await TrackerProgress.findOneAndUpdate(
    { trackerType: req.params.type },
    { $set: { [`days.${dayId}.taskChecks`]: checks } },
    { new: true }
  )
  res.json(progress)
})

// PATCH /api/tracker/:type/progress/note -> (legacy) save a plain-text per-question note
router.patch('/:type/progress/note', validType, async (req, res) => {
  const { dayId, taskIndex, note } = req.body || {}
  const current = await getOrCreateProgress(req.params.type)
  const notes = setAt(current.days?.[dayId]?.taskNotes, taskIndex, note, '')
  const progress = await TrackerProgress.findOneAndUpdate(
    { trackerType: req.params.type },
    { $set: { [`days.${dayId}.taskNotes`]: notes } },
    { new: true }
  )
  res.json(progress)
})

// PATCH /api/tracker/:type/progress/blocks -> save a question's rich note (text + images + drawings)
// Stored as an object keyed by task index on purpose: days.<dayId>.taskBlocks = { "0": [...blocks], "2": [...] }
// so each task is one atomic $set and two notes can never overwrite each other.
router.patch('/:type/progress/blocks', validType, async (req, res) => {
  const { dayId, taskIndex, blocks } = req.body || {}
  const idx = Number(taskIndex)
  if (typeof dayId !== 'string' || !ID_RE.test(dayId) || !Number.isInteger(idx) || idx < 0 || idx > 500) {
    return res.status(400).json({ error: 'Invalid day or task' })
  }
  const clean = cleanBlocks(blocks)
  if (!clean) return res.status(400).json({ error: 'Invalid note content' })

  await getOrCreateProgress(req.params.type)
  await TrackerProgress.updateOne(
    { trackerType: req.params.type },
    { $set: { [`days.${dayId}.taskBlocks.${idx}`]: clean } }
  )
  res.json({ ok: true })
})

// PATCH /api/tracker/:type/progress/push -> toggle the "pushed to GitHub" checkbox (DSA only, harmless elsewhere)
router.patch('/:type/progress/push', validType, async (req, res) => {
  const { dayId, checked } = req.body || {}
  const progress = await TrackerProgress.findOneAndUpdate(
    { trackerType: req.params.type },
    { $set: { [`days.${dayId}.pushChecked`]: !!checked } },
    { new: true, upsert: true }
  )
  res.json(progress)
})

// PATCH /api/tracker/:type/progress/weeknote -> save week-level notes
//   new format: { month, week, blocks: [...] }   (text + images + drawings, any order)
//   legacy format: { month, week, text, image }  (kept so old clients don't break)
router.patch('/:type/progress/weeknote', validType, async (req, res) => {
  const { month = 1, week, text, image, blocks } = req.body || {}
  const m = Number(month)
  const w = Number(week)
  if (!Number.isInteger(m) || !Number.isInteger(w) || m < 1 || m > 99 || w < 1 || w > 99) {
    return res.status(400).json({ error: 'Invalid month or week' })
  }
  const key = `${m}:${w}`

  if (Array.isArray(blocks)) {
    const clean = cleanBlocks(blocks)
    if (!clean) return res.status(400).json({ error: 'Invalid note content' })
    await getOrCreateProgress(req.params.type)
    // Only touch ".blocks" so an old inline image / text is never destroyed by a failed migration.
    await TrackerProgress.updateOne(
      { trackerType: req.params.type },
      { $set: { [`weekNotes.${key}.blocks`]: clean } }
    )
    return res.json({ ok: true })
  }

  const progress = await TrackerProgress.findOneAndUpdate(
    { trackerType: req.params.type },
    { $set: { [`weekNotes.${key}`]: { text, image: image ?? null } } },
    { new: true, upsert: true }
  )
  res.json(progress)
})

// PATCH /api/tracker/:type/progress/badges -> append newly unlocked badges
router.patch('/:type/progress/badges', validType, async (req, res) => {
  const { badgeIds = [] } = req.body || {}
  const progress = await TrackerProgress.findOneAndUpdate(
    { trackerType: req.params.type },
    { $addToSet: { badges: { $each: badgeIds } } },
    { new: true, upsert: true }
  )
  res.json(progress)
})

export default router
