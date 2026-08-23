import { useState } from 'react'
import { Trash2, Plus, Pencil, Check, Loader2 } from 'lucide-react'
import { useTodos } from '../hooks/useTodos.js'

function TodoRow({ todo, onToggle, onEdit, onRemove }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(todo.text)

  function save() {
    const t = draft.trim()
    if (t && t !== todo.text) onEdit(t)
    setEditing(false)
  }

  return (
    <div className={`card mb-2.5 ${todo.done ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-2.5">
        <input type="checkbox" className="w-4 h-4 accent-accent shrink-0" checked={todo.done} onChange={(e) => onToggle(e.target.checked)} />
        {editing ? (
          <input
            autoFocus
            className="input-field flex-1 py-1"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setDraft(todo.text); setEditing(false) } }}
            onBlur={save}
          />
        ) : (
          <span className={`flex-1 font-semibold text-sm ${todo.done ? 'line-through text-muted' : ''}`}>{todo.text}</span>
        )}
        {editing ? (
          <button className="text-muted hover:text-accent p-1" onClick={save} aria-label="Save"><Check size={15} /></button>
        ) : (
          <button className="text-muted hover:text-accent p-1" onClick={() => setEditing(true)} aria-label="Edit"><Pencil size={14} /></button>
        )}
        <button className="text-muted hover:text-danger p-1" onClick={onRemove} aria-label="Delete"><Trash2 size={15} /></button>
      </div>
    </div>
  )
}

export default function Todo() {
  const { todos, loading, error, addTodo, toggleTodo, editTodo, removeTodo } = useTodos()
  const [text, setText] = useState('')

  function handleAdd(e) {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    addTodo(t)
    setText('')
  }

  const open = todos.filter((t) => !t.done)
  const done = todos.filter((t) => t.done)

  return (
    <div>
      <div className="font-mono text-[11.5px] uppercase tracking-wide text-muted">General</div>
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">Todo</h1>
      <p className="text-muted text-sm mb-6 max-w-2xl">Everything that doesn't need its own tracker — quick tasks, reminders, one-off things.</p>

      <form className="flex gap-2 mb-5" onSubmit={handleAdd}>
        <input
          className="input-field flex-1"
          placeholder="Add a task and press Enter..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="btn-primary"><Plus size={15} /> Add</button>
      </form>

      {loading && <div className="flex items-center gap-2 text-muted text-sm py-6"><Loader2 size={15} className="animate-spin" /> Loading...</div>}
      {error && <div className="text-danger text-sm mb-4">{error}</div>}

      {!loading && todos.length === 0 && (
        <div className="text-center py-14 text-muted text-sm">Nothing here yet. Add your first task above.</div>
      )}

      {open.map((t) => (
        <TodoRow key={t._id} todo={t} onToggle={(done) => toggleTodo(t._id, done)} onEdit={(text) => editTodo(t._id, text)} onRemove={() => removeTodo(t._id)} />
      ))}

      {done.length > 0 && (
        <>
          <div className="font-mono text-[11px] uppercase tracking-wide text-muted mt-5 mb-2">Done ({done.length})</div>
          {done.map((t) => (
            <TodoRow key={t._id} todo={t} onToggle={(done) => toggleTodo(t._id, done)} onEdit={(text) => editTodo(t._id, text)} onRemove={() => removeTodo(t._id)} />
          ))}
        </>
      )}
    </div>
  )
}
