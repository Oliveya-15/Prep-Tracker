import { asArray } from './trackerUtils.js'

// A note is an ordered list of blocks:
//   { id, type: 'text',    text }
//   { id, type: 'image',   assetId, width }   width = % of the note's width (12–100)
//   { id, type: 'drawing', assetId, width }
// While a picture is still uploading it carries a temporary `src` (data URL) + `uploading: true`.

export const newId = () => 'b' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4)

export const textBlock = (text = '') => ({ id: newId(), type: 'text', text })

export const DEFAULT_WIDTH = { image: 60, drawing: 75 }

export const isMedia = (b) => b.type === 'image' || b.type === 'drawing'

// ---- reading old data --------------------------------------------------------
// Old plain-text task note  ->  one text block
function legacyTaskBlocks(text) {
  return typeof text === 'string' && text.trim() ? [textBlock(text)] : []
}

// Old week note { text, image: dataURL }  ->  text block + image block (uploaded on first open)
function legacyWeekBlocks(entry) {
  const out = []
  if (entry?.text && entry.text.trim()) out.push(textBlock(entry.text))
  if (entry?.image) out.push({ id: newId(), type: 'image', width: DEFAULT_WIDTH.image, src: entry.image, legacy: true })
  return out
}

export function getTaskBlocks(progress, dayId, taskIndex) {
  const day = progress?.days?.[dayId]
  const saved = day?.taskBlocks?.[taskIndex]
  if (Array.isArray(saved)) return saved
  return legacyTaskBlocks(asArray(day?.taskNotes)[taskIndex])
}

export function getWeekBlocks(progress, month, week) {
  const entry = progress?.weekNotes?.[`${month}:${week}`]
  if (Array.isArray(entry?.blocks)) return entry.blocks
  return legacyWeekBlocks(entry)
}

// ---- preparing for the editor / for saving ------------------------------------
// The editor always shows at least one block so there's somewhere to type.
export function initBlocks(blocks) {
  const list = (blocks || []).map((b) => ({ ...b }))
  return list.length ? list : [textBlock()]
}

// Only finished blocks are sent to the server: no half-uploaded pictures, no empty text boxes.
export function savableBlocks(blocks) {
  const out = []
  for (const b of blocks) {
    if (b.type === 'text') {
      if (b.text && b.text.trim()) out.push({ id: b.id, type: 'text', text: b.text })
    } else if (isMedia(b) && b.assetId) {
      out.push({ id: b.id, type: b.type, assetId: b.assetId, width: b.width || DEFAULT_WIDTH[b.type] })
    }
  }
  return out
}
