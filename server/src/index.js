import 'dotenv/config'
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDB } from './config/db.js'
import { requireAuth } from './middleware/auth.js'
import authRoutes from './routes/auth.js'
import trackerRoutes from './routes/tracker.js'
import todoRoutes from './routes/todos.js'
import pageRoutes from './routes/pages.js'

const requiredEnv = ['MONGO_URI', 'JWT_SECRET', 'APP_PASSWORD']
const missing = requiredEnv.filter((k) => !process.env[k])
if (missing.length) {
  console.error(`[startup] Missing required .env values: ${missing.join(', ')}`)
  console.error('[startup] Copy .env.example to .env and fill these in before starting the server.')
  process.exit(1)
}

const app = express()
app.use(cors())
app.use(express.json({ limit: '2mb' })) // higher limit so small week-note image attachments fit

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.use('/api/auth', authRoutes)
app.use('/api/tracker', requireAuth, trackerRoutes)
app.use('/api/todos', requireAuth, todoRoutes)
app.use('/api/pages', requireAuth, pageRoutes)

// Fallback error handler so a thrown/rejected error returns JSON, not an HTML stack trace
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Something went wrong on the server.' })
})

const PORT = process.env.PORT || 5000

connectDB(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`[server] listening on port ${PORT}`))
  })
  .catch((err) => {
    console.error('[startup] Failed to connect to MongoDB:', err.message)
    process.exit(1)
  })
