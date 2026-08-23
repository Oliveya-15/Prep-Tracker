import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

const emptyTask = { type: 'link', text: '', url: '', tag: '' }

export default function DayEditor({ initial, defaultWeek, onSave, onCancel }) {
  const [title, setTitle] = useState(initial?.title || '')
  const [week, setWeek] = useState(initial?.week || defaultWeek || 1)
  const [conceptText, setConceptText] = useState((initial?.concept || []).join('\n'))
  const [tasks, setTasks] = useState(initial?.tasks?.length ? initial.tasks.map((t) => ({ ...t })) : [{ ...emptyTask }])

  function updateTask(i, patch) {
    setTasks((list) => list.map((t, idx) => (idx === i ? { ...t, ...patch } : t)))
  }
  function addTask() {
    setTasks((list) => [...list, { ...emptyTask }])
  }
  function removeTask(i) {
    setTasks((list) => list.filter((_, idx) => idx !== i))
  }

  function handleSave() {
    if (!title.trim()) return
    const cleanTasks = tasks
      .filter((t) => t.text.trim())
      .map((t) => ({ type: t.type, text: t.text.trim(), url: t.type === 'link' ? t.url.trim() : '', tag: t.tag.trim() }))
    onSave({
      title: title.trim(),
      week: Number(week),
      concept: conceptText.split('\n').map((s) => s.trim()).filter(Boolean),
      tasks: cleanTasks,
    })
  }

  return (
    <div className="bg-bg border border-dashed border-line rounded-lg p-4 mt-2 space-y-3">
      <div className="flex gap-3">
        <input
          className="input-field flex-1"
          placeholder="Day title (e.g. Binary Search)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="number"
          min={1}
          className="input-field w-24"
          placeholder="Week"
          value={week}
          onChange={(e) => setWeek(e.target.value)}
        />
      </div>

      <textarea
        className="textarea-note"
        placeholder="Concept notes — one point per line (optional)"
        rows={3}
        value={conceptText}
        onChange={(e) => setConceptText(e.target.value)}
      />

      <div className="space-y-2">
        <div className="font-mono text-[11px] uppercase tracking-wide text-muted">Tasks</div>
        {tasks.map((t, i) => (
          <div key={i} className="flex flex-wrap gap-2 items-center bg-surface border border-line rounded-lg p-2">
            <select
              className="input-field py-1.5 text-xs"
              value={t.type}
              onChange={(e) => updateTask(i, { type: e.target.value })}
            >
              <option value="link">Link</option>
              <option value="custom">Custom</option>
            </select>
            <input
              className="input-field flex-1 min-w-[140px] py-1.5"
              placeholder="Task text"
              value={t.text}
              onChange={(e) => updateTask(i, { text: e.target.value })}
            />
            {t.type === 'link' && (
              <input
                className="input-field flex-1 min-w-[160px] py-1.5"
                placeholder="https://..."
                value={t.url}
                onChange={(e) => updateTask(i, { url: e.target.value })}
              />
            )}
            <input
              className="input-field w-24 py-1.5"
              placeholder="Tag"
              value={t.tag}
              onChange={(e) => updateTask(i, { tag: e.target.value })}
            />
            <button className="text-muted hover:text-danger" onClick={() => removeTask(i)} aria-label="Remove task">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        <button type="button" className="btn-ghost" onClick={addTask}>
          <Plus size={13} /> Add task
        </button>
      </div>

      <div className="flex gap-2 pt-1">
        <button type="button" className="btn-primary" onClick={handleSave}>Save day</button>
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
