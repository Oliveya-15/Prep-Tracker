import { useState, useEffect, useCallback } from 'react'
import { api } from '../utils/api.js'

// Rich notes are saved a moment after you type, so a server reply (which carries the whole page) can be
// slightly behind what's on screen. Keep the local blocks of every entry and take the rest from the server.
function keepLocalBlocks(serverPage, localPage) {
  if (!localPage) return serverPage
  const local = new Map((localPage.entries || []).map((e) => [e._id, e]))
  return {
    ...serverPage,
    entries: serverPage.entries.map((e) => {
      const l = local.get(e._id)
      return l?.blocks ? { ...e, blocks: l.blocks } : e
    }),
  }
}

export function usePages() {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // Saving a note must never blank the page, so note-save problems live in their own state
  const [pendingSaves, setPendingSaves] = useState(0)
  const [saveError, setSaveError] = useState('')

  // swap one page for the server's copy, keeping any not-yet-saved local notes
  const replacePage = (pageId, page) =>
    setPages((list) => list.map((p) => (p._id === pageId ? keepLocalBlocks(page, p) : p)))

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      setPages(await api.get('/pages'))
    } catch (err) { setError(err.message) }
    setLoading(false)
  }, [])

  useEffect(() => { reload() }, [reload])

  async function createPage(title, icon) {
    const page = await api.post('/pages', { title, icon })
    setPages((list) => [...list, page])
    return page
  }
  async function renamePage(id, title) {
    const page = await api.patch(`/pages/${id}`, { title })
    replacePage(id, page)
  }
  async function deletePage(id) {
    await api.del(`/pages/${id}`)
    setPages((list) => list.filter((p) => p._id !== id))
  }

  async function addEntry(pageId, entry) {
    const page = await api.post(`/pages/${pageId}/entries`, entry)
    replacePage(pageId, page)
  }
  async function updateEntry(pageId, entryId, patch) {
    const page = await api.patch(`/pages/${pageId}/entries/${entryId}`, patch)
    replacePage(pageId, page)
  }
  async function removeEntry(pageId, entryId) {
    const page = await api.del(`/pages/${pageId}/entries/${entryId}`)
    replacePage(pageId, page)
  }

  // Rich note (text + images + drawings) of one entry.
  // Updates the local copy straight away, then saves in the background. Resolves true/false, never throws.
  async function saveEntryBlocks(pageId, entryId, blocks) {
    setPages((list) =>
      list.map((p) =>
        p._id !== pageId ? p : { ...p, entries: p.entries.map((e) => (e._id === entryId ? { ...e, blocks } : e)) }
      )
    )
    setPendingSaves((n) => n + 1)
    try {
      await api.patch(`/pages/${pageId}/entries/${entryId}/blocks`, { blocks })
      setSaveError('')
      return true
    } catch (err) {
      setSaveError(err?.message || "Couldn't save your notes.")
      return false
    } finally {
      setPendingSaves((n) => n - 1)
    }
  }

  return {
    pages, loading, error, reload,
    createPage, renamePage, deletePage,
    addEntry, updateEntry, removeEntry,
    saveEntryBlocks, pendingSaves, saveError, clearSaveError: () => setSaveError(''),
  }
}
