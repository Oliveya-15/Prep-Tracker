import { api } from './api.js'

// ---------------------------------------------------------------------------
// Talking to the server: images/drawings live in their own collection and notes
// only keep the id. Fetched pictures are cached in memory so each one downloads once.
// ---------------------------------------------------------------------------
const cache = new Map() // id -> data URL
const inflight = new Map() // id -> Promise<data URL>

export const peekAsset = (id) => cache.get(id) || null

export function fetchAsset(id) {
  if (cache.has(id)) return Promise.resolve(cache.get(id))
  if (inflight.has(id)) return inflight.get(id)
  const p = api
    .get(`/assets/${id}`)
    .then((res) => {
      cache.set(id, res.data)
      return res.data
    })
    .finally(() => inflight.delete(id))
  inflight.set(id, p)
  return p
}

export async function uploadAsset(dataUrl, kind = 'image') {
  const { id } = await api.post('/assets', { data: dataUrl, kind })
  cache.set(id, dataUrl) // we already have the pixels — no need to download them again
  return id
}

export function deleteAsset(id) {
  cache.delete(id)
  return api.del(`/assets/${id}`).catch(() => {}) // best effort; an orphan is harmless
}

// ---------------------------------------------------------------------------
// Picking a file: read it, and shrink big photos / screenshots so uploads stay
// fast and the database stays small.
// ---------------------------------------------------------------------------
const MAX_FILE_BYTES = 25 * 1024 * 1024
const MAX_DIMENSION = 1800
const TARGET_CHARS = 1_300_000 // ≈ 1 MB of image data

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = () => reject(new Error('Could not read that file.'))
    r.readAsDataURL(file)
  })
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("Couldn't open that image (unsupported format?). Try PNG or JPG."))
    img.src = src
  })
}

export async function fileToDataUrl(file) {
  if (!file.type?.startsWith('image/')) throw new Error('That file is not an image.')
  if (file.size > MAX_FILE_BYTES) throw new Error('That image is over 25 MB — please pick a smaller one.')

  const raw = await readAsDataURL(file)
  const isSafeType = /^data:image\/(png|jpeg|webp|gif);/.test(raw)
  if (isSafeType && raw.length <= TARGET_CHARS) return raw // already small — keep it untouched

  // Too big (or an odd format): redraw smaller and re-encode as JPEG.
  const img = await loadImage(raw)
  let scale = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight))
  for (let attempt = 0; attempt < 4; attempt++) {
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff' // JPEG has no transparency
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    for (let q = 0.85; q >= 0.5; q -= 0.1) {
      const out = canvas.toDataURL('image/jpeg', q)
      if (out.length <= TARGET_CHARS) return out
    }
    scale *= 0.75
  }
  throw new Error('Could not shrink that image enough — try a smaller one.')
}
