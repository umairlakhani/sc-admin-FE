import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { adminService } from '../lib/api'
import { showToast } from '../lib/toast'

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-200 p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-base font-semibold text-gray-900">{title}</div>
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function PlanView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [plan, setPlan] = useState(null)
  const [providers, setProviders] = useState([])
  const [err, setErr] = useState('')
  const [toggleOpen, setToggleOpen] = useState(false)
  const [provOpen, setProvOpen] = useState(false)
  const [provEdit, setProvEdit] = useState(null)
  const [provDeleteOpen, setProvDeleteOpen] = useState(false)
  const [loadingProv, setLoadingProv] = useState(false)
  const currency = useMemo(() => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }), [])

  useEffect(() => {
    let mounted = true
    adminService.getPlan(id)
      .then((data) => { if (mounted) setPlan(data) })
      .catch((e) => { setErr(e.message); showToast('Failed to load plan', 'error') })
    adminService.listProviders(id)
      .then((data) => { if (mounted) setProviders(data || []) })
      .catch(() => {})
    return () => { mounted = false }
  }, [id])

  async function refreshProviders() {
    try {
      const data = await adminService.listProviders(id)
      setProviders(data || [])
    } catch (_) {}
  }

  if (!plan) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Plan not found</h2>
        <button onClick={() => navigate('/plans')} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50">Back to plans</button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">{plan.name}</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setToggleOpen(true)} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50">Update status</button>
          <button onClick={() => navigate('/plans')} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50">Back</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="text-sm text-gray-500">Price</div>
          <div className="mt-1 text-xl font-semibold text-gray-900">{currency.format(Number(plan.price))} {plan.currency?.toUpperCase()}</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="text-sm text-gray-500">Interval</div>
          <div className="mt-1 text-xl font-semibold text-gray-900">{plan.interval}</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="text-sm text-gray-500">Status</div>
          <div className="mt-1">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${plan.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
              {plan.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="text-base font-semibold text-gray-900 mb-2 flex items-center justify-between">
          <span>Providers</span>
          <button onClick={() => { setProvEdit({ paymentGateway: 'Stripe', productId: '', planId: '', metadata: {} }); setProvOpen(true) }} className="rounded-md bg-green-500 px-3 py-1.5 text-white text-sm hover:bg-green-600">Add provider</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="px-4 py-2">Gateway</th>
                <th className="px-4 py-2">Product ID</th>
                <th className="px-4 py-2">Plan ID</th>
                <th className="px-4 py-2">Updated</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(plan.SubscriptionProviders || providers || []).map((p) => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="px-4 py-2 font-medium text-gray-900">{p.paymentGateway}</td>
                  <td className="px-4 py-2 text-gray-800">{p.productId}</td>
                  <td className="px-4 py-2 text-gray-800">{p.planId}</td>
                  <td className="px-4 py-2 text-gray-800">{new Date(p.updatedAt).toLocaleString()}</td>
                  <td className="px-4 py-2 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button onClick={() => { setProvEdit({ ...p, metadata: p.metadata || {} }); setProvOpen(true) }} className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs hover:bg-gray-50">Edit</button>
                      <button onClick={() => { setProvEdit(p); setProvDeleteOpen(true) }} className="rounded-md border border-red-200 bg-white px-2 py-1 text-xs text-red-600 hover:bg-red-50">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={toggleOpen} onClose={() => setToggleOpen(false)} title="Update plan status">
        <div className="space-y-4 text-sm">
          <div className="text-gray-700">Current status: <span className="font-medium">{plan.isActive ? 'Active' : 'Inactive'}</span></div>
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setToggleOpen(false)} className="rounded-md border border-gray-200 bg-white px-3 py-2 hover:bg-gray-50">Cancel</button>
            <button onClick={async () => { try { await adminService.togglePlan(plan.id); const updated = await adminService.getPlan(plan.id); setPlan(updated); showToast('Status updated'); } catch(_) { showToast('Failed to update status', 'error') } finally { setToggleOpen(false) } }} className="rounded-md bg-green-500 px-3 py-2 text-white hover:bg-green-600">Toggle status</button>
          </div>
        </div>
      </Modal>

      <Modal open={provOpen} onClose={() => setProvOpen(false)} title={provEdit?.id ? 'Update provider' : 'Add provider'}>
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-gray-700">Gateway</label>
              <select value={provEdit?.paymentGateway || ''} onChange={(e) => setProvEdit((x) => ({ ...x, paymentGateway: e.target.value }))} className="w-full rounded-md border border-gray-300 px-2 py-1">
                <option>Stripe</option>
                <option>PayPal</option>
                <option>Apple</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-gray-700">Product ID</label>
              <input value={provEdit?.productId || ''} onChange={(e) => setProvEdit((x) => ({ ...x, productId: e.target.value }))} className="w-full rounded-md border border-gray-300 px-2 py-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-gray-700">Plan ID (provider)</label>
              <input value={provEdit?.planId || ''} onChange={(e) => setProvEdit((x) => ({ ...x, planId: e.target.value }))} className="w-full rounded-md border border-gray-300 px-2 py-1" />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-gray-700">Metadata (JSON)</label>
              <textarea rows={4} value={JSON.stringify(provEdit?.metadata || {}, null, 2)} onChange={(e) => {
                try { setProvEdit((x) => ({ ...x, metadata: JSON.parse(e.target.value || '{}') })) } catch { /* ignore invalid json while typing */ }
              }} className="w-full rounded-md border border-gray-300 px-2 py-2 font-mono text-xs" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setProvOpen(false)} className="rounded-md border border-gray-200 bg-white px-3 py-2 hover:bg-gray-50">Cancel</button>
            <button onClick={async () => {
              setLoadingProv(true)
              try {
                if (provEdit.id) {
                  await adminService.updateProvider(plan.id, provEdit.id, {
                    paymentGateway: provEdit.paymentGateway,
                    productId: provEdit.productId,
                    planId: provEdit.planId,
                    metadata: provEdit.metadata || {},
                  })
                  showToast('Provider updated')
                } else {
                  await adminService.addProvider(plan.id, {
                    paymentGateway: provEdit.paymentGateway,
                    productId: provEdit.productId,
                    planId: provEdit.planId,
                    metadata: provEdit.metadata || {},
                  })
                  showToast('Provider added')
                }
                await refreshProviders()
                setProvOpen(false)
              } catch (_) { showToast('Provider save failed', 'error') } finally { setLoadingProv(false) }
            }} className="rounded-md bg-green-500 px-3 py-2 text-white hover:bg-green-600">{loadingProv ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </Modal>

      <Modal open={provDeleteOpen} onClose={() => setProvDeleteOpen(false)} title="Delete provider">
        <div className="space-y-4 text-sm">
          <div>Are you sure you want to delete this provider?</div>
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setProvDeleteOpen(false)} className="rounded-md border border-gray-200 bg-white px-3 py-2 hover:bg-gray-50">Cancel</button>
            <button onClick={async () => { try { await adminService.deleteProvider(plan.id, provEdit.id); showToast('Provider deleted'); await refreshProviders(); } catch(_) { showToast('Failed to delete provider', 'error') } finally { setProvDeleteOpen(false) } }} className="rounded-md bg-red-600 px-3 py-2 text-white hover:bg-red-700">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default PlanView


