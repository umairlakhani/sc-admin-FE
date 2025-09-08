import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { plansData } from '../data'

function PlanView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const plan = plansData.find((p) => p.id === id)
  const currency = useMemo(() => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }), [])

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
        <button onClick={() => navigate('/plans')} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50">Back</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="text-sm text-gray-500">Price</div>
          <div className="mt-1 text-xl font-semibold text-gray-900">{currency.format(plan.price)} {plan.currency}</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="text-sm text-gray-500">Billing</div>
          <div className="mt-1 text-xl font-semibold text-gray-900">{plan.billing}</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="text-sm text-gray-500">Status</div>
          <div className="mt-1">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              plan.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {plan.status}
            </span>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="text-base font-semibold text-gray-900 mb-2">Features</div>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
          {plan.features.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default PlanView


