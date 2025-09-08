import { useState } from 'react'
import { supportTickets, usersData } from '../data'
import { MoreVertical, Eye, Send } from 'lucide-react'

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-gray-200 p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-base font-semibold text-gray-900">{title}</div>
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Support() {
  const [rows, setRows] = useState(supportTickets)
  const [menuOpen, setMenuOpen] = useState('')
  const [viewOpen, setViewOpen] = useState(false)
  const [replyOpen, setReplyOpen] = useState(false)
  const [current, setCurrent] = useState(null)
  const [reply, setReply] = useState('')
  const total = rows.length
  const resolved = rows.filter((t) => t.status === 'Resolved').length
  const inProgress = rows.filter((t) => t.status === 'In Progress').length
  const open = rows.filter((t) => t.status === 'Open').length
  const [page, setPage] = useState(1)
  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const start = (page - 1) * pageSize
  const pageRows = rows.slice(start, start + pageSize)

  function openView(row) {
    setCurrent(row)
    setViewOpen(true)
  }

  function openReply(row) {
    setCurrent(row)
    setReply('')
    setReplyOpen(true)
  }

  function sendReply() {
    if (!reply) return
    setRows((prev) => prev.map((t) => (t.id === current.id ? { ...t, messages: [...t.messages, { by: 'admin', at: new Date().toISOString().slice(0,16).replace('T',' '), text: reply }], status: 'In Progress', updatedAt: new Date().toISOString().slice(0,16).replace('T',' ') } : t)))
    setReplyOpen(false)
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Support Requests</h2>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 transition-colors hover:bg-green-50 hover:border-green-200">
          <div className="text-xs text-gray-500">Total</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">{total}</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 transition-colors hover:bg-green-50 hover:border-green-200">
          <div className="text-xs text-gray-500">Resolved</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">{resolved}</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 transition-colors hover:bg-green-50 hover:border-green-200">
          <div className="text-xs text-gray-500">In progress</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">{inProgress}</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 transition-colors hover:bg-green-50 hover:border-green-200">
          <div className="text-xs text-gray-500">Open</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">{open}</div>
        </div>
      </div>

      <div className="flex-1 rounded-2xl border border-gray-200 bg-white flex flex-col">
        <div className="overflow-x-auto overflow-y-visible flex-1 min-h-[360px]">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3">Ticket ID</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Last response</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((t) => {
                const user = usersData.find((u) => u.id === t.userId)
                return (
                  <tr key={t.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{t.id}</td>
                    <td className="px-4 py-3 text-gray-800">{user ? `${user.firstName} ${user.lastName}` : t.userId}</td>
                    <td className="px-4 py-3 text-gray-800">{t.subject}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        t.status === 'Resolved' ? 'bg-green-50 text-green-700' : t.status === 'In Progress' ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-800">{t.createdAt}</td>
                    <td className="px-4 py-3 text-gray-800">{t.updatedAt}</td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <button className="ml-auto flex items-center rounded-md border border-gray-200 bg-white p-2 hover:bg-gray-100" onClick={() => setMenuOpen(menuOpen === t.id ? '' : t.id)}>
                          <MoreVertical size={16} />
                        </button>
                        {menuOpen === t.id && (
                          <div className="absolute right-0 z-50 mt-2 w-40 rounded-md border border-gray-200 bg-white shadow-md">
                            <button onClick={() => { setMenuOpen(''); openView(t) }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50">
                              <Eye size={14} /> View
                            </button>
                            <button onClick={() => { setMenuOpen(''); openReply(t) }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50">
                              <Send size={14} /> Reply
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-auto border-t border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="text-xs text-gray-500">Page {page} of {totalPages}</div>
          <div className="inline-flex items-center gap-1">
            <button className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm disabled:opacity-50" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
            {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => {
              const n = i + 1
              return (
                <button key={n} onClick={() => setPage(n)} className={`rounded-md px-2 py-1 text-sm border ${n === page ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white border-gray-200'}`}>{n}</button>
              )
            })}
            <button className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm disabled:opacity-50" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
          </div>
        </div>
      </div>

      {/* View Ticket */}
      <Modal open={viewOpen} onClose={() => setViewOpen(false)} title={`Ticket ${current?.id}`}>
        {current && (
          <div className="space-y-3 text-sm">
            <div className="text-gray-700"><span className="font-medium">Subject:</span> {current.subject}</div>
            <div className="text-gray-700"><span className="font-medium">Status:</span> {current.status}</div>
            <div className="rounded-md border border-gray-200 p-3 bg-gray-50">
              <div className="font-medium text-gray-900 mb-1">Conversation</div>
              <ul className="space-y-2">
                {current.messages.map((m, i) => (
                  <li key={i} className="flex items-start justify-between">
                    <div className="text-gray-800"><span className="uppercase text-xs text-gray-500 mr-2">{m.by}</span>{m.text}</div>
                    <div className="text-xs text-gray-500">{m.at}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>

      {/* Reply */}
      <Modal open={replyOpen} onClose={() => setReplyOpen(false)} title={`Reply to ${current?.id}`}>
        <div className="space-y-4">
          <textarea rows={4} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Write your reply..." value={reply} onChange={(e) => setReply(e.target.value)} />
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setReplyOpen(false)} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={sendReply} className="rounded-md bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600">Send</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Support


