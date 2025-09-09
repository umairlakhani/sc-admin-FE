import { useEffect, useState } from 'react'

function Toast({ toast, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className={`rounded-md px-3 py-2 shadow border text-sm ${toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
      {toast.message}
    </div>
  )
}

export default function ToastHost() {
  const [toasts, setToasts] = useState([])
  useEffect(() => {
    function onToast(e) {
      setToasts((prev) => [...prev, e.detail])
    }
    window.addEventListener('app:toast', onToast)
    return () => window.removeEventListener('app:toast', onToast)
  }, [])
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onClose={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} />
      ))}
    </div>
  )
}


