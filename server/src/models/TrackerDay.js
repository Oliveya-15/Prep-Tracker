import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['link', 'custom'], default: 'custom' },
    text: { type: String, required: true },
    url: { type: String, default: '' },
    tag: { type: String, default: '' }, // e.g. "Easy", "Medium", "Topic"
  },
  { _id: false }
)

const trackerDaySchema = new mongoose.Schema(
  {
    trackerType: { type: String, enum: ['dsa', 'aptitude'], required: true },
    month: { type: Number, required: true, default: 1 },
    week: { type: Number, required: true },
    dayNumber: { type: Number, required: true }, // sequential within (trackerType, month)
    title: { type: String, required: true },
    concept: { type: [String], default: [] },
    tasks: { type: [taskSchema], default: [] },
  },
  { timestamps: true }
)

trackerDaySchema.index({ trackerType: 1, month: 1, dayNumber: 1 }, { unique: true })

export default mongoose.model('TrackerDay', trackerDaySchema)
