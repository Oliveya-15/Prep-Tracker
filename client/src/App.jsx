import { useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { PagesProvider } from './context/PagesContext.jsx'
import Sidebar from './components/Sidebar.jsx'
import Logo from './components/Logo.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import DSA from './pages/DSA.jsx'
import Aptitude from './pages/Aptitude.jsx'
import Todo from './pages/Todo.jsx'
import CustomPage from './pages/CustomPage.jsx'

function RequireAuth({ children }) {
  const { isAuthed } = useAuth()
  const location = useLocation()
  if (!isAuthed) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

function Shell() {
  const [navOpen, setNavOpen] = useState(false)

  return (
    <PagesProvider>
      <div className="flex flex-col md:flex-row min-h-screen">
        <div className="md:hidden flex items-center gap-3 px-4 py-3.5 bg-surface border-b border-line sticky top-0 z-20">
          <button onClick={() => setNavOpen(true)} aria-label="Open menu"><Menu size={19} /></button>
          <Logo size={22} />
          <span className="font-mono text-xs font-bold">PREP DASHBOARD</span>
        </div>

        <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />

        <div className="flex-1 min-w-0 px-5 py-7 md:px-9 md:py-8 max-w-4xl">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dsa" element={<DSA />} />
            <Route path="/aptitude" element={<Aptitude />} />
            <Route path="/todo" element={<Todo />} />
            <Route path="/pages/:id" element={<CustomPage />} />
          </Routes>
        </div>
      </div>
    </PagesProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <Shell />
            </RequireAuth>
          }
        />
      </Routes>
    </AuthProvider>
  )
}
