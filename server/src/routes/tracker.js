import { Router } from 'express'
import TrackerDay from '../models/TrackerDay.js'
import TrackerProgress from '../models/TrackerProgress.js'

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
  const progress = await TrackerProgress.findOneAndUpdate(
    { trackerType: req.params.type },
    { $set: { [`days.${dayId}.taskChecks.${taskIndex}`]: !!checked } },
    { new: true, upsert: true }
  )
  res.json(progress)
})

// PATCH /api/tracker/:type/progress/note -> save a per-question note
router.patch('/:type/progress/note', validType, async (req, res) => {
  const { dayId, taskIndex, note } = req.body || {}
  const progress = await TrackerProgress.findOneAndUpdate(
    { trackerType: req.params.type },
    { $set: { [`days.${dayId}.taskNotes.${taskIndex}`]: note } },
    { new: true, upsert: true }
  )
  res.json(progress)
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

// PATCH /api/tracker/:type/progress/weeknote -> save week-level notes + optional image
router.patch('/:type/progress/weeknote', validType, async (req, res) => {
  const { month = 1, week, text, image } = req.body || {}
  const key = `${month}:${week}`
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
