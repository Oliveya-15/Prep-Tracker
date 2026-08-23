import mongoose from 'mongoose'

const entrySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    link: { type: String, default: '' },
    notes: { type: String, default: '' },
    done: { type: Boolean, default: false },
  },
  { timestamps: true }
)

const pageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    icon: { type: String, default: '📄' },
    entries: { type: [entrySchema], default: [] },
  },
  { timestamps: true }
)

export default mongoose.model('Page', pageSchema)
