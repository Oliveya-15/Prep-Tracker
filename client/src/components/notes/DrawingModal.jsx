import { useCallback, useEffect, useRef, useState } from 'react'
import { X, Undo2, Redo2, Trash2, Pencil, Highlighter, Eraser, Minus, MoveUpRight, Square, Circle, Loader2 } from 'lucide-react'

const PRESETS = [
  { id: 'wide', label: 'Wide', w: 1200, h: 700 },
  { id: 'standard', label: 'Standard', w: 1000, h: 750 },
  { id: 'square', label: 'Square', w: 900, h: 900 },
  { id: 'tall', label: 'Tall', w: 800, h: 1100 },
  { id: 'large', label: 'Large — extra room', w: 1600, h: 1000 },
]

const COLORS = ['#111111', '#2563eb', '#16a34a', '#facc15', '#dc2626', '#9333ea']

const TOOLS = [
  { id: 'pen', label: 'Pen', Icon: Pencil },
  { id: 'highlighter', label: 'Highlighter', Icon: Highlighter },
  { id: 'eraser', label: 'Eraser', Icon: Eraser },
  { id: 'line', label: 'Line', Icon: Minus },
  { id: 'arrow', label: 'Arrow', Icon: MoveUpRight },
  { id: 'rect', label: 'Rectangle', Icon: Square },
  { id: 'ellipse', label: 'Ellipse', Icon: Circle },
]

const isFreehand = (tool) => tool === 'pen' || tool === 'highlighter' || tool === 'eraser'

// Draws one stroke (freehand line or shape) onto a 2D context.
function paintStroke(ctx, s) {
  if (s.tool === 'clear') {
    ctx.save()
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.restore()
    return
  }

  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  const colour = s.tool === 'eraser' ? '#ffffff' : s.color
  ctx.strokeStyle = colour
  ctx.fillStyle = colour
  const lw = s.width * (s.tool === 'highlighter' || s.tool === 'eraser' ? 3 : 1)
  ctx.lineWidth = lw
  if (s.tool === 'highlighter') ctx.globalAlpha = 0.35

  const pts = s.points
  if (isFreehand(s.tool)) {
    if (pts.length === 1) {
      ctx.beginPath()
      ctx.arc(pts[0].x, pts[0].y, lw / 2, 0, Math.PI * 2)
      ctx.fill()
    } else {
      // Smooth the line by curving through the midpoints between samples
      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i].x + pts[i + 1].x) / 2
        const my = (pts[i].y + pts[i + 1].y) / 2
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my)
      }
      const last = pts[pts.length - 1]
      ctx.lineTo(last.x, last.y)
      ctx.stroke()
    }
  } else if (pts.length >= 2) {
    const a = pts[0]
    const b = pts[pts.length - 1]
    ctx.beginPath()
    if (s.tool === 'line' || s.tool === 'arrow') {
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      if (s.tool === 'arrow') {
        const angle = Math.atan2(b.y - a.y, b.x - a.x)
        const head = Math.max(14, lw * 4)
        ctx.moveTo(b.x, b.y)
        ctx.lineTo(b.x - head * Math.cos(angle - Math.PI / 6), b.y - head * Math.sin(angle - Math.PI / 6))
        ctx.moveTo(b.x, b.y)
        ctx.lineTo(b.x - head * Math.cos(angle + Math.PI / 6), b.y - head * Math.sin(angle + Math.PI / 6))
      }
    } else if (s.tool === 'rect') {
      ctx.rect(a.x, a.y, b.x - a.x, b.y - a.y)
    } else if (s.tool === 'ellipse') {
      ctx.ellipse((a.x + b.x) / 2, (a.y + b.y) / 2, Math.abs(b.x - a.x) / 2, Math.abs(b.y - a.y) / 2, 0, 0, Math.PI * 2)
    }
    ctx.stroke()
  }
  ctx.restore()
}

