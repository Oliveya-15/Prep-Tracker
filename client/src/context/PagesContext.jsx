import { createContext, useContext } from 'react'
import { usePages } from '../hooks/usePages.js'

const PagesContext = createContext(null)

export function PagesProvider({ children }) {
  const value = usePages()
  return <PagesContext.Provider value={value}>{children}</PagesContext.Provider>
}

export function usePagesContext() {
  const ctx = useContext(PagesContext)
  if (!ctx) throw new Error('usePagesContext must be used inside PagesProvider')
  return ctx
}
