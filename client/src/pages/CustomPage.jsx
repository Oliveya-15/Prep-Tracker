import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Trash2, ExternalLink, Loader2, MoreVertical } from 'lucide-react'
import { usePagesContext } from '../context/PagesContext.jsx'
import RichNote from '../components/notes/RichNote.jsx'
import SaveStatus from '../components/notes/SaveStatus.jsx'
import { getEntryBlocks } from '../utils/blocks.js'

export default function CustomPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { pages, loading, renamePage, deletePage, addEntry, updateEntry, removeEntry, saveEntryBlocks, pendingSaves, saveError, clearSaveError } = usePagesContext()
  const [form, setForm] = useState({ title: '', link: '' })
  const [menuOpen, setMenuOpen] = useState(false)

  const page = pages.find((p) => p._id === id)

  if (loading) {
    return <div className="flex items-center gap-2 text-muted text-sm py-10"><Loader2 size={16} className="animate-spin" /> Loading...</div>
  }
  if (!page) {
    return <div className="text-muted text-sm py-10">This page doesn't exist (or was deleted). Pick another one from the sidebar.</div>
  }

  function handleAddEntry(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    addEntry(page._id, { title: form.title.trim(), link: form.link.trim(), notes: '' })
    setForm({ title: '', link: '' })
  }

  // Deleting an entry also deletes its pictures for good, so ask first when it has any
  function handleRemoveEntry(entry) {
    const pictures = (entry.blocks || []).filter((b) => b.type !== 'text').length
    if (pictures && !confirm(`Delete "${entry.title}" and its ${pictures} image${pictures > 1 ? 's / drawings' : ' / drawing'}? This can't be undone.`)) return
    removeEntry(page._id, entry._id)
  }

  async function handleDeletePage() {
    if (!confirm(`Delete "${page.title}" and everything in it? This can't be undone.`)) return
    await deletePage(page._id)
    navigate('/')
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{page.icon}</span>
          <input
            className="text-2xl md:text-3xl font-bold tracking-tight bg-transparent border-none focus:outline-none focus:bg-surface-alt rounded-lg px-1"
            value={page.title}
            onChange={(e) => renamePage(page._id, e.target.value)}
          />
        </div>
        <div className="relative">
          <button className="text-muted hover:text-ink p-1.5" onClick={() => setMenuOpen((o) => !o)}><MoreVertical size={18} /></button>
          {menuOpen && (
            <div className="absolute right-0 top-9 bg-surface border border-line rounded-lg shadow-lg py-1 z-10 w-40" onMouseLeave={() => setMenuOpen(false)}>
              <button className="w-full text-left px-3 py-2 text-sm text-danger hover:bg-danger-soft" onClick={handleDeletePage}>Delete page</button>
            </div>
          )}
        </div>
      </div>
      <p className="text-muted text-sm mb-6">Your own space — add whatever you're studying, tracking, or storing here.</p>

      <form className="flex gap-2 mb-6 flex-wrap" onSubmit={handleAddEntry}>
        <input
          className="input-field flex-1 min-w-[160px]"
          placeholder="Entry title..."
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
        <input
          className="input-field flex-1 min-w-[160px]"
          placeholder="Link (optional)"
          value={form.link}
          onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
        />
        <button type="submit" className="btn-primary"><Plus size={15} /> Add</button>
      </form>

      {page.entries.length === 0 && (
        <div className="text-center py-14 text-muted text-sm">No entries yet. Add the first thing above.</div>
      )}

      {page.entries.map((entry) => (
        <div key={entry._id} className="card mb-2.5">
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              className="w-4 h-4 accent-accent shrink-0"
              checked={entry.done}
              onChange={(e) => updateEntry(page._id, entry._id, { done: e.target.checked })}
            />
            <input
              className={`flex-1 font-semibold text-sm bg-transparent border-none focus:outline-none focus:bg-surface-alt rounded px-1 ${entry.done ? 'line-through text-muted' : ''}`}
              value={entry.title}
              onChange={(e) => updateEntry(page._id, entry._id, { title: e.target.value })}
            />
            {entry.link && (
              <a href={entry.link} target="_blank" rel="noopener noreferrer" className="text-accent flex items-center gap-1 text-xs shrink-0">
                <ExternalLink size={12} />
              </a>
            )}
            <button className="text-muted hover:text-danger p-1 shrink-0" onClick={() => handleRemoveEntry(entry)} aria-label="Delete entry">
              <Trash2 size={15} />
            </button>
          </div>
          <div className="mt-2.5">
            <RichNote
              key={entry._id}
              blocks={getEntryBlocks(entry)}
              placeholder="Notes..."
              onChange={(blocks) => saveEntryBlocks(page._id, entry._id, blocks)}
            />
          </div>
        </div>
      ))}

      <SaveStatus pending={pendingSaves} error={saveError} onDismiss={clearSaveError} />
    </div>
  )
}
