import { useState, useEffect, useCallback } from 'react'
import { api } from '../utils/api.js'

export function useTodos() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      setTodos(await api.get('/todos'))
    } catch (err) { setError(err.message) }
    setLoading(false)
  }, [])

  useEffect(() => { reload() }, [reload])

  async function addTodo(text) {
    const todo = await api.post('/todos', { text })
    setTodos((list) => [todo, ...list])
  }
  async function toggleTodo(id, done) {
    setTodos((list) => list.map((t) => (t._id === id ? { ...t, done } : t)))
    await api.patch(`/todos/${id}`, { done })
  }
  async function editTodo(id, text) {
    setTodos((list) => list.map((t) => (t._id === id ? { ...t, text } : t)))
    await api.patch(`/todos/${id}`, { text })
  }
  async function removeTodo(id) {
    setTodos((list) => list.filter((t) => t._id !== id))
    await api.del(`/todos/${id}`)
  }

  return { todos, loading, error, addTodo, toggleTodo, editTodo, removeTodo }
}
