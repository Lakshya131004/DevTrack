import { useState } from 'react'
import { tasksAPI } from '../services/api'

const PRIORITY_STYLES = {
  High:   'bg-red-100 text-red-700 border-red-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  Low:    'bg-green-100 text-green-700 border-green-200',
}

const STATUS_STYLES = {
  'To Do':       'bg-slate-100 text-slate-700',
  'In Progress': 'bg-indigo-100 text-indigo-700',
  'Completed':   'bg-green-100 text-green-700',
}

/**
 * TaskDetailModal — opens when a task card is clicked.
 * Shows full details and allows inline editing of all fields.
 */
export default function TaskDetailModal({ task, projectId, onClose, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')

  const [form, setForm] = useState({
    title:       task.title,
    description: task.description || '',
    status:      task.status,
    priority:    task.priority,
    dueDate:     task.dueDate ? task.dueDate.split('T')[0] : '',
  })

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Title cannot be empty.'); return }
    setSaving(true)
    setError('')
    try {
      const updated = await tasksAPI.update(task._id, projectId, {
        ...form,
        dueDate: form.dueDate || null,
      })
      onUpdate(updated)
      setEditing(false)
    } catch (err) {
      setError(err.message || 'Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setForm({
      title:       task.title,
      description: task.description || '',
      status:      task.status,
      priority:    task.priority,
      dueDate:     task.dueDate ? task.dueDate.split('T')[0] : '',
    })
    setEditing(false)
    setError('')
  }

  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'No due date'

  const isPastDue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed'

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${PRIORITY_STYLES[form.priority] || PRIORITY_STYLES.Medium}`}>
              {form.priority} Priority
            </span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[form.status] || STATUS_STYLES['To Do']}`}>
              {form.status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                ✏ Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Title
            </label>
            {editing ? (
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            ) : (
              <p className="text-base font-semibold text-gray-900">{form.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Description
            </label>
            {editing ? (
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Add a description…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            ) : (
              <p className="text-sm text-gray-600 leading-relaxed">
                {form.description || <span className="text-gray-300 italic">No description provided.</span>}
              </p>
            )}
          </div>

          {/* Status + Priority row */}
          {editing && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option>To Do</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Priority
                </label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
            </div>
          )}

          {/* Due date */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Due Date
            </label>
            {editing ? (
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <p className={`text-sm font-medium ${isPastDue ? 'text-red-500' : 'text-gray-700'}`}>
                {isPastDue ? '⚠ Overdue — ' : ''}{formatDate(task.dueDate)}
              </p>
            )}
          </div>

          {/* Metadata */}
          <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Assigned To
              </p>
              {task.assignedTo ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-400 flex items-center justify-center text-xs font-bold text-white">
                    {task.assignedTo.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700">{task.assignedTo.name}</span>
                </div>
              ) : (
                <span className="text-sm text-gray-400 italic">Unassigned</span>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Created By
              </p>
              <span className="text-sm text-gray-700">{task.createdBy?.name || '—'}</span>
            </div>
          </div>
        </div>

        {/* Footer — save/cancel only in edit mode */}
        {editing && (
          <div className="flex gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
            <button
              onClick={handleCancel}
              className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
