import { useState } from 'react'
import { plansData } from '../data'
import { Plus, Trash2, Download } from 'lucide-react'

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-xl border border-gray-200 p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-base font-semibold text-gray-900">{title}</div>
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Billing() {
  const [plans, setPlans] = useState(plansData)
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState({ name: '', price: 0, currency: 'GBP', billing: 'Monthly' })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function createPlan() {
    if (!editing.name) {
      showToast('Please enter a plan name', 'error')
      return
    }
    if (!editing.price || editing.price <= 0) {
      showToast('Please enter a valid price', 'error')
      return
    }
    
    setSaving(true)
    // Simulate API call delay
    setTimeout(() => {
      const id = editing.name.toLowerCase().replace(/\s+/g, '-')
      setPlans((p) => [...p, { id, features: [], status: 'Active', ...editing }])
      showToast('Plan created successfully')
      setCreateOpen(false)
      setSaving(false)
    }, 500)
  }

  function deletePlan(id) {
    setDeleting(true)
    // Simulate API call delay
    setTimeout(() => {
      setPlans((p) => p.filter((x) => x.id !== id))
      showToast('Plan deleted successfully')
      setDeleting(false)
    }, 500)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Subscriptions & Payments</h2>
        <div className="inline-flex items-center gap-2">
          <button className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50">Stripe Dashboard</button>
          <button onClick={() => setCreateOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600"><Plus size={16} /> New plan</button>
        </div>
      </div>

      {/* Subscriptions overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card label="Active subscriptions" value="1,560" />
        <Card label="MRR" value="£82,300" />
        <Card label="Churn (30d)" value="2.1%" />
        <Card label="Refunds (30d)" value="£1,120" />
      </div>

      {/* Plans management */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="px-5 py-3 text-base font-semibold text-gray-900">Plans</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Billing</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 text-gray-800">£{p.price} {p.currency}</td>
                  <td className="px-4 py-3 text-gray-800">{p.billing}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${p.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => deletePlan(p.id)} 
                      disabled={deleting}
                      className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={14} /> {deleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payments and reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
          <div className="text-base font-semibold text-gray-900">Recent payments</div>
          <div className="text-sm text-gray-500">Stripe-connected. Replace with live data.</div>
          <button className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"><Download size={14} /> Export CSV</button>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
          <div className="text-base font-semibold text-gray-900">Reports</div>
          <ul className="text-sm text-gray-700 list-disc pl-5">
            <li>Monthly revenue</li>
            <li>Plan performance</li>
            <li>Churn analysis</li>
          </ul>
        </div>
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Stripe plan (mock)">
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-gray-700">Name</label>
              <input value={editing.name} onChange={(e) => setEditing((x) => ({ ...x, name: e.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="mb-1 block text-gray-700">Billing</label>
              <select value={editing.billing} onChange={(e) => setEditing((x) => ({ ...x, billing: e.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
                <option>Monthly</option>
                <option>Yearly</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-gray-700">Price</label>
              <input type="number" value={editing.price} onChange={(e) => setEditing((x) => ({ ...x, price: parseFloat(e.target.value) || 0 }))} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="mb-1 block text-gray-700">Currency</label>
              <select value={editing.currency} onChange={(e) => setEditing((x) => ({ ...x, currency: e.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
                <option>GBP</option>
                <option>USD</option>
                <option>EUR</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setCreateOpen(false)} className="rounded-md border border-gray-200 bg-white px-3 py-2 hover:bg-gray-50">Cancel</button>
            <button 
              onClick={createPlan} 
              disabled={saving}
              className="rounded-md bg-green-500 px-3 py-2 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function Card({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 transition-colors hover:bg-green-50 hover:border-green-200">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-2 text-3xl font-bold text-gray-900">{value}</div>
    </div>
  )
}

export default Billing


