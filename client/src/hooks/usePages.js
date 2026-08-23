import { useState, useEffect, useCallback } from 'react'
import { api } from '../utils/api.js'

export function usePages() {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
    setPages((list) => list.map((p) => (p._id === id ? page : p)))
  }
  async function deletePage(id) {
    await api.del(`/pages/${id}`)
    setPages((list) => list.filter((p) => p._id !== id))
  }

  async function addEntry(pageId, entry) {
    const page = await api.post(`/pages/${pageId}/entries`, entry)
    setPages((list) => list.map((p) => (p._id === pageId ? page : p)))
  }
  async function updateEntry(pageId, entryId, patch) {
    const page = await api.patch(`/pages/${pageId}/entries/${entryId}`, patch)
    setPages((list) => list.map((p) => (p._id === pageId ? page : p)))
  }
  async function removeEntry(pageId, entryId) {
    const page = await api.del(`/pages/${pageId}/entries/${entryId}`)
    setPages((list) => list.map((p) => (p._id === pageId ? page : p)))
  }

  return { pages, loading, error, reload, createPage, renamePage, deletePage, addEntry, updateEntry, removeEntry }
}
