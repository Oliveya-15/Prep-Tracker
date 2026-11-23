import mongoose from 'mongoose'

// One document per trackerType ('dsa' | 'aptitude'). Since this is a
// single-user app, we don't need a userId — trackerType alone is the key.
const trackerProgressSchema = new mongoose.Schema(
  {
    trackerType: { type: String, enum: ['dsa', 'aptitude'], required: true, unique: true },
    // days: { [dayId]: { taskChecks: [Bool], taskNotes: [String] (old plain-text notes),
    //                    taskBlocks: { [taskIndex]: [block] }, pushChecked: Bool } }
    // block = { id, type: 'text', text } | { id, type: 'image' | 'drawing', assetId, width }  (pictures live in the `assets` collection)
    days: { type: mongoose.Schema.Types.Mixed, default: {} },
    // weekNotes: { "month:week": { blocks: [block] } }   (older entries may still hold { text, image } — read as a fallback)
    weekNotes: { type: mongoose.Schema.Types.Mixed, default: {} },
    badges: { type: [String], default: [] },
  },
  { timestamps: true }
)

export default mongoose.model('TrackerProgress', trackerProgressSchema)
