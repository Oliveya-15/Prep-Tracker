import mongoose from 'mongoose'

// One document per uploaded picture / drawing.
// Notes only store this document's _id, so big base64 data never bloats the
// tracker progress document (MongoDB documents are capped at 16 MB).
const assetSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ['image', 'drawing'], default: 'image' },
    mime: { type: String, required: true },
    data: { type: String, required: true }, // full data URL: "data:image/png;base64,...."
    bytes: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default mongoose.model('Asset', assetSchema)
