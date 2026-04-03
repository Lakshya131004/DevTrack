// Task card — supports drag-and-drop + click to open detail modal
// Each card has a priority-coloured left border and a glow on hover

const PRIORITY_STYLES = {
  High:   { badge: 'bg-red-100 text-red-700',    card: 'priority-high'   },
  Medium: { badge: 'bg-amber-100 text-amber-700', card: 'priority-medium' },
  Low:    { badge: 'bg-green-100 text-green-700', card: 'priority-low'    },
}

const STATUS_DOT = {
  'To Do':       'bg-slate-400',
  'In Progress': 'bg-indigo-500 animate-pulse',
  'Completed':   'bg-green-500',
}

export default function TaskCard({ task, onDelete, onClick }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('taskId',     task._id)
    e.dataTransfer.setData('fromStatus', task.status)
    e.dataTransfer.effectAllowed = 'move'
  }

  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null

  const isPastDue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed'

  const styles = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Medium

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onClick(task)}
      className={`task-card task-enter bg-white rounded-xl shadow-sm border border-gray-100 p-3.5 cursor-pointer group ${styles.card}`}
    >
      {/* Top row — priority badge + status dot + delete */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles.badge}`}>
            {task.priority}
          </span>
          {/* Animated status dot */}
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[task.status] || STATUS_DOT['To Do']}`} />
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(task._id, task.title) }}
          className="text-gray-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:scale-125 text-sm leading-none"
          title="Delete task"
        >
          ✕
        </button>
      </div>

      {/* Title */}
      <p className="text-sm font-bold text-gray-800 mb-1 leading-snug group-hover:text-indigo-700 transition-colors">
        {task.title}
      </p>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-gray-400 line-clamp-2 mb-2 leading-relaxed">{task.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-50">
        {task.assignedTo ? (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              {task.assignedTo.name?.[0]?.toUpperCase() || '?'}
            </div>
            <span className="text-xs text-gray-500 truncate max-w-[80px]">
              {task.assignedTo.name}
            </span>
          </div>
        ) : (
          <span className="text-xs text-gray-300 italic">Unassigned</span>
        )}

        {task.dueDate && (
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${
            isPastDue
              ? 'bg-red-50 text-red-500'
              : 'bg-gray-50 text-gray-400'
          }`}>
            {isPastDue ? '⚠ ' : '📅 '}{formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </div>
  )
}
