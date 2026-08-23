import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Logo from '../components/Logo.jsx'
import { Loader2 } from 'lucide-react'

export default function Login() {
  const { login, error } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    const ok = await login(password)
    setSubmitting(false)
    if (ok) navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm p-8">
        <div className="flex items-center gap-2.5 mb-1">
          <Logo size={30} />
          <span className="font-mono font-bold text-base">PREP DASHBOARD</span>
        </div>
        <p className="text-muted text-sm mb-6">Enter your passcode to continue.</p>

        <input
          type="password"
          autoFocus
          className="input-field w-full mb-3"
          placeholder="Passcode"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <div className="text-danger text-sm mb-3">{error}</div>}

        <button type="submit" disabled={submitting} className="btn-primary w-full justify-center disabled:opacity-60">
          {submitting ? <Loader2 size={15} className="animate-spin" /> : null}
          {submitting ? 'Checking...' : 'Enter'}
        </button>
      </form>
    </div>
  )
}
