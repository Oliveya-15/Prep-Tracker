import { useEffect, useState } from 'react'
import { fetchAsset, peekAsset } from '../utils/assets.js'

// Returns the picture for an asset id (downloading it once, then serving it from cache).
// While a picture is still uploading (or is an old inline image) it falls back to `inlineSrc`.
export function useAssetSrc(assetId, inlineSrc) {
  const [loaded, setLoaded] = useState({ id: null, src: null, error: false })

  useEffect(() => {
    if (!assetId || peekAsset(assetId)) return undefined
    let cancelled = false
    fetchAsset(assetId)
      .then((src) => { if (!cancelled) setLoaded({ id: assetId, src, error: false }) })
      .catch(() => { if (!cancelled) setLoaded({ id: assetId, src: null, error: true }) })
    return () => { cancelled = true }
  }, [assetId])

  if (!assetId) return { src: inlineSrc || null, loading: false, error: false }
  const cached = peekAsset(assetId)
  if (cached) return { src: cached, loading: false, error: false }
  if (loaded.id === assetId) return { src: loaded.src, loading: !loaded.src && !loaded.error, error: loaded.error }
  return { src: null, loading: true, error: false }
}
