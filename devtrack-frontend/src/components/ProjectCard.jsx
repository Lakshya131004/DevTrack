import { useNavigate } from 'react-router-dom'

const COLORS = [
  { bar: 'bg-indigo-500', glow: 'rgba(99,102,241,0.18)'  },
  { bar: 'bg-pink-500',   glow: 'rgba(236,72,153,0.18)'  },
  { bar: 'bg-teal-500',   glow: 'rgba(20,184,166,0.18)'  },
  { bar: 'bg-orange-500', glow: 'rgba(249,115,22,0.18)'  },
  { bar: 'bg-purple-500', glow: 'rgba(168,85,247,0.18)'  },
  { bar: 'bg-cyan-500',   glow: 'rgba(6,182,212,0.18)'   },
]
const colorFor = (name = '') => COLORS[name.charCodeAt(0) % COLORS.length]

// index prop used for stagger delay
export default function ProjectCard({ project, onDelete, index = 0 }) {
  const navigate    = useNavigate()
  const memberCount = project.members?.length || 0
  const isArchived  = project.status === 'Archived'
  const { bar }     = colorFor(project.name)

  return (
    <div
      className={`project-card animate-fade-up bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${
        isArchived ? 'opacity-60' : ''
      }`}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* Animated colour accent bar */}
      <div className={`h-1.5 w-full ${bar} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 shimmer-bar" />
      </div>

      <div className="p-5">
        {/* Title + status */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2">
            {project.name}
          </h3>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
            isArchived ? 'bg-gray-100 text-gray-500' : 'bg-emerald-100 text-emerald-700'
          }`}>
            {project.status}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
          {project.description || 'No description provided.'}
        </p>

        {/* Members stacked avatars */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex -space-x-2">
            {project.members?.slice(0, 4).map((m, i) => (
              <div
                key={m._id || i}
                title={m.name}
                className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-sm transition-transform hover:scale-110 hover:z-10 hover:-translate-y-0.5"
                style={{ transitionDelay: `${i * 30}ms` }}
              >
                {m.name?.[0]?.toUpperCase() || '?'}
              </div>
            ))}
            {(project.members?.length || 0) > 4 && (
              <div className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-500">
                +{project.members.length - 4}
              </div>
            )}
          </div>
          <span className="text-xs text-gray-400 font-medium">
            {memberCount} member{memberCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Owner */}
        <p className="text-xs text-gray-400 mb-4">
          Owner: <span className="text-gray-600 font-semibold">{project.owner?.name}</span>
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/projects/${project._id}`)}
            className="btn-ripple flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2 rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-200 active:scale-95"
          >
            Open Board
          </button>
          <button
            onClick={() => onDelete(project._id, project.name)}
            className="px-3 py-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-110 active:scale-95 text-sm"
            title="Delete project"
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  )
}
