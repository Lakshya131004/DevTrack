import { useState, useEffect, useRef } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import ProjectCard from '../components/ProjectCard'
import AddProjectModal from '../components/AddProjectModal'
import ConfirmModal from '../components/ConfirmModal'
import { projectsAPI } from '../services/api'
import { useToast } from '../context/ToastContext'

// Animates a number from 0 → target over ~700ms
function useCountUp(target) {
  const [count, setCount] = useState(0)
  const raf = useRef(null)
  useEffect(() => {
    if (target === 0) { setCount(0); return }
    const start = performance.now()
    const duration = 700
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [target])
  return count
}

export default function DashboardPage() {
  const { addToast } = useToast()

  const [projects,     setProjects]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [showModal,    setShowModal]    = useState(false)
  const [filterStatus, setFilterStatus] = useState('All')
  const [search,       setSearch]       = useState('')
  const [confirm,      setConfirm]      = useState(null)

  const totalCount    = useCountUp(projects.length)
  const activeCount_  = useCountUp(projects.filter(p => p.status === 'Active').length)
  const archivedCount_= useCountUp(projects.filter(p => p.status === 'Archived').length)

  useEffect(() => {
    projectsAPI.getAll()
      .then((data) => { setProjects(data); setLoading(false) })
      .catch(() => { addToast('Failed to load projects.', 'error'); setLoading(false) })
  }, [])

  const handleAddProject = async (formData) => {
    try {
      const newProject = await projectsAPI.create(formData)
      setProjects((prev) => [newProject, ...prev])
      setShowModal(false)
      addToast(`"${newProject.name}" created successfully!`, 'success')
    } catch (err) {
      addToast(err.message || 'Failed to create project.', 'error')
    }
  }

  const handleDeleteProject = (id, name) => {
    setConfirm({
      message: `"${name}" and all its data will be permanently deleted.`,
      onConfirm: async () => {
        try {
          await projectsAPI.delete(id)
          setProjects((prev) => prev.filter((p) => p._id !== id))
          addToast('Project deleted.', 'info')
        } catch (err) {
          addToast(err.message || 'Failed to delete project.', 'error')
        }
      },
    })
  }

  // Apply status filter + live search
  const filtered = projects
    .filter((p) => filterStatus === 'All' || p.status === filterStatus)
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Dashboard" />

        <main className="flex-1 overflow-y-auto p-6">

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total Projects', value: totalCount,     color: 'text-indigo-600', bg: 'bg-indigo-50',  delay: '0s'    },
              { label: 'Active',         value: activeCount_,   color: 'text-green-600',  bg: 'bg-green-50',   delay: '0.08s' },
              { label: 'Archived',       value: archivedCount_, color: 'text-gray-500',   bg: 'bg-gray-100',   delay: '0.16s' },
            ].map(({ label, value, color, bg, delay }) => (
              <div key={label} className={`${bg} rounded-xl px-5 py-4 animate-fade-up`} style={{ animationDelay: delay }}>
                <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
                <p className={`text-2xl font-bold ${color} stat-pop`} style={{ animationDelay: delay }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h1 className="text-xl font-bold text-gray-900">My Projects</h1>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm"
            >
              <span className="text-lg leading-none">+</span> New Project
            </button>
          </div>

          {/* Search + filter row */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Live search */}
            <div className="relative flex-1 max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects…"
                className="w-full pl-8 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status filter tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {['All', 'Active', 'Archived'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    filterStatus === s
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Project grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1,2,3].map((n) => (
                <div key={n} className="bg-white rounded-xl h-52 animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-5xl mb-4">{search ? '🔍' : '📋'}</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">
                {search ? `No results for "${search}"` : 'No projects yet'}
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                {search ? 'Try a different search term.' : 'Create your first project to get started.'}
              </p>
              {!search && (
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
                >
                  + New Project
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((project, i) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  onDelete={handleDeleteProject}
                  index={i}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {showModal && (
        <AddProjectModal
          onClose={() => setShowModal(false)}
          onSubmit={handleAddProject}
        />
      )}

      {confirm && (
        <ConfirmModal
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
