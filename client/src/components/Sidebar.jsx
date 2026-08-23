import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Code2, Calculator, CheckSquare, Plus, X, LogOut, FileText } from 'lucide-react'
import Logo from './Logo.jsx'
import { usePagesContext } from '../context/PagesContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const fixedLinks = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/dsa', label: 'DSA', icon: Code2 },
  { to: '/aptitude', label: 'Aptitude', icon: Calculator },
  { to: '/todo', label: 'Todo', icon: CheckSquare },
]

const ICON_CHOICES = ['📄', '🧠', '🛠️', '📚', '🚀', '🎯', '💼', '🔬']

function NewPageModal({ onClose, onCreate }) {
  const [title, setTitle] = useState('')
  const [icon, setIcon] = useState('📄')

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onCreate(title.trim(), icon)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[90] bg-ink/40 flex items-center justify-center p-4" onClick={onClose}>
      <form className="card w-full max-w-xs" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="font-mono text-xs uppercase tracking-wide text-muted mb-3">New page</div>
        <input
          autoFocus
          className="input-field w-full mb-3"
          placeholder="Page title (e.g. Chat App Project)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="flex gap-1.5 flex-wrap mb-4">
          {ICON_CHOICES.map((ic) => (
            <button
              type="button"
              key={ic}
              onClick={() => setIcon(ic)}
              className={`text-lg w-9 h-9 rounded-lg border flex items-center justify-center ${icon === ic ? 'border-accent bg-accent-soft' : 'border-line'}`}
            >
              {ic}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary flex-1 justify-center">Create</button>
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  )
}

export default function Sidebar({ open, onClose }) {
  const { pages, createPage } = usePagesContext()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [showNewPage, setShowNewPage] = useState(false)

  async function handleCreate(title, icon) {
    const page = await createPage(title, icon)
    navigate(`/pages/${page._id}`)
    onClose?.()
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <>
      {open && <div className="fixed inset-0 bg-ink/35 z-30 md:hidden" onClick={onClose} />}
      <aside className={`fixed md:sticky top-0 h-screen w-[232px] shrink-0 bg-surface border-r border-line p-3.5 overflow-y-auto z-40 transition-transform md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between pb-4 mb-3 border-b border-line px-1">
          <div className="flex items-center gap-2">
            <Logo size={26} />
            <div>
              <div className="font-mono font-bold text-[13px] leading-tight">PREP DASHBOARD</div>
              <div className="text-[11px] text-muted leading-tight">Command center</div>
            </div>
          </div>
          <button className="md:hidden text-muted" onClick={onClose} aria-label="Close menu"><X size={18} /></button>
        </div>

        <nav className="space-y-0.5">
          {fixedLinks.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] font-medium ${isActive ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-surface-alt hover:text-ink'}`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-5 pt-4 border-t border-line">
          <div className="flex items-center justify-between px-2.5 mb-1.5">
            <span className="font-mono text-[10.5px] uppercase tracking-wide text-muted">Your pages</span>
            <button className="text-muted hover:text-accent" onClick={() => setShowNewPage(true)} aria-label="New page">
              <Plus size={14} />
            </button>
          </div>
          <nav className="space-y-0.5">
            {pages.map((p) => (
              <NavLink
                key={p._id}
                to={`/pages/${p._id}`}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] font-medium truncate ${isActive ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-surface-alt hover:text-ink'}`
                }
              >
                <span className="text-[15px] leading-none">{p.icon || '📄'}</span>
                <span className="truncate">{p.title}</span>
              </NavLink>
            ))}
            {pages.length === 0 && (
              <button
                onClick={() => setShowNewPage(true)}
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-[13px] text-muted hover:text-accent w-full"
              >
                <FileText size={14} /> Create your first page
              </button>
            )}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-2.5 py-2 mt-6 rounded-lg text-[13px] text-muted hover:text-danger w-full"
        >
          <LogOut size={15} /> Log out
        </button>
      </aside>

      {showNewPage && <NewPageModal onClose={() => setShowNewPage(false)} onCreate={handleCreate} />}
    </>
  )
}
