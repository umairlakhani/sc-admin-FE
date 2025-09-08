import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { dashboardChart, dashboardStats } from '../data'

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-2 text-3xl font-bold text-gray-900">{value}</div>
    </div>
  )
}

function Dashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Welcome back</h2>

      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="text-base font-semibold text-gray-900">Overview</div>
        <div className="mt-4 h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dashboardChart} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
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
        <Stat label="Sign ups" value={dashboardStats.signUps} />
        <Stat label="Logins" value={dashboardStats.logins} />
        <Stat label="Active users" value={dashboardStats.activeUsers} />
        <Stat label="Gender Mix" value={dashboardStats.genderMix} />
      </div>
    </div>
  )
}

export default Dashboard


