import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate      = useNavigate()

  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.password || !form.confirm) { setError('Please fill in all fields.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — animated branding ─────────────────── */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-violet-700 via-indigo-600 to-indigo-700 flex-col justify-center items-center text-white p-12 relative overflow-hidden">

        {/* Floating orbs */}
        <div className="orb-2 absolute top-10  right-16 w-56 h-56 rounded-full bg-violet-300 opacity-10 pointer-events-none" />
        <div className="orb-1 absolute bottom-16 left-10 w-72 h-72 rounded-full bg-indigo-400 opacity-10 pointer-events-none" />
        <div className="orb-3 absolute top-1/2 right-1/4 w-28 h-28 rounded-full bg-white opacity-5 pointer-events-none" />
        <div className="orb-2 absolute top-1/3 left-1/4 w-16 h-16 rounded-full bg-white opacity-5 pointer-events-none" />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center">
          <div className="mb-3 text-6xl font-black tracking-tight logo-gradient">
            DevTrack
          </div>
          <p className="text-indigo-200 text-lg mb-12 max-w-xs mx-auto leading-relaxed">
            Join teams who ship projects faster with DevTrack.
          </p>

          {/* Animated feature list */}
          <div className="space-y-4 text-left max-w-xs mx-auto">
            {[
              { icon: '📋', text: 'Visual Kanban board',             delay: '0.2s'  },
              { icon: '🎯', text: 'Task assignments & priorities',    delay: '0.32s' },
              { icon: '👥', text: 'Real-time team collaboration',     delay: '0.44s' },
              { icon: '🔒', text: 'Secure JWT authentication',        delay: '0.56s' },
            ].map(({ icon, text, delay }) => (
              <div
                key={text}
                className="animate-fade-up flex items-center gap-3 bg-white bg-opacity-10 border border-white border-opacity-15 rounded-xl px-4 py-3"
                style={{ animationDelay: delay }}
              >
                <span className="text-xl">{icon}</span>
                <span className="text-sm text-indigo-100 font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel — form ─────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center bg-gray-50 p-8">
        <div className="w-full max-w-md animate-fade-up">

          <div className="lg:hidden text-3xl font-black logo-gradient mb-8 text-center">
            DevTrack
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Create an account</h2>
          <p className="text-gray-500 mb-8">Start tracking your projects today</p>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm animate-fade-up flex items-center gap-2">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Full name',        name: 'name',     type: 'text',     placeholder: 'Alice Johnson',        delay: '0.05s' },
              { label: 'Email address',    name: 'email',    type: 'email',    placeholder: 'alice@example.com',    delay: '0.10s' },
              { label: 'Password',         name: 'password', type: 'password', placeholder: 'Min. 6 characters',    delay: '0.15s' },
              { label: 'Confirm password', name: 'confirm',  type: 'password', placeholder: '••••••••',             delay: '0.20s' },
            ].map(({ label, name, type, placeholder, delay }) => (
              <div key={name} className="animate-fade-up" style={{ animationDelay: delay }}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow focus:shadow-lg focus:shadow-indigo-100"
                />
              </div>
            ))}

            <div className="animate-fade-up" style={{ animationDelay: '0.25s' }}>
              <button
                type="submit"
                disabled={loading}
                className="btn-ripple w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-200 active:scale-95"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                    Creating account…
                  </span>
                ) : 'Create account'}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
