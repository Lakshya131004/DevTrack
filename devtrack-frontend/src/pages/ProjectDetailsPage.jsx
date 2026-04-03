import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import KanbanBoard from '../components/KanbanBoard'
import AddTaskModal from '../components/AddTaskModal'
import ConfirmModal from '../components/ConfirmModal'
import { projectsAPI, tasksAPI } from '../services/api'
import { useToast } from '../context/ToastContext'

export default function ProjectDetailsPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const { addToast } = useToast()

  const [project,        setProject]        = useState(null)
  const [tasks,          setTasks]          = useState([])
  const [loading,        setLoading]        = useState(true)
  const [showModal,      setShowModal]      = useState(false)
  const [confirm,        setConfirm]        = useState(null)
  const [priorityFilter, setPriorityFilter] = useState('All')

  useEffect(() => {
    const load = async () => {
      try {
        const [allProjects, projectTasks] = await Promise.all([
          projectsAPI.getAll(),
          tasksAPI.getByProject(id),
        ])
        const found = allProjects.find((p) => p._id === id)
        if (!found) { navigate('/dashboard'); return }
        setProject(found)
        setTasks(projectTasks)
      } catch {
        addToast('Failed to load project.', 'error')
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, navigate])

  const handleAddTask = async (formData) => {
    try {
      const newTask = await tasksAPI.create({ ...formData, projectId: id })
      setTasks((prev) => [newTask, ...prev])
      setShowModal(false)
      addToast(`Task "${newTask.title}" added!`, 'success')
    } catch (err) {
      addToast(err.message || 'Failed to add task.', 'error')
    }
  }

  const handleMoveTask = async (taskId, newStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    )
    try {
      await tasksAPI.update(taskId, id, { status: newStatus })
      addToast(`Moved to "${newStatus}"`, 'success')
    } catch {
      addToast('Failed to update task status.', 'error')
    }
  }

  // Called by TaskDetailModal when a task is saved in-place
  const handleUpdateTask = (updated) => {
    setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)))
    addToast('Task updated!', 'success')
  }

  const handleDeleteTask = (taskId, taskTitle) => {
    setConfirm({
      message: `"${taskTitle}" will be permanently deleted.`,
      onConfirm: async () => {
        try {
          setTasks((prev) => prev.filter((t) => t._id !== taskId))
          await tasksAPI.delete(taskId, id)
          addToast('Task deleted.', 'info')
        } catch {
          addToast('Failed to delete task.', 'error')
        }
      },
    })
  }

  const total     = tasks.length
  const completed = tasks.filter((t) => t.status === 'Completed').length
  const progress  = total > 0 ? Math.round((completed / total) * 100) : 0

  const counts = {
    'To Do':       tasks.filter((t) => t.status === 'To Do').length,
    'In Progress': tasks.filter((t) => t.status === 'In Progress').length,
    'Completed':   completed,
  }

  // Apply priority filter before passing to board
  const visibleTasks = priorityFilter === 'All'
    ? tasks
    : tasks.filter((t) => t.priority === priorityFilter)

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading project…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title={project.name} showBack />

        <main className="flex-1 overflow-hidden flex flex-col p-6">

          {/* Project header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  project.status === 'Active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {project.status}
                </span>
              </div>

              {project.description && (
                <p className="text-gray-500 text-sm mb-2">{project.description}</p>
              )}

              {/* Task count badges */}
              <div className="flex gap-3 mb-3">
                {Object.entries(counts).map(([status, count]) => (
                  <span key={status} className="text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">{count}</span> {status}
                  </span>
                ))}
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-3 max-w-xs">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-indigo-600 whitespace-nowrap">
                  {progress}% done
                </span>
              </div>
            </div>

            {/* Right — priority filter + add task */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Priority filter */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                {['All', 'High', 'Medium', 'Low'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriorityFilter(p)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      priorityFilter === p
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm whitespace-nowrap"
              >
                <span className="text-lg leading-none">+</span> Add Task
              </button>
            </div>
          </div>

          {/* Kanban board */}
          <div className="flex-1 overflow-hidden">
            <KanbanBoard
              tasks={visibleTasks}
              onMoveTask={handleMoveTask}
              onDeleteTask={handleDeleteTask}
              onUpdateTask={handleUpdateTask}
              projectId={id}
            />
          </div>
        </main>
      </div>

      {showModal && (
        <AddTaskModal
          onClose={() => setShowModal(false)}
          onSubmit={handleAddTask}
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