// initialSrc: data URL of an existing drawing to keep editing (optional)
// onSave(dataUrl): async — the modal stays open (showing "Saving...") until it resolves; if it throws, the error is shown
export default function DrawingModal({ initialSrc, onSave, onClose }) {
  const canvasRef = useRef(null)
  const committedRef = useRef(null) // off-screen canvas holding everything already drawn
  const strokesRef = useRef([])
  const redoRef = useRef([])
  const baseRef = useRef(null) // the picture being edited, if any
  const curRef = useRef(null) // stroke in progress
  const rafRef = useRef(0)
  const savingRef = useRef(false)

  const [dims, setDims] = useState({ w: 1200, h: 700 })
  const [presetId, setPresetId] = useState('wide')
  const [tool, setTool] = useState('pen')
  const [color, setColor] = useState('#111111')
  const [lineW, setLineW] = useState(4)
  const [ready, setReady] = useState(!initialSrc)
  const [loadFailed, setLoadFailed] = useState(false)
  const [counts, setCounts] = useState({ strokes: 0, redo: 0 }) // mirrors the refs so the buttons re-render
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const bump = useCallback(() => setCounts({ strokes: strokesRef.current.length, redo: redoRef.current.length }), [])

  // ---- drawing helpers (only touch refs, so they're safe to call from anywhere) ----
  const renderMain = useCallback(() => {
    const canvas = canvasRef.current
    const committed = committedRef.current
    if (!canvas || !committed) return
    const ctx = canvas.getContext('2d')
    ctx.drawImage(committed, 0, 0)
    if (curRef.current) paintStroke(ctx, curRef.current)
  }, [])

  const scheduleRender = useCallback(() => {
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0
      renderMain()
    })
  }, [renderMain])

  const rebuild = useCallback(() => {
    const committed = committedRef.current
    if (!committed) return
    const ctx = committed.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, committed.width, committed.height)
    if (baseRef.current) ctx.drawImage(baseRef.current, 0, 0, committed.width, committed.height)
    strokesRef.current.forEach((s) => paintStroke(ctx, s))
    renderMain()
  }, [renderMain])

  // (Re)create the canvases whenever the size changes
  useEffect(() => {
    const canvas = canvasRef.current
    canvas.width = dims.w
    canvas.height = dims.h
    const off = document.createElement('canvas')
    off.width = dims.w
    off.height = dims.h
    committedRef.current = off
    rebuild()
  }, [dims, rebuild])

  // Load the existing drawing (when editing)
  useEffect(() => {
    if (!initialSrc) return undefined
    let cancelled = false
    const img = new Image()
    img.onload = () => {
      if (cancelled) return
      baseRef.current = img
      setDims({ w: img.naturalWidth, h: img.naturalHeight })
      setReady(true)
    }
    img.onerror = () => {
      if (cancelled) return
      setLoadFailed(true)
      setReady(true)
      setError("Couldn't load this drawing to edit it.")
    }
    img.src = initialSrc
    return () => { cancelled = true }
  }, [initialSrc])

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  // ---- pointer input (mouse, touch and pen all arrive as pointer events) ----
  function pointFromEvent(e) {
    const c = canvasRef.current
    const r = c.getBoundingClientRect()
    return { x: (e.clientX - r.left) * (c.width / r.width), y: (e.clientY - r.top) * (c.height / r.height) }
  }

  function onPointerDown(e) {
    if (!ready || loadFailed || saving) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    e.preventDefault()
    canvasRef.current.setPointerCapture(e.pointerId)
    curRef.current = { tool, color, width: lineW, points: [pointFromEvent(e)] }
    scheduleRender()
  }

  function onPointerMove(e) {
    const cur = curRef.current
    if (!cur) return
    const events = e.nativeEvent.getCoalescedEvents?.() || []
    const list = events.length ? events : [e.nativeEvent]
    for (const ev of list) {
      const p = pointFromEvent(ev)
      if (isFreehand(cur.tool)) {
        const last = cur.points[cur.points.length - 1]
        if (Math.hypot(p.x - last.x, p.y - last.y) >= 1.2) cur.points.push(p)
      } else {
        cur.points = [cur.points[0], p]
      }
    }
    scheduleRender()
  }

  function endStroke() {
    const cur = curRef.current
    if (!cur) return
    curRef.current = null
    if (!isFreehand(cur.tool) && cur.points.length < 2) {
      renderMain()
      return
    }
    strokesRef.current.push(cur)
    redoRef.current = []
    paintStroke(committedRef.current.getContext('2d'), cur)
    renderMain()
    bump()
  }

  // ---- undo / redo / clear ----
  const undo = useCallback(() => {
    if (curRef.current) return
    const s = strokesRef.current.pop()
    if (!s) return
    redoRef.current.push(s)
    rebuild()
    bump()
  }, [rebuild, bump])

  const redo = useCallback(() => {
    if (curRef.current) return
    const s = redoRef.current.pop()
    if (!s) return
    strokesRef.current.push(s)
    paintStroke(committedRef.current.getContext('2d'), s)
    renderMain()
    bump()
  }, [renderMain, bump])

  function clearAll() {
    if (!strokesRef.current.length && !baseRef.current) return
    const s = { tool: 'clear' }
    strokesRef.current.push(s)
    redoRef.current = []
    paintStroke(committedRef.current.getContext('2d'), s)
    renderMain()
    bump()
  }

  const requestClose = useCallback(() => {
    if (savingRef.current) return
    if (strokesRef.current.length && !confirm('Discard this drawing? Your changes will be lost.')) return
    onClose()
  }, [onClose])

  // keyboard shortcuts + stop the page behind from scrolling
  useEffect(() => {
    function onKey(e) {
      const mod = e.ctrlKey || e.metaKey
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      } else if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        redo()
      } else if (e.key === 'Escape') {
        requestClose()
      }
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [undo, redo, requestClose])

  async function handleSave() {
    if (!strokesRef.current.length || saving || loadFailed) return
    savingRef.current = true
    setSaving(true)
    setError('')
    try {
      renderMain()
      const canvas = canvasRef.current
      let dataUrl = canvas.toDataURL('image/png')
      if (dataUrl.length > 3_000_000) dataUrl = canvas.toDataURL('image/jpeg', 0.9) // very busy drawings: smaller file
      await onSave(dataUrl)
    } catch (err) {
      setError(err?.message || 'Could not save the drawing. Please try again.')
      savingRef.current = false
      setSaving(false)
    }
  }

  const canUndo = counts.strokes > 0
  const canRedo = counts.redo > 0
  const canChangeSize = !initialSrc && counts.strokes === 0
  const showColour = tool !== 'eraser'

  const btn = 'inline-flex items-center justify-center rounded-lg border px-2.5 py-1.5 text-xs font-mono transition disabled:opacity-35 disabled:cursor-not-allowed'

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-2 sm:p-4" role="dialog" aria-modal="true" aria-label="Drawing board">
      <div className="bg-surface rounded-xl shadow-2xl w-full max-w-[1320px] max-h-full flex flex-col overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-line flex-wrap">
          <h2 className="font-mono text-xs uppercase tracking-wide text-muted">{initialSrc ? 'Edit drawing' : 'New drawing'}</h2>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-muted">
              Canvas
              <select
                className="input-field !py-1 !px-2 text-xs"
                value={presetId}
                disabled={!canChangeSize}
                title={canChangeSize ? 'Pick the canvas shape' : 'The canvas size is locked once you start drawing'}
                onChange={(e) => {
                  const p = PRESETS.find((x) => x.id === e.target.value)
                  setPresetId(p.id)
                  setDims({ w: p.w, h: p.h })
                }}
              >
                {PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </label>
            <button type="button" onClick={requestClose} className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-surface-alt" aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* toolbar */}
        <div className="flex items-center gap-x-4 gap-y-2 px-4 py-2.5 border-b border-line flex-wrap bg-bg/60">
          <div className="flex items-center gap-1 flex-wrap">
            {TOOLS.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTool(id)}
                title={label}
                aria-label={label}
                aria-pressed={tool === id}
                className={`${btn} ${tool === id ? 'bg-accent text-white border-accent' : 'border-line text-muted bg-surface hover:border-accent hover:text-accent'}`}
              >
                <Icon size={15} />
              </button>
            ))}
          </div>

          {showColour && (
            <div className="flex items-center gap-1.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`Colour ${c}`}
                  className={`w-6 h-6 rounded-full border-2 transition ${color === c ? 'border-accent scale-110' : 'border-white shadow-[0_0_0_1px_var(--color-line)]'}`}
                  style={{ background: c }}
                />
              ))}
              <label className="relative w-6 h-6 rounded-full overflow-hidden cursor-pointer shadow-[0_0_0_1px_var(--color-line)]" title="Custom colour">
                <span className="absolute inset-0" style={{ background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }} />
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" aria-label="Custom colour" />
              </label>
            </div>
          )}

          <label className="flex items-center gap-2 text-xs text-muted">
            Size
            <input type="range" min="1" max="40" value={lineW} onChange={(e) => setLineW(Number(e.target.value))} className="w-28 accent-accent" />
            <span className="inline-block rounded-full bg-ink" style={{ width: Math.max(3, Math.min(lineW, 24)), height: Math.max(3, Math.min(lineW, 24)) }} />
          </label>

          <div className="flex items-center gap-1 ml-auto">
            <button type="button" onClick={undo} disabled={!canUndo} className={`${btn} border-line text-muted bg-surface hover:border-accent hover:text-accent`} title="Undo (Ctrl+Z)">
              <Undo2 size={15} />
            </button>
            <button type="button" onClick={redo} disabled={!canRedo} className={`${btn} border-line text-muted bg-surface hover:border-accent hover:text-accent`} title="Redo (Ctrl+Y)">
              <Redo2 size={15} />
            </button>
            <button type="button" onClick={clearAll} disabled={!canUndo && !initialSrc} className={`${btn} border-line text-muted bg-surface hover:border-danger hover:text-danger`} title="Clear the canvas (you can still undo)">
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* canvas */}
        <div className="flex-1 min-h-0 overflow-auto bg-surface-alt p-3 flex">
          {!ready && (
            <div className="m-auto text-sm text-muted flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Loading drawing...
            </div>
          )}
          <canvas
            ref={canvasRef}
            width={dims.w}
            height={dims.h}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endStroke}
            onPointerCancel={endStroke}
            className={`m-auto bg-white rounded-lg shadow-md border border-line ${ready ? '' : 'hidden'}`}
            style={{
              maxWidth: '100%',
              maxHeight: 'calc(100dvh - 235px)',
              width: 'auto',
              height: 'auto',
              touchAction: 'none',
              cursor: 'crosshair',
            }}
          />
        </div>

        {/* footer */}
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-t border-line flex-wrap">
          <p className={`text-xs ${error ? 'text-danger' : 'text-muted'}`}>
            {error || 'Tip: Ctrl+Z undoes. Works with mouse, touch and stylus.'}
          </p>
          <div className="flex gap-2">
            <button type="button" className="btn-ghost" onClick={requestClose} disabled={saving}>Cancel</button>
            <button type="button" className="btn-primary disabled:opacity-40" onClick={handleSave} disabled={!canUndo || saving || loadFailed}>
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? 'Saving...' : initialSrc ? 'Save changes' : 'Insert drawing'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
