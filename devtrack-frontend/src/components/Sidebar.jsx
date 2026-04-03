import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const initials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const navItems = [
    { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { to: '/tasks',     icon: '📋', label: 'All Tasks' },
    { to: '/team',      icon: '👥', label: 'Team'      },
    { to: '/settings',  icon: '⚙️', label: 'Settings'  },
  ]

  return (
    <aside className="w-60 flex-shrink-0 bg-slate-900 text-white flex flex-col h-full">

      {/* ── Logo ─────────────────────────────────────────────── */}
      <div className="px-5 py-5 border-b border-slate-700 animate-fade-up">
        <span className="text-xl font-black tracking-tight">
          Dev<span className="logo-gradient">Track</span>
        </span>
        {/* Animated underline */}
        <div className="mt-1 h-0.5 w-12 rounded-full shimmer-bar opacity-60" />
      </div>

      {/* ── Navigation ───────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-xs text-slate-500 uppercase tracking-widest px-2 mb-3 font-semibold">
          Menu
        </p>

        {navItems.map(({ to, icon, label }, i) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) =>
              `nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
                isActive
                  ? 'bg-indigo-600 text-white nav-active-glow'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white hover:translate-x-1'
              }`
            }
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full opacity-80" />
                )}
                <span className="text-base">{icon}</span>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── User profile + logout ─────────────────────────────── */}
      <div className="px-3 py-4 border-t border-slate-700 animate-fade-up" style={{ animationDelay: '0.35s' }}>
        <div className="flex items-center gap-3 px-2 mb-3">
          {/* Avatar with pulse ring */}
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-sm font-bold shadow-lg">
              {initials(user?.name)}
            </div>
            {/* Online indicator */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-slate-900" />
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
            <div className="text-xs text-slate-400 truncate">{user?.email}</div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn-ripple w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-red-600 hover:text-white transition-all active:scale-95"
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  )
}
