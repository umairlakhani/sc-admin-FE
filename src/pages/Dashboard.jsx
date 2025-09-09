import { useEffect, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { adminService } from '../lib/api'

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 transition-colors hover:bg-green-50 hover:border-green-200">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-2 text-3xl font-bold text-gray-900">{value}</div>
    </div>
  )
}

function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [chart, setChart] = useState([])
  const [stats, setStats] = useState({})
  const [subsByPlan, setSubsByPlan] = useState({})

  useEffect(() => {
    let mounted = true
    adminService.getDashboardStats()
      .then((data) => {
        if (!mounted) return
        const overview = data?.overview || {}
        // Map API response to UI stats
        const mapped = {
          totalUsers: overview.totalUsers,
          activeUsers: overview.activeUsers,
          adminUsers: overview.adminUsers,
          totalProperties: overview.totalProperties,
          subscribedUsers: overview.totalSubscriptions,
        }
        // Extract user type distribution (offer/demand)
        const utd = Array.isArray(data?.userTypeDistribution) ? data.userTypeDistribution : []
        for (const item of utd) {
          if (item.userType === 'offer') mapped.offerUsers = Number(item.count)
          if (item.userType === 'demand') mapped.demandUsers = Number(item.count)
        }
        // Optional: roleDistribution (admin/users)
        const rd = Array.isArray(data?.roleDistribution) ? data.roleDistribution : []
        for (const item of rd) {
          if (item.role === 'admin') mapped.adminUsers = Number(item.count)
          if (item.role === 'user') mapped.userUsers = Number(item.count)
        }
        setStats(mapped)
        setChart(data?.chart || [])
        setSubsByPlan(data?.subscriptionsByPlan || {})
        setRecent(Array.isArray(data?.recentUsers) ? data.recentUsers : [])
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  const [recent, setRecent] = useState([])
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Welcome back</h2>
      {err && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}

      <div className="rounded-2xl border border-gray-200 bg-white p-5 transition-colors hover:bg-green-50 hover:border-green-200">
        <div className="text-base font-semibold text-gray-900">Overview</div>
        <div className="mt-4 h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, borderColor: '#e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                labelStyle={{ color: '#111827', fontWeight: 600 }}
              />
              <Area type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2}
                fill="url(#colorPrimary)"
                dot={{ r: 4, stroke: '#22c55e', strokeWidth: 2, fill: '#a7f3d0' }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total users" value={stats.totalUsers ?? '-'} />
        <Stat label="Active users" value={stats.activeUsers ?? '-'} />
        <Stat label="Offer users" value={stats.offerUsers ?? '-'} />
        <Stat label="Demand users" value={stats.demandUsers ?? '-'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3 transition-colors hover:bg-green-50 hover:border-green-200">
          <div className="text-base font-semibold text-gray-900">Users overview</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-gray-100 p-3 transition-colors hover:bg-green-50 hover:border-green-200">
              <div className="text-gray-500">Total users</div>
              <div className="mt-1 text-xl font-semibold text-gray-900">{stats.totalUsers ?? '-'}</div>
            </div>
            <div className="rounded-xl border border-gray-100 p-3 transition-colors hover:bg-green-50 hover:border-green-200">
              <div className="text-gray-500">Subscribed users</div>
              <div className="mt-1 text-xl font-semibold text-gray-900">{stats.subscribedUsers ?? '-'}</div>
            </div>
            <div className="rounded-xl border border-gray-100 p-3 transition-colors hover:bg-green-50 hover:border-green-200">
              <div className="text-gray-500">Offer users</div>
              <div className="mt-1 text-xl font-semibold text-gray-900">{stats.offerUsers ?? '-'}</div>
            </div>
            <div className="rounded-xl border border-gray-100 p-3 transition-colors hover:bg-green-50 hover:border-green-200">
              <div className="text-gray-500">Demand users</div>
              <div className="mt-1 text-xl font-semibold text-gray-900">{stats.demandUsers ?? '-'}</div>
            </div>
          </div>
          <div className="pt-2">
            <div className="text-sm font-medium text-gray-900 mb-2">Subscriptions by plan</div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              {Object.entries(subsByPlan).map(([plan, count]) => (
                <div key={plan} className="rounded-xl border border-gray-100 p-3 transition-colors hover:bg-green-50 hover:border-green-200">
                  <div className="text-gray-500">{plan}</div>
                  <div className="mt-1 text-xl font-semibold text-gray-900">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3 transition-colors hover:bg-green-50 hover:border-green-200">
          <div className="text-base font-semibold text-gray-900">Properties analytics</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-gray-100 p-3 transition-colors hover:bg-green-50 hover:border-green-200">
              <div className="text-gray-500">Matches (total)</div>
              <div className="mt-1 text-xl font-semibold text-gray-900">{stats.propertiesMatchedTotal ?? '-'}</div>
            </div>
            <div className="rounded-xl border border-gray-100 p-3 transition-colors hover:bg-green-50 hover:border-green-200">
              <div className="text-gray-500">Confirmations</div>
              <div className="mt-1 text-xl font-semibold text-gray-900">{stats.propertiesConfirmations ?? '-'}</div>
            </div>
            <div className="rounded-xl border border-gray-100 p-3 transition-colors hover:bg-green-50 hover:border-green-200">
              <div className="text-gray-500">Listed (offer users)</div>
              <div className="mt-1 text-xl font-semibold text-gray-900">{stats.listedPropertiesOfferUsers ?? '-'}</div>
            </div>
            <div className="rounded-xl border border-gray-100 p-3 transition-colors hover:bg-green-50 hover:border-green-200">
              <div className="text-gray-500">Searched (demand users)</div>
              <div className="mt-1 text-xl font-semibold text-gray-900">{stats.searchedPropertiesDemandUsers ?? '-'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent users */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="text-base font-semibold text-gray-900 mb-3">Recent users</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((u) => (
                <tr key={u.id} className="border-t border-gray-100">
                  <td className="px-4 py-2 font-medium text-gray-900">{u.name} {u.surname}</td>
                  <td className="px-4 py-2 text-gray-800">{u.email}</td>
                  <td className="px-4 py-2 text-gray-800">{u.role}</td>
                  <td className="px-4 py-2 text-gray-800">{new Date(u.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {!recent.length && (
                <tr><td className="px-4 py-3 text-gray-500" colSpan={4}>No recent users.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard


