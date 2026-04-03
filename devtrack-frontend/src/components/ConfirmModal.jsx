/**
 * ConfirmModal — replaces window.confirm() with a clean custom dialog.
 *
 * Usage:
 *   const [confirm, setConfirm] = useState(null)
 *
 *   // Trigger:
 *   setConfirm({ message: 'Delete this task?', onConfirm: () => doDelete() })
 *
 *   // Render:
 *   {confirm && <ConfirmModal {...confirm} onClose={() => setConfirm(null)} />}
 */
export default function ConfirmModal({ message, onConfirm, onClose, danger = true }) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
          danger ? 'bg-red-100' : 'bg-indigo-100'
        }`}>
          <span className="text-2xl">{danger ? '🗑' : '❓'}</span>
        </div>

        {/* Message */}
        <h3 className="text-base font-bold text-gray-900 text-center mb-1">Are you sure?</h3>
        <p className="text-sm text-gray-500 text-center mb-6">{message}</p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm ${
              danger
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {danger ? 'Delete' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}
