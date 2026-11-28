// Shared by every route that stores rich notes (tracker days / weeks, custom page entries).
//
// A note is an ordered list of blocks:
//   { id, type: 'text', text }
//   { id, type: 'image' | 'drawing', assetId, width }     (the picture itself lives in the `assets` collection)

export const ID_RE = /^[a-f0-9]{24}$/i
const MAX_BLOCKS = 300
const MAX_TEXT = 50000

// Validate + clean the blocks sent by the client.
// Returns null when the payload is malformed, so nothing odd ever reaches MongoDB.
export function cleanBlocks(input) {
  if (!Array.isArray(input) || input.length > MAX_BLOCKS) return null
  const out = []
  for (const b of input) {
    if (!b || typeof b !== 'object') return null
    const id = typeof b.id === 'string' ? b.id.slice(0, 40) : ''
    if (b.type === 'text') {
      if (typeof b.text !== 'string' || b.text.length > MAX_TEXT) return null
      out.push({ id, type: 'text', text: b.text })
    } else if (b.type === 'image' || b.type === 'drawing') {
      if (typeof b.assetId !== 'string' || !ID_RE.test(b.assetId)) return null
      const width = Math.min(100, Math.max(10, Math.round(Number(b.width)) || 60))
      out.push({ id, type: b.type, assetId: b.assetId, width })
    } else {
      return null
    }
  }
  return out
}

// All picture ids used by one or more block lists (used to clean up when something is deleted).
export function collectAssetIds(...blockLists) {
  const ids = new Set()
  for (const list of blockLists) {
    if (!Array.isArray(list)) continue
    for (const b of list) {
      if (b && typeof b.assetId === 'string' && ID_RE.test(b.assetId)) ids.add(b.assetId)
    }
  }
  return [...ids]
}
