import { Router } from 'express'
import Page from '../models/Page.js'

const router = Router()

router.get('/', async (req, res) => {
  const pages = await Page.find().sort({ createdAt: 1 })
  res.json(pages)
})

router.post('/', async (req, res) => {
  const { title, icon } = req.body || {}
  if (!title || !title.trim()) return res.status(400).json({ error: 'title is required' })
  const page = await Page.create({ title: title.trim(), icon: icon || '📄', entries: [] })
  res.status(201).json(page)
})

router.patch('/:id', async (req, res) => {
  const { title, icon } = req.body || {}
  const update = {}
  if (title !== undefined) update.title = title
  if (icon !== undefined) update.icon = icon
  const page = await Page.findByIdAndUpdate(req.params.id, update, { new: true })
  if (!page) return res.status(404).json({ error: 'Page not found' })
  res.json(page)
})

router.delete('/:id', async (req, res) => {
  const page = await Page.findByIdAndDelete(req.params.id)
  if (!page) return res.status(404).json({ error: 'Page not found' })
  res.json({ ok: true })
})

// ---- Entries (the "canvas" content within a page) ----

router.post('/:id/entries', async (req, res) => {
  const { title, link, notes } = req.body || {}
  if (!title || !title.trim()) return res.status(400).json({ error: 'title is required' })
  const page = await Page.findByIdAndUpdate(
    req.params.id,
    { $push: { entries: { title: title.trim(), link: link || '', notes: notes || '', done: false } } },
    { new: true }
  )
  if (!page) return res.status(404).json({ error: 'Page not found' })
  res.status(201).json(page)
})

router.patch('/:id/entries/:entryId', async (req, res) => {
  const { title, link, notes, done } = req.body || {}
  const setFields = {}
  if (title !== undefined) setFields['entries.$.title'] = title
  if (link !== undefined) setFields['entries.$.link'] = link
  if (notes !== undefined) setFields['entries.$.notes'] = notes
  if (done !== undefined) setFields['entries.$.done'] = done

  const page = await Page.findOneAndUpdate(
    { _id: req.params.id, 'entries._id': req.params.entryId },
    { $set: setFields },
    { new: true }
  )
  if (!page) return res.status(404).json({ error: 'Page or entry not found' })
  res.json(page)
})

router.delete('/:id/entries/:entryId', async (req, res) => {
  const page = await Page.findByIdAndUpdate(
    req.params.id,
    { $pull: { entries: { _id: req.params.entryId } } },
    { new: true }
  )
  if (!page) return res.status(404).json({ error: 'Page not found' })
  res.json(page)
})

export default router
