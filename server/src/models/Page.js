import mongoose from 'mongoose'

const entrySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    link: { type: String, default: '' },
    notes: { type: String, default: '' }, // old plain-text notes (still read as a fallback)
    // rich notes: [{ id, type: 'text', text } | { id, type: 'image' | 'drawing', assetId, width }]
    // default undefined = "never edited with the new editor" -> the client falls back to `notes`
    blocks: { type: [mongoose.Schema.Types.Mixed], default: undefined },
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
