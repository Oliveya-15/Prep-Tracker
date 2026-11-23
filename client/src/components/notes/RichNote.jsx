import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Type, ImagePlus, PenTool, MoreHorizontal, Maximize2, Pencil, Trash2,
  ChevronUp, ChevronDown, Loader2, AlertTriangle, RefreshCw, GripVertical,
} from 'lucide-react'
import Lightbox from './Lightbox.jsx'
import DrawingModal from './DrawingModal.jsx'
import { useAssetSrc } from '../../hooks/useAssetSrc.js'
import { fetchAsset, uploadAsset, deleteAsset, fileToDataUrl } from '../../utils/assets.js'
import { DEFAULT_WIDTH, initBlocks, isMedia, newId, savableBlocks, textBlock } from '../../utils/blocks.js'

const MIN_WIDTH = 25
const SIZE_PRESETS = [
  { label: 'S', value: 30 },
  { label: 'M', value: 50 },
  { label: 'L', value: 75 },
  { label: 'Full', value: 100 },
]

// ---------------------------------------------------------------------------
// Small pieces
// ---------------------------------------------------------------------------
function AutoTextarea({ value, onChange, onPaste, placeholder, autoFocus, padRight }) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight + 2}px`
  }, [value])

  useEffect(() => {
    if (autoFocus && ref.current) ref.current.focus()
  }, [autoFocus])

  return (
    <textarea
      ref={ref}
      rows={1}
      className={`textarea-note block resize-none overflow-hidden ${padRight ? 'pr-8' : ''}`}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onPaste={onPaste}
    />
  )
}

// The "..." menu on every block: add something below, move, delete.
function BlockMenu({ canUp, canDown, onAdd, onUp, onDown, onDelete, className = '' }) {
  const [pos, setPos] = useState(null) // null = closed
  const btnRef = useRef(null)

  function toggle() {
    if (pos) return setPos(null)
    const r = btnRef.current.getBoundingClientRect()
    const menuH = 250
    const openUp = window.innerHeight - r.bottom < menuH && r.top > menuH
    setPos({ right: Math.max(8, window.innerWidth - r.right), top: openUp ? undefined : r.bottom + 4, bottom: openUp ? window.innerHeight - r.top + 4 : undefined })
  }

  useEffect(() => {
    if (!pos) return undefined
    const close = () => setPos(null)
    const onDown = (e) => { if (!e.target.closest?.('[data-block-menu]')) close() }
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [pos])

  const item = 'w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-surface-alt disabled:opacity-35 disabled:hover:bg-transparent'
  const run = (fn) => () => { setPos(null); fn() }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        data-block-menu
        onClick={toggle}
        className={`p-1 rounded-md text-muted hover:text-ink hover:bg-surface-alt ${className}`}
        aria-label="Block options"
        title="Add below / move / delete"
      >
        <MoreHorizontal size={15} />
      </button>
      {pos && createPortal(
        <div
          data-block-menu
          className="fixed z-[90] w-48 bg-surface border border-line rounded-lg shadow-xl py-1"
          style={{ right: pos.right, top: pos.top, bottom: pos.bottom }}
        >
          <div className="px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-muted">Add below</div>
          <button type="button" className={item} onClick={run(() => onAdd('text'))}><Type size={13} /> Text</button>
          <button type="button" className={item} onClick={run(() => onAdd('image'))}><ImagePlus size={13} /> Image</button>
          <button type="button" className={item} onClick={run(() => onAdd('drawing'))}><PenTool size={13} /> Drawing</button>
          <div className="my-1 border-t border-line" />
          <button type="button" className={item} disabled={!canUp} onClick={run(onUp)}><ChevronUp size={13} /> Move up</button>
          <button type="button" className={item} disabled={!canDown} onClick={run(onDown)}><ChevronDown size={13} /> Move down</button>
          <div className="my-1 border-t border-line" />
          <button type="button" className={`${item} text-danger`} onClick={run(onDelete)}><Trash2 size={13} /> Delete</button>
        </div>,
        document.body
      )}
    </>
  )
}

// An image or a drawing: click to open big, drag the corner (or use S/M/L/Full) to resize.
function MediaBlock({ block, canUp, canDown, onResize, onView, onEdit, onAdd, onUp, onDown, onDelete, onRetry }) {
  const { src, error } = useAssetSrc(block.assetId, block.src)
  const wrapRef = useRef(null)
  const width = block.width || DEFAULT_WIDTH[block.type]

  function startResize(e) {
    e.preventDefault()
    e.stopPropagation()
    const row = wrapRef.current?.parentElement
    if (!row) return
    const rowWidth = row.clientWidth || 1
    const startX = e.clientX
    const startWidth = width
    const handle = e.currentTarget
    handle.setPointerCapture(e.pointerId)

    const move = (ev) => {
      const next = startWidth + ((ev.clientX - startX) / rowWidth) * 100
      onResize(Math.round(Math.min(100, Math.max(MIN_WIDTH, next))))
    }
    const up = () => {
      handle.removeEventListener('pointermove', move)
      handle.removeEventListener('pointerup', up)
      handle.removeEventListener('pointercancel', up)
    }
    handle.addEventListener('pointermove', move)
    handle.addEventListener('pointerup', up)
    handle.addEventListener('pointercancel', up)
  }

  const failed = !!block.uploadError

  return (
    <div ref={wrapRef} className="p-1 box-border" style={{ width: `${width}%` }}>
      <div className="relative rounded-lg border border-line bg-white overflow-hidden">
        {src ? (
          <img
            src={src}
            alt={block.type === 'drawing' ? 'Drawing' : 'Note image'}
            draggable={false}
            onClick={onView}
            className="block w-full h-auto cursor-zoom-in select-none"
          />
        ) : (
          <div className="aspect-video grid place-items-center text-muted text-xs bg-surface-alt">
            {error ? 'Could not load this picture' : <Loader2 size={16} className="animate-spin" />}
          </div>
        )}

        {block.uploading && (
          <div className="absolute inset-0 bg-white/60 grid place-items-center pointer-events-none">
            <span className="flex items-center gap-1.5 text-xs font-mono text-muted bg-surface border border-line rounded-md px-2 py-1">
              <Loader2 size={12} className="animate-spin" /> Uploading...
            </span>
          </div>
        )}
        {failed && (
          <div className="absolute inset-0 bg-white/85 grid place-items-center p-2 text-center">
            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-1.5 text-xs text-danger"><AlertTriangle size={13} /> {block.uploadError}</div>
              <button type="button" className="btn-ghost" onClick={onRetry}><RefreshCw size={12} /> Retry</button>
            </div>
          </div>
        )}

        {/* drag this corner to resize */}
        <span
          onPointerDown={startResize}
          className="absolute bottom-1 right-1 w-5 h-5 rounded bg-ink/70 text-white grid place-items-center cursor-nwse-resize shadow"
          style={{ touchAction: 'none' }}
          title="Drag to resize"
          aria-label="Drag to resize"
        >
          <GripVertical size={11} className="rotate-45" />
        </span>
      </div>

      <div className="flex items-center gap-1 mt-1 flex-wrap">
        {SIZE_PRESETS.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => onResize(s.value)}
            className={`font-mono text-[10.5px] px-1.5 py-0.5 rounded border transition ${
              Math.abs(width - s.value) < 4 ? 'bg-accent-soft text-accent border-accent' : 'border-line text-muted hover:border-accent hover:text-accent'
            }`}
            title={`${s.value}% width`}
          >
            {s.label}
          </button>
        ))}
        <button type="button" onClick={onView} className="p-1 rounded-md text-muted hover:text-accent hover:bg-surface-alt" title="View large" aria-label="View large">
          <Maximize2 size={14} />
        </button>
        {block.type === 'drawing' && (
          <button type="button" onClick={onEdit} disabled={!block.assetId} className="p-1 rounded-md text-muted hover:text-accent hover:bg-surface-alt disabled:opacity-35" title="Edit drawing" aria-label="Edit drawing">
            <Pencil size={14} />
          </button>
        )}
        <BlockMenu className="ml-auto" canUp={canUp} canDown={canDown} onAdd={onAdd} onUp={onUp} onDown={onDown} onDelete={onDelete} />
      </div>
    </div>
  )
}

// Consecutive pictures are laid out side by side (as far as their widths allow); text breaks the row.
function buildSegments(blocks) {
  const segs = []
  for (const b of blocks) {
    if (b.type === 'text') {
      segs.push({ kind: 'text', key: b.id, block: b })
    } else {
      const last = segs[segs.length - 1]
      if (last && last.kind === 'media') last.blocks.push(b)
      else segs.push({ kind: 'media', key: b.id, blocks: [b] })
    }
  }
  return segs
}

// ---------------------------------------------------------------------------
// The editor
// ---------------------------------------------------------------------------
// blocks    : the saved blocks (only read when the editor first appears — give it a `key`)
// onChange  : async (blocks) => boolean   called (debounced) with the finished blocks; return false if saving failed
export default function RichNote({ blocks: initialBlocks, onChange, placeholder = 'Your notes on this...' }) {
  const [blocks, setBlocks] = useState(() => initBlocks(initialBlocks))
  const [lightboxAt, setLightboxAt] = useState(null)
  const [drawing, setDrawing] = useState(null) // { afterId, editId, src }
  const [focusId, setFocusId] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [notice, setNotice] = useState('')

  const fileInputRef = useRef(null)
  const insertAfterRef = useRef(null) // block id the next picked image(s) go after (null = end)
  const latestRef = useRef(blocks)
  const onChangeRef = useRef(onChange)
  const lastSentRef = useRef(JSON.stringify(savableBlocks(blocks)))
  const pendingDeletesRef = useRef([]) // assets to remove once the note that no longer uses them is saved
  const retryRef = useRef({ timer: null, count: 0 })
  const flushRef = useRef(null)
  const migrationStartedRef = useRef(false)

  useEffect(() => { onChangeRef.current = onChange })
  useEffect(() => { latestRef.current = blocks }, [blocks])

  // ---- saving (debounced) ----
  const flush = useCallback(async () => {
    const toSave = savableBlocks(latestRef.current)
    const serial = JSON.stringify(toSave)
    if (serial === lastSentRef.current) return
    lastSentRef.current = serial

    let ok = false
    try { ok = (await onChangeRef.current?.(toSave)) !== false } catch { ok = false }

    if (!ok) {
      lastSentRef.current = null // so the next attempt isn't skipped as "unchanged"
      const r = retryRef.current
      if (r.count < 5) {
        r.count += 1
        clearTimeout(r.timer)
        r.timer = setTimeout(() => flushRef.current?.(), 4000 * r.count)
      }
      return
    }
    retryRef.current.count = 0
    pendingDeletesRef.current.splice(0).forEach((id) => deleteAsset(id))
  }, [])

  useEffect(() => { flushRef.current = flush }, [flush])

  useEffect(() => {
    if (JSON.stringify(savableBlocks(blocks)) === lastSentRef.current) return undefined
    const t = setTimeout(flush, 700)
    return () => clearTimeout(t)
  }, [blocks, flush])

  // leaving the note (collapsing the day, switching page...) saves anything still pending
  useEffect(() => () => { flush() }, [flush])

  // ---- block helpers ----
  const update = useCallback((id, patch) => {
    setBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  }, [])

  const insertAfter = useCallback((afterId, block) => {
    setBlocks((bs) => {
      const i = afterId ? bs.findIndex((b) => b.id === afterId) : bs.length - 1
      const next = [...bs]
      next.splice(i + 1, 0, block)
      return next
    })
  }, [])

  function move(id, dir) {
    setBlocks((bs) => {
      const i = bs.findIndex((b) => b.id === id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= bs.length) return bs
      const next = [...bs]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }

  function removeBlock(id) {
    const b = blocks.find((x) => x.id === id)
    if (!b) return
    if (isMedia(b) && !confirm(`Remove this ${b.type === 'drawing' ? 'drawing' : 'image'} from the note?`)) return
    if (b.type === 'text' && b.text.length > 60 && !confirm('Delete this text block?')) return
    if (b.assetId) pendingDeletesRef.current.push(b.assetId)
    setBlocks((bs) => {
      const next = bs.filter((x) => x.id !== id)
      return next.length ? next : [textBlock()]
    })
  }

  function addText(afterId) {
    const b = textBlock()
    insertAfter(afterId, b)
    setFocusId(b.id)
  }

  // ---- adding pictures ----
  function startUpload(id, dataUrl, kind = 'image') {
    return uploadAsset(dataUrl, kind)
      .then((assetId) => update(id, { assetId, src: undefined, uploading: false, uploadError: null }))
      .catch((err) => update(id, { uploading: false, uploadError: err?.message || 'Upload failed' }))
  }

  async function addImages(files, afterId = null) {
    const list = Array.from(files || []).filter((f) => f.type?.startsWith('image/'))
    if (!list.length) {
      setNotice('Only image files can be added.')
      return
    }
    setNotice('')
    let anchor = afterId
    for (const file of list) {
      try {
        const dataUrl = await fileToDataUrl(file)
        const id = newId()
        insertAfter(anchor, { id, type: 'image', width: DEFAULT_WIDTH.image, src: dataUrl, uploading: true })
        anchor = id // keep several picked images in order
        startUpload(id, dataUrl) // runs in the background; the picture is visible straight away
      } catch (err) {
        setNotice(err?.message || 'Could not add that image.')
      }
    }
  }

  function retryUpload(block) {
    if (!block.src) return
    update(block.id, { uploading: true, uploadError: null })
    startUpload(block.id, block.src, block.type === 'drawing' ? 'drawing' : 'image')
  }

  // Old week notes kept one picture inline in the note itself — move it into the pictures collection once.
  useEffect(() => {
    if (migrationStartedRef.current) return
    migrationStartedRef.current = true
    latestRef.current
      .filter((b) => b.legacy && !b.assetId && b.src)
      .forEach((b) => {
        update(b.id, { uploading: true })
        uploadAsset(b.src, 'image')
          .then((assetId) => update(b.id, { assetId, src: undefined, legacy: undefined, uploading: false }))
          .catch(() => update(b.id, { uploading: false })) // still shown from the old data; we'll try again next time
      })
  }, [update])

  function chooseImages(afterId) {
    insertAfterRef.current = afterId
    fileInputRef.current?.click()
  }

  function onFilesPicked(e) {
    const files = e.target.files
    const after = insertAfterRef.current
    if (files?.length) addImages(files, after)
    e.target.value = '' // so picking the same file again still fires
  }

  // ---- drawing ----
  async function openEditDrawing(block) {
    try {
      const src = block.assetId ? await fetchAsset(block.assetId) : block.src
      setDrawing({ afterId: null, editId: block.id, src })
    } catch {
      setNotice("Couldn't load that drawing to edit it.")
    }
  }

  async function saveDrawing(dataUrl) {
    const d = drawing
    const assetId = await uploadAsset(dataUrl, 'drawing') // throws on failure -> the board stays open and shows the error
    if (d.editId) {
      const old = latestRef.current.find((b) => b.id === d.editId)
      if (old?.assetId) pendingDeletesRef.current.push(old.assetId)
      update(d.editId, { assetId, src: undefined, uploadError: null })
    } else {
      insertAfter(d.afterId, { id: newId(), type: 'drawing', width: DEFAULT_WIDTH.drawing, assetId })
    }
    setDrawing(null)
  }

  function handleAdd(kind, afterId) {
    if (kind === 'text') addText(afterId)
    else if (kind === 'image') chooseImages(afterId)
    else setDrawing({ afterId, editId: null, src: null })
  }

  // ---- paste a screenshot / drop files ----
  function handlePaste(e, blockId) {
    const files = Array.from(e.clipboardData?.files || []).filter((f) => f.type.startsWith('image/'))
    if (files.length && !e.clipboardData.getData('text/plain')) {
      e.preventDefault()
      addImages(files, blockId)
    }
  }

  const hasFiles = (e) => Array.from(e.dataTransfer?.types || []).includes('Files')

  // ---- lightbox ----
  const mediaList = blocks.filter(isMedia)
  const lightboxItems = mediaList.map((b) => ({ key: b.id, type: b.type, assetId: b.assetId, src: b.src }))

  const segments = buildSegments(blocks)
  const onlyEmptyText = blocks.length === 1 && blocks[0].type === 'text' && !blocks[0].text

  return (
    <div
      className={`rounded-lg transition ${dragOver ? 'ring-2 ring-accent/50 bg-accent-soft/40' : ''}`}
      onDragOver={(e) => { if (hasFiles(e)) { e.preventDefault(); setDragOver(true) } }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(false) }}
      onDrop={(e) => {
        setDragOver(false)
        if (hasFiles(e)) { e.preventDefault(); addImages(e.dataTransfer.files, null) }
      }}
    >
      {segments.map((seg) => {
        if (seg.kind === 'text') {
          const b = seg.block
          const i = blocks.findIndex((x) => x.id === b.id)
          return (
            <div key={seg.key} className="relative my-1">
              <AutoTextarea
                value={b.text}
                placeholder={placeholder}
                autoFocus={b.id === focusId}
                padRight={!onlyEmptyText}
                onChange={(text) => update(b.id, { text })}
                onPaste={(e) => handlePaste(e, b.id)}
              />
              {!onlyEmptyText && (
                <BlockMenu
                  className="absolute top-1 right-1"
                  canUp={i > 0}
                  canDown={i < blocks.length - 1}
                  onAdd={(kind) => handleAdd(kind, b.id)}
                  onUp={() => move(b.id, -1)}
                  onDown={() => move(b.id, 1)}
                  onDelete={() => removeBlock(b.id)}
                />
              )}
            </div>
          )
        }

        return (
          <div key={seg.key} className="flex flex-wrap items-start -mx-1 my-1">
            {seg.blocks.map((b) => {
              const i = blocks.findIndex((x) => x.id === b.id)
              return (
                <MediaBlock
                  key={b.id}
                  block={b}
                  canUp={i > 0}
                  canDown={i < blocks.length - 1}
                  onResize={(width) => update(b.id, { width })}
                  onView={() => setLightboxAt(mediaList.findIndex((m) => m.id === b.id))}
                  onEdit={() => openEditDrawing(b)}
                  onAdd={(kind) => handleAdd(kind, b.id)}
                  onUp={() => move(b.id, -1)}
                  onDown={() => move(b.id, 1)}
                  onDelete={() => removeBlock(b.id)}
                  onRetry={() => retryUpload(b)}
                />
              )
            })}
          </div>
        )
      })}

      <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
        <button type="button" className="btn-ghost" onClick={() => handleAdd('text', null)}><Type size={13} /> Text</button>
        <button type="button" className="btn-ghost" onClick={() => handleAdd('image', null)}><ImagePlus size={13} /> Image</button>
        <button type="button" className="btn-ghost" onClick={() => handleAdd('drawing', null)}><PenTool size={13} /> Draw</button>
        <span className="text-[11px] text-muted ml-1 hidden sm:inline">or paste a screenshot (Ctrl+V) / drop images here</span>
      </div>
      {notice && <p className="text-xs text-danger mt-1.5">{notice}</p>}

      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={onFilesPicked} />

      {lightboxAt !== null && lightboxItems[lightboxAt] && (
        <Lightbox items={lightboxItems} index={lightboxAt} onIndex={setLightboxAt} onClose={() => setLightboxAt(null)} />
      )}
      {drawing && (
        <DrawingModal initialSrc={drawing.src} onSave={saveDrawing} onClose={() => setDrawing(null)} />
      )}
    </div>
  )
}
