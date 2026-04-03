import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const initials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)

export default function Navbar({ title, showBack = false }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-gray-700 transition-colors mr-1"
            title="Back to dashboard"
          >
            ←
          </button>
        )}
        <h1 className="text-base font-semibold text-gray-800 truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification bell placeholder */}
        <button className="text-gray-400 hover:text-gray-700 transition-colors">
          🔔
        </button>

        {/* User avatar */}
        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold text-white">
          {initials(user?.name)}
        </div>
      </div>
    </header>
  )
}
