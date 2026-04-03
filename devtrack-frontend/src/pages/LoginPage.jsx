import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate   = useNavigate()

  const [form,    setForm]    = useState({ email: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return }
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — animated branding ─────────────────── */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 flex-col justify-center items-center text-white p-12 relative overflow-hidden">

        {/* Floating animated orbs — unique DevTrack personality */}
        <div className="orb-1 absolute top-16 left-16 w-48 h-48 rounded-full bg-white opacity-5 pointer-events-none" />
        <div className="orb-2 absolute bottom-20 right-10 w-72 h-72 rounded-full bg-indigo-400 opacity-10 pointer-events-none" />
        <div className="orb-3 absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-violet-300 opacity-10 pointer-events-none" />
        <div className="orb-1 absolute bottom-10 left-1/4 w-20 h-20 rounded-full bg-white opacity-5 pointer-events-none" />

        {/* Animated grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center">
          {/* Animated gradient logo */}
          <div className="mb-3 text-6xl font-black tracking-tight logo-gradient">
            DevTrack
          </div>
          <p className="text-indigo-200 text-lg mb-12 max-w-xs mx-auto leading-relaxed">
            Manage projects, track tasks, and ship faster — together.
          </p>

          {/* Animated stat boxes */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-sm mx-auto">
            {[
              { value: '12', label: 'Projects' },
              { value: '48', label: 'Tasks'    },
              { value: '5',  label: 'Teams'    },
            ].map(({ value, label }, i) => (
              <div
                key={label}
                className="animate-fade-up bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white border-opacity-20"
                style={{ animationDelay: `${0.2 + i * 0.12}s` }}
              >
                <div className="text-3xl font-black mb-0.5">{value}</div>
                <div className="text-indigo-200 text-xs font-medium tracking-wide uppercase">{label}</div>
              </div>
            ))}
          </div>

          {/* Feature pills */}
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {['Kanban Board', 'JWT Auth', 'Real-time DB', 'Team Roles'].map((tag, i) => (
              <span
                key={tag}
                className="animate-fade-up text-xs bg-white bg-opacity-10 border border-white border-opacity-20 text-indigo-100 px-3 py-1 rounded-full"
                style={{ animationDelay: `${0.55 + i * 0.08}s` }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel — form ─────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center bg-gray-50 p-8">
        <div className="w-full max-w-md animate-fade-up">

          {/* Mobile logo */}
          <div className="lg:hidden text-3xl font-black logo-gradient mb-8 text-center">
            DevTrack
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-gray-500 mb-8">Sign in to your account</p>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm animate-fade-up flex items-center gap-2">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="animate-fade-up" style={{ animationDelay: '0.05s' }}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="alice@example.com"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow focus:shadow-lg focus:shadow-indigo-100"
              />
            </div>

            <div className="animate-fade-up" style={{ animationDelay: '0.10s' }}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow focus:shadow-lg focus:shadow-indigo-100"
              />
            </div>

            <div className="animate-fade-up" style={{ animationDelay: '0.15s' }}>
              <button
                type="submit"
                disabled={loading}
                className="btn-ripple w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-200 active:scale-95"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                    Signing in…
                  </span>
                ) : 'Sign in'}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
