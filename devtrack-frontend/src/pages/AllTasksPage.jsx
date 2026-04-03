import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import { projectsAPI, tasksAPI } from '../services/api'

const PRIORITY_STYLES = {
  High:   { badge: 'bg-red-100 text-red-700',    border: 'border-l-red-400'    },
  Medium: { badge: 'bg-amber-100 text-amber-700', border: 'border-l-amber-400'  },
  Low:    { badge: 'bg-green-100 text-green-700', border: 'border-l-green-400'  },
}

const STATUS_STYLES = {
  'To Do':       'bg-slate-100 text-slate-600',
  'In Progress': 'bg-indigo-100 text-indigo-700',
  'Completed':   'bg-green-100 text-green-700',
}

const STATUS_DOT = {
  'To Do':       'bg-slate-400',
  'In Progress': 'bg-indigo-500 animate-pulse',
  'Completed':   'bg-green-500',
}

export default function AllTasksPage() {
  const [allTasks,       setAllTasks]       = useState([])
  const [projectMap,     setProjectMap]     = useState({}) // id → name
  const [loading,        setLoading]        = useState(true)
  const [statusFilter,   setStatusFilter]   = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [search,         setSearch]         = useState('')

  useEffect(() => {
    const load = async () => {
      // Fetch all projects first, then all their tasks in parallel
      const projects = await projectsAPI.getAll()
      const map = {}
      projects.forEach((p) => { map[p._id] = p.name })
      setProjectMap(map)

      const taskArrays = await Promise.all(
        projects.map((p) => tasksAPI.getByProject(p._id))
      )
      setAllTasks(taskArrays.flat())
      setLoading(false)
    }
    load()
  }, [])

  // Apply all filters
  const filtered = allTasks
    .filter((t) => statusFilter   === 'All' || t.status   === statusFilter)
    .filter((t) => priorityFilter === 'All' || t.priority === priorityFilter)
    .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))

  const counts = {
    total:      allTasks.length,
    todo:       allTasks.filter((t) => t.status === 'To Do').length,
    inProgress: allTasks.filter((t) => t.status === 'In Progress').length,
    completed:  allTasks.filter((t) => t.status === 'Completed').length,
  }

  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'

  const isPastDue = (task) =>
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed'

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="All Tasks" />

        <main className="flex-1 overflow-y-auto p-6">

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Tasks',  value: counts.total,      bg: 'bg-indigo-50',  color: 'text-indigo-600' },
              { label: 'To Do',        value: counts.todo,       bg: 'bg-slate-100',  color: 'text-slate-600'  },
              { label: 'In Progress',  value: counts.inProgress, bg: 'bg-amber-50',   color: 'text-amber-600'  },
              { label: 'Completed',    value: counts.completed,  bg: 'bg-green-50',   color: 'text-green-600'  },
            ].map(({ label, value, bg, color }, i) => (
              <div
                key={label}
                className={`${bg} rounded-xl px-4 py-4 animate-fade-up`}
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap gap-3 mb-5 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            {/* Search */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks…"
                className="pl-8 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white w-48"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">✕</button>
              )}
            </div>

            {/* Status filter */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {['All', 'To Do', 'In Progress', 'Completed'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    statusFilter === s ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Priority filter */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {['All', 'High', 'Medium', 'Low'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    priorityFilter === p ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <span className="ml-auto text-sm text-gray-400 self-center">
              {filtered.length} task{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Task table */}
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map((n) => (
                <div key={n} className="skeleton bg-white rounded-xl h-16 border border-gray-100" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center animate-fade-up">
              <div className="text-4xl mb-3">🎉</div>
              <p className="text-gray-500 font-medium">No tasks match your filters.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((task, i) => {
                const styles = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Medium
                const overdue = isPastDue(task)
                return (
                  <div
                    key={task._id}
                    className={`animate-fade-up bg-white rounded-xl border border-gray-100 border-l-4 ${styles.border} px-4 py-3.5 flex items-center gap-4 hover:shadow-md transition-shadow`}
                    style={{ animationDelay: `${0.05 + i * 0.04}s` }}
                  >
                    {/* Status dot */}
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[task.status]}`} />

                    {/* Title */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{task.title}</p>
                      <p className="text-xs text-indigo-400 font-medium mt-0.5 truncate">
                        📁 {projectMap[task.project] || 'Unknown project'}
                      </p>
                    </div>

                    {/* Priority badge */}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${styles.badge}`}>
                      {task.priority}
                    </span>

                    {/* Status badge */}
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0 ${STATUS_STYLES[task.status]}`}>
                      {task.status}
                    </span>

                    {/* Assigned to */}
                    <div className="flex items-center gap-1.5 flex-shrink-0 w-28">
                      {task.assignedTo ? (
                        <>
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-xs font-bold text-white">
                            {task.assignedTo.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="text-xs text-gray-500 truncate">{task.assignedTo.name}</span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-300 italic">Unassigned</span>
                      )}
                    </div>

                    {/* Due date */}
                    <span className={`text-xs font-medium flex-shrink-0 w-20 text-right ${overdue ? 'text-red-500' : 'text-gray-400'}`}>
                      {overdue ? '⚠ ' : ''}{formatDate(task.dueDate)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
