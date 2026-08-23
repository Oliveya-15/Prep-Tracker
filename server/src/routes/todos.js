import { Router } from 'express'
import Todo from '../models/Todo.js'

const router = Router()

router.get('/', async (req, res) => {
  const todos = await Todo.find().sort({ createdAt: -1 })
  res.json(todos)
})

router.post('/', async (req, res) => {
  const { text } = req.body || {}
  if (!text || !text.trim()) return res.status(400).json({ error: 'text is required' })
  const todo = await Todo.create({ text: text.trim() })
  res.status(201).json(todo)
})

// Used for both toggling done and editing the text
router.patch('/:id', async (req, res) => {
  const { text, done } = req.body || {}
  const update = {}
  if (text !== undefined) update.text = text
  if (done !== undefined) update.done = done
  const todo = await Todo.findByIdAndUpdate(req.params.id, update, { new: true })
  if (!todo) return res.status(404).json({ error: 'Todo not found' })
  res.json(todo)
})

router.delete('/:id', async (req, res) => {
  const todo = await Todo.findByIdAndDelete(req.params.id)
  if (!todo) return res.status(404).json({ error: 'Todo not found' })
  res.json({ ok: true })
})

export default router
