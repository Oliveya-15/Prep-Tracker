import 'dotenv/config'
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import 'dotenv/config'
import { connectDB } from '../config/db.js'
import TrackerDay from '../models/TrackerDay.js'
import { dsaDays, aptitudeDays } from './monthOneContent.js'
import mongoose from 'mongoose'

function toDocs(trackerType, days) {
  return days.map((d) => ({
    trackerType,
    month: 1,
    week: d.week,
    dayNumber: d.n,
    title: d.title,
    concept: d.concept,
    tasks: d.tasks,
  }))
}

async function run() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not set. Copy .env.example to .env and fill it in first.')
    process.exit(1)
  }

  await connectDB(process.env.MONGO_URI)

  const existing = await TrackerDay.countDocuments({ month: 1 })
  if (existing > 0) {
    console.log(`[seed] Month 1 content already exists (${existing} days found) — skipping.`)
    console.log('[seed] If you want to re-seed from scratch, delete the existing days first (via the app UI, or drop the "trackerdays" collection), then run this again.')
    await mongoose.disconnect()
    return
  }

  const docs = [...toDocs('dsa', dsaDays), ...toDocs('aptitude', aptitudeDays)]
  await TrackerDay.insertMany(docs)
  console.log(`[seed] Inserted ${docs.length} days (${dsaDays.length} DSA + ${aptitudeDays.length} Aptitude) for Month 1.`)

  await mongoose.disconnect()
}

run().catch((err) => {
  console.error('[seed] Failed:', err)
  process.exit(1)
})
