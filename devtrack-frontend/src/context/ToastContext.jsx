import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

// Individual Toast component
function Toast({ toast, onClose }) {
  const STYLES = {
    success: 'bg-emerald-500',
    error:   'bg-red-500',
    info:    'bg-indigo-500',
    warning: 'bg-amber-500',
  }
  const ICONS = {
    success: '✓',
    error:   '✕',
    info:    'ℹ',
    warning: '⚠',
  }

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium min-w-[260px] max-w-sm toast-enter ${STYLES[toast.type] || STYLES.info}`}>
      <span className="w-5 h-5 rounded-full bg-white bg-opacity-25 flex items-center justify-center text-xs font-bold flex-shrink-0">
        {ICONS[toast.type] || ICONS.info}
      </span>
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={onClose}
        className="text-white text-opacity-70 hover:text-opacity-100 transition-opacity ml-1 text-lg leading-none"
      >
        ×
      </button>
    </div>
  )
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    // Auto-remove after 3.5s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  const removeToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast stack — bottom-right corner */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onClose={() => removeToast(toast.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// Custom hook — use this in any component
export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
