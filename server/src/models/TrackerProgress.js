import mongoose from 'mongoose'

// One document per trackerType ('dsa' | 'aptitude'). Since this is a
// single-user app, we don't need a userId — trackerType alone is the key.
const trackerProgressSchema = new mongoose.Schema(
  {
    trackerType: { type: String, enum: ['dsa', 'aptitude'], required: true, unique: true },
    // days: { [dayId]: { taskChecks: [Bool], taskNotes: [String], pushChecked: Bool } }
    days: { type: mongoose.Schema.Types.Mixed, default: {} },
    // weekNotes: { "month:week": { text: String, image: String|null } }
    weekNotes: { type: mongoose.Schema.Types.Mixed, default: {} },
    badges: { type: [String], default: [] },
  },
  { timestamps: true }
)

export default mongoose.model('TrackerProgress', trackerProgressSchema)
