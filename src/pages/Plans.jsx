import { useEffect, useMemo, useState } from 'react'
import { MoreVertical, Pencil, Eye, Trash2, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { adminService } from '../lib/api'
import { showToast } from '../lib/toast'
import Pagination from '../components/Pagination'

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

const initialPlans = []

function Plans() {
  const navigate = useNavigate()
  const [plans, setPlans] = useState(initialPlans)
  const [menuOpenId, setMenuOpenId] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [page, setPage] = useState(1)
  const pageSize = 6
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const pageRows = plans

  const currency = useMemo(() => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }), [])

  function openCreate() {
    setEditing({ id: '', name: '', description: '', price: 0, interval: 'month', currency: 'USD', productType: 'service', recurring: true, matchingCount: 0, isActive: true })
    setEditOpen(true)
  }

  function openEdit(plan) {
    setEditing({ ...plan })
    setEditOpen(true)
  }

  async function savePlan() {
    if (!editing.name) {
      showToast('Please enter a plan name', 'error')
      return
    }
    if (!editing.price || editing.price <= 0) {
      showToast('Please enter a valid price', 'error')
      return
    }
    
    setSaving(true)
    try {
      if (editing.id) {
        await adminService.updatePlan(editing.id, {
          name: editing.name,
          description: editing.description,
          price: Number(editing.price),
          interval: editing.interval,
          currency: editing.currency,
          productType: editing.productType,
          recurring: !!editing.recurring,
          matchingCount: Number(editing.matchingCount),
          isActive: !!editing.isActive,
        })
        showToast('Plan updated successfully')
      } else {
        await adminService.createPlan({
          name: editing.name,
          description: editing.description,
          price: Number(editing.price),
          interval: editing.interval,
          currency: editing.currency,
          productType: editing.productType,
          recurring: !!editing.recurring,
          matchingCount: Number(editing.matchingCount),
          isActive: !!editing.isActive,
        })
        showToast('Plan created successfully')
      }
      setEditOpen(false)
      loadPlans()
    } catch (err) {
      showToast(err.message || 'Failed to save plan', 'error')
    } finally {
      setSaving(false)
    }
  }

  function confirmDelete(plan) {
    setEditing(plan)
    setDeleteOpen(true)
  }

  async function doDelete() {
    setDeleting(true)
    try { 
      await adminService.deletePlan(editing.id)
      showToast('Plan deleted successfully')
      setDeleteOpen(false)
      loadPlans()
    } catch (err) { 
      showToast(err.message || 'Failed to delete plan', 'error') 
    } finally {
      setDeleting(false)
    }
  }

  async function loadPlans() {
    setLoading(true)
    try {
      const params = { page, limit: pageSize }
      if (search) params.search = search
      if (activeFilter !== '') params.isActive = activeFilter === 'true'
      const res = await adminService.listPlans(params)
      setPlans(res?.plans || [])
      setTotalPages(res?.pagination?.totalPages || 1)
    } catch (_) {
      showToast('Failed to load plans', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPlans() }, [page, activeFilter])

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Plans</h2>
        <div className="flex items-center gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key==='Enter' && (setPage(1), loadPlans())} placeholder="Search" className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
          <select value={activeFilter} onChange={(e) => { setPage(1); setActiveFilter(e.target.value) }} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600">
            <Plus size={16} /> New plan
          </button>
        </div>
      </div>

      <div className="flex-1 rounded-2xl border border-gray-200 bg-white flex flex-col">
        <div className="overflow-x-auto overflow-y-visible flex-1 min-h-[360px]">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Interval</th>
                <th className="px-4 py-3">Currency</th>
                <th className="px-4 py-3">Matchings</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((plan) => (
                <tr key={plan.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{plan.name}</td>
                  {/* <td className="px-4 py-3 text-gray-800">{currency.format(Number(plan.price))}</td> */}
                   <td className="px-4 py-3 text-gray-800">{plan.price}</td>
                  <td className="px-4 py-3 text-gray-800">{plan.interval}</td>
                  <td className="px-4 py-3 text-gray-800 uppercase">{plan.currency}</td>
                  <td className="px-4 py-3 text-gray-800">{plan.matchingCount}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${plan.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{plan.isActive ? 'Active' : 'Inactive'}</span>
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

        <Pagination page={page} totalPages={totalPages} onChange={(n) => setPage(n)} />
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={editing?.id ? 'Edit plan' : 'Create plan'}>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-700">Name</label>
            <input value={editing?.name || ''} onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-700">Description</label>
            <textarea rows={3} value={editing?.description || ''} onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-gray-700">Price</label>
              <input type="number" step="0.01" value={editing?.price ?? 0} onChange={(e) => setEditing((p) => ({ ...p, price: parseFloat(e.target.value) }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-700">Interval</label>
              <select value={editing?.interval || 'month'} onChange={(e) => setEditing((p) => ({ ...p, interval: e.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="month">month</option>
                <option value="year">year</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-gray-700">Currency</label>
              <select value={editing?.currency || 'USD'} onChange={(e) => setEditing((p) => ({ ...p, currency: e.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="USD">USD</option>
                <option value="CHF">CHF</option>
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-700">Product type</label>
              <select value={editing?.productType || 'service'} onChange={(e) => setEditing((p) => ({ ...p, productType: e.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="service">service</option>
                <option value="digital">digital</option>
                <option value="other">other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-700">Recurring</label>
            <select value={editing?.recurring ? 'true' : 'false'} onChange={(e) => setEditing((p) => ({ ...p, recurring: e.target.value === 'true' }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-gray-700">Active</label>
              <select value={editing?.isActive ? 'true' : 'false'} onChange={(e) => setEditing((p) => ({ ...p, isActive: e.target.value === 'true' }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-700">Matching count</label>
              <input value={editing?.matchingCount ?? 0} onChange={(e) => setEditing((p) => ({ ...p, matchingCount: parseInt(e.target.value) || 0 }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setEditOpen(false)} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50">Cancel</button>
            <button 
              onClick={savePlan} 
              disabled={saving}
              className="rounded-md bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete plan">
        <div className="space-y-4">
          <p className="text-sm text-gray-700">Are you sure you want to delete <span className="font-medium">{editing?.name}</span>? This action cannot be undone.</p>
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setDeleteOpen(false)} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50">Cancel</button>
            <button 
              onClick={doDelete} 
              disabled={deleting}
              className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Plans


