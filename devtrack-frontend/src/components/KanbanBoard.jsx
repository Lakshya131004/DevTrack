import { useState } from 'react'
import TaskCard from './TaskCard'
import TaskDetailModal from './TaskDetailModal'

const COLUMNS = [
  { status: 'To Do',       label: 'To Do',      headerColor: 'bg-slate-500',  dotColor: 'bg-slate-400'  },
  { status: 'In Progress', label: 'In Progress', headerColor: 'bg-indigo-600', dotColor: 'bg-indigo-500' },
  { status: 'Completed',   label: 'Completed',   headerColor: 'bg-green-600',  dotColor: 'bg-green-500'  },
]

export default function KanbanBoard({ tasks, onMoveTask, onDeleteTask, onUpdateTask, projectId }) {
  const [dragOverCol,  setDragOverCol]  = useState(null)
  const [selectedTask, setSelectedTask] = useState(null) // task opened in detail modal

  // ── Drop handlers ──────────────────────────────────────────────────────────
  const handleDragOver = (e, status) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverCol(status)
  }

  const handleDragLeave = () => setDragOverCol(null)

  const handleDrop = (e, toStatus) => {
    e.preventDefault()
    setDragOverCol(null)
    const taskId     = e.dataTransfer.getData('taskId')
    const fromStatus = e.dataTransfer.getData('fromStatus')
    if (taskId && fromStatus !== toStatus) {
      onMoveTask(taskId, toStatus)
    }
  }

  // When a task is saved in the detail modal, sync it back into the board
  const handleTaskUpdated = (updated) => {
    onUpdateTask(updated)
    // If status changed, the updated task already has the new status —
    // the parent re-renders and it drops into the correct column automatically
    setSelectedTask(updated)
  }

  return (
    <>
      <div className="flex gap-5 h-full overflow-x-auto pb-4">
        {COLUMNS.map(({ status, label, headerColor, dotColor }) => {
          const columnTasks = tasks.filter((t) => t.status === status)
          const isOver      = dragOverCol === status

          return (
            <div
              key={status}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}
              className={`flex flex-col flex-shrink-0 w-72 rounded-xl transition-all ${
                isOver ? 'ring-2 ring-indigo-400 bg-indigo-50' : 'bg-gray-100'
              }`}
            >
              {/* Column header */}
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                  <span className="text-sm font-semibold text-gray-700">{label}</span>
                </div>
                <span className={`text-xs font-bold text-white px-2 py-0.5 rounded-full ${headerColor}`}>
                  {columnTasks.length}
                </span>
              </div>

              {/* Task list — scrollable */}
              <div className="flex-1 overflow-y-auto kanban-scroll px-3 pb-3 space-y-2.5 min-h-[200px]">
                {columnTasks.length === 0 ? (
                  <div className={`h-20 flex items-center justify-center rounded-lg border-2 border-dashed text-xs text-gray-400 ${
                    isOver ? 'border-indigo-400 text-indigo-400' : 'border-gray-200'
                  }`}>
                    {isOver ? 'Drop here' : 'No tasks'}
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onDelete={onDeleteTask}
                      onClick={setSelectedTask}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Task detail / edit modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          projectId={projectId}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdated}
        />
      )}
    </>
  )
}
