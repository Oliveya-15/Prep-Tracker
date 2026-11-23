import { Router } from 'express'
import Asset from '../models/Asset.js'

const router = Router()

const ID_RE = /^[a-f0-9]{24}$/i
const PREFIX_RE = /^data:(image\/(?:png|jpeg|webp|gif));base64,/
const BASE64_RE = /^[A-Za-z0-9+/]+={0,2}$/
const MAX_CHARS = 3_500_000 // ~2.6 MB of binary — the client compresses well below this

// POST /api/assets  { data: "data:image/...;base64,...", kind: "image" | "drawing" } -> { id }
router.post('/', async (req, res) => {
  const { data, kind } = req.body || {}
  if (typeof data !== 'string' || data.length > MAX_CHARS) {
    return res.status(400).json({ error: 'Image is missing or too large.' })
  }
  const match = PREFIX_RE.exec(data)
  if (!match) {
    return res.status(400).json({ error: 'Only PNG, JPEG, WebP or GIF images are allowed.' })
  }
  const body = data.slice(match[0].length)
  if (!BASE64_RE.test(body)) {
    return res.status(400).json({ error: 'Image data is not valid.' })
  }

  const asset = await Asset.create({
    kind: kind === 'drawing' ? 'drawing' : 'image',
    mime: match[1],
    data,
    bytes: Math.floor((body.length * 3) / 4),
  })
  res.status(201).json({ id: String(asset._id) })
})

// GET /api/assets/:id -> { id, kind, data }
// (JSON instead of raw bytes because <img> tags can't send the Authorization header.)
router.get('/:id', async (req, res) => {
  if (!ID_RE.test(req.params.id)) return res.status(404).json({ error: 'Not found' })
  const asset = await Asset.findById(req.params.id).select('kind data').lean()
  if (!asset) return res.status(404).json({ error: 'Not found' })
  // An asset never changes (editing a drawing creates a new one), so it can be cached hard.
  res.set('Cache-Control', 'private, max-age=31536000, immutable')
  res.json({ id: String(asset._id), kind: asset.kind, data: asset.data })
})

// DELETE /api/assets/:id
router.delete('/:id', async (req, res) => {
  if (!ID_RE.test(req.params.id)) return res.status(404).json({ error: 'Not found' })
  await Asset.deleteOne({ _id: req.params.id })
  res.json({ ok: true })
})

export default router
