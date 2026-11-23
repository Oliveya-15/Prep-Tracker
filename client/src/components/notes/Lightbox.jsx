import { useEffect, useState } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Loader2 } from 'lucide-react'
import { useAssetSrc } from '../../hooks/useAssetSrc.js'

function Slide({ item, position, total, onClose }) {
  const { src, loading, error } = useAssetSrc(item.assetId, item.src)
  const [zoom, setZoom] = useState(false)
  const ext = src?.match(/^data:image\/(\w+)/)?.[1]?.replace('jpeg', 'jpg') || 'png'

  return (
    <>
      <div className="flex items-center justify-between gap-2 px-4 py-2 text-white/90">
        <span className="font-mono text-xs">
          {item.type === 'drawing' ? 'Drawing' : 'Image'} {position} / {total}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setZoom((z) => !z)}
            className="p-2 rounded-lg hover:bg-white/15"
            title={zoom ? 'Fit to screen' : 'Actual size'}
            aria-label={zoom ? 'Fit to screen' : 'Actual size'}
          >
            {zoom ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
          </button>
          {src && (
            <a
              href={src}
              download={`note-${item.type}-${position}.${ext}`}
              className="p-2 rounded-lg hover:bg-white/15"
              title="Download"
              aria-label="Download"
            >
              <Download size={18} />
            </a>
          )}
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/15" title="Close (Esc)" aria-label="Close">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* m-auto on the child (instead of centering the parent) keeps big zoomed images scrollable from the top-left */}
      <div
        className="flex-1 min-h-0 overflow-auto flex p-3"
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        {src ? (
          <img
            src={src}
            alt=""
            onClick={() => setZoom((z) => !z)}
            className={`m-auto bg-white rounded-md shadow-2xl select-none ${
              zoom ? 'max-w-none cursor-zoom-out' : 'max-w-full max-h-full object-contain cursor-zoom-in'
            }`}
            style={zoom ? undefined : { maxHeight: 'calc(100dvh - 90px)' }}
            draggable={false}
          />
        ) : (
          <div className="m-auto text-white/80 text-sm flex items-center gap-2">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {error ? "Couldn't load this image." : 'Loading...'}
          </div>
        )}
      </div>
    </>
  )
}

// items: [{ key, type, assetId, src }]   index: which one is showing
export default function Lightbox({ items, index, onClose, onIndex }) {
  const count = items.length
  const item = items[index]

  const go = (delta) => onIndex((index + delta + count) % count)

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight' && count > 1) onIndex((index + 1) % count)
      else if (e.key === 'ArrowLeft' && count > 1) onIndex((index - 1 + count) % count)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [index, count, onClose, onIndex])

  if (!item) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 flex flex-col" role="dialog" aria-modal="true" aria-label="Image viewer">
      <Slide key={item.key} item={item} position={index + 1} total={count} onClose={onClose} />
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 text-white hover:bg-black/75"
            aria-label="Previous image"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 text-white hover:bg-black/75"
            aria-label="Next image"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}
    </div>
  )
}
