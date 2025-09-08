import { useMemo, useState } from 'react'
import { MoreVertical, Pencil, Eye, Trash2, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { plansData } from '../data'

function Modal({ open, onClose, children, title }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl border border-gray-200 p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-base font-semibold text-gray-900">{title}</div>
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
        </div>
        {children}
      </div>
    </div>
  )
}

const initialPlans = plansData

function Plans() {
  const navigate = useNavigate()
  const [plans, setPlans] = useState(initialPlans)
  const [menuOpenId, setMenuOpenId] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [page, setPage] = useState(1)
  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(plans.length / pageSize))
  const start = (page - 1) * pageSize
  const pageRows = plans.slice(start, start + pageSize)

  const currency = useMemo(() => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }), [])

  function openCreate() {
    setEditing({ id: '', name: '', price: 0, currency: 'USD', billing: 'Monthly', features: [], status: 'Active' })
    setEditOpen(true)
  }

  function openEdit(plan) {
    setEditing({ ...plan })
    setEditOpen(true)
  }

  function savePlan() {
    if (!editing.name) return
    setPlans((prev) => {
      const exists = prev.some((p) => p.id === editing.id && editing.id)
      if (exists) {
        return prev.map((p) => (p.id === editing.id ? { ...editing } : p))
      }
      const id = editing.name.toLowerCase().replace(/\s+/g, '-')
      return [...prev, { ...editing, id }]
    })
    setEditOpen(false)
  }

  function confirmDelete(plan) {
    setEditing(plan)
    setDeleteOpen(true)
  }

  function doDelete() {
    setPlans((prev) => prev.filter((p) => p.id !== editing.id))
    setDeleteOpen(false)
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Plans</h2>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600">
          <Plus size={16} /> New plan
        </button>
      </div>

      <div className="flex-1 rounded-2xl border border-gray-200 bg-white flex flex-col">
        <div className="overflow-x-auto overflow-y-visible flex-1 min-h-[360px]">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Billing</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Features</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((plan) => (
                <tr key={plan.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{plan.name}</td>
                  <td className="px-4 py-3 text-gray-800">{currency.format(plan.price)} {plan.currency}</td>
                  <td className="px-4 py-3 text-gray-800">{plan.billing}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      plan.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {plan.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    <div className="line-clamp-1">{plan.features.join(', ') || '-'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <button
                        className="ml-auto flex items-center rounded-md border border-gray-200 bg-white p-2 hover:bg-gray-100"
                        onClick={() => setMenuOpenId(menuOpenId === plan.id ? '' : plan.id)}
                      >
                        <MoreVertical size={16} />
                      </button>
                      {menuOpenId === plan.id && (
                        <div className="absolute right-0 z-50 mt-2 w-36 rounded-md border border-gray-200 bg-white shadow-md">
                          <button onClick={() => { setMenuOpenId(''); navigate(`/plans/${plan.id}`) }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50">
                            <Eye size={14} /> View
                          </button>
                          <button onClick={() => { setMenuOpenId(''); openEdit(plan) }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50">
                            <Pencil size={14} /> Edit
                          </button>
                          <button onClick={() => { setMenuOpenId(''); confirmDelete(plan) }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-auto border-t border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="text-xs text-gray-500">Page {page} of {totalPages}</div>
          <div className="inline-flex items-center gap-1">
            <button
              className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm disabled:opacity-50"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => {
              const n = i + 1
              return (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`rounded-md px-2 py-1 text-sm border ${n === page ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white border-gray-200'}`}
                >
                  {n}
                </button>
              )
            })}
            <button
              className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm disabled:opacity-50"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={editing?.id ? 'Edit plan' : 'Create plan'}>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-700">Name</label>
            <input value={editing?.name || ''} onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-gray-700">Price</label>
              <input type="number" step="0.01" value={editing?.price ?? 0} onChange={(e) => setEditing((p) => ({ ...p, price: parseFloat(e.target.value) }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-700">Billing</label>
              <select value={editing?.billing || 'Monthly'} onChange={(e) => setEditing((p) => ({ ...p, billing: e.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option>Monthly</option>
                <option>Yearly</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-700">Status</label>
            <select value={editing?.status || 'Active'} onChange={(e) => setEditing((p) => ({ ...p, status: e.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option>Active</option>
              <option>Draft</option>
              <option>Archived</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-700">Features (comma separated)</label>
            <input value={(editing?.features || []).join(', ')} onChange={(e) => setEditing((p) => ({ ...p, features: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setEditOpen(false)} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={savePlan} className="rounded-md bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600">Save</button>
          </div>
        </div>
      </Modal>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete plan">
        <div className="space-y-4">
          <p className="text-sm text-gray-700">Are you sure you want to delete <span className="font-medium">{editing?.name}</span>? This action cannot be undone.</p>
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setDeleteOpen(false)} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={doDelete} className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Plans


