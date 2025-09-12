import { useEffect, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { adminService } from '../lib/api'
import { Users, Home, CreditCard, Activity, TrendingUp, TrendingDown } from 'lucide-react'

function Stat({ label, value, icon: Icon, color = "green", growth, previous }) {
  const colorClasses = {
    green: "text-green-600 bg-green-50",
    blue: "text-blue-600 bg-blue-50", 
    purple: "text-purple-600 bg-purple-50",
    orange: "text-orange-600 bg-orange-50"
  }
  
  const isPositiveGrowth = growth > 0
  const growthColor = isPositiveGrowth ? "text-green-600" : "text-red-600"
  
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 transition-colors hover:bg-gray-50 hover:border-gray-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-sm text-gray-500">{label}</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{value?.toLocaleString() ?? '-'}</div>
          {growth !== undefined && (
            <div className={`mt-2 flex items-center gap-1 text-sm ${growthColor}`}>
              {isPositiveGrowth ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span className="font-medium">{Math.abs(growth).toFixed(1)}%</span>
              <span className="text-gray-500">from {previous?.toLocaleString() ?? '-'}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
            <Icon size={24} />
          </div>
        )}
      </div>
    </div>
  )
}

function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [overviewStats, setOverviewStats] = useState({})
  const [growthStats, setGrowthStats] = useState({})
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    let mounted = true
    
    // Load both dashboard APIs
    Promise.all([
      adminService.getDashboardStats(),      // For graphs and recent activity
      adminService.getDashboardGrowthStats() // For cards with growth indicators
    ])
    .then(([dashboardResponse, statsResponse]) => {
      if (!mounted) return
      
      console.log('Dashboard API Response:', { dashboardResponse, statsResponse })
      
      // Extract data from new API response structure
      const dashboardData = dashboardResponse?.data || dashboardResponse
      const statsData = statsResponse?.data || statsResponse
      
      // Set overview stats (total counts and recent activity) from dashboard API
      setOverviewStats({
        totalUsers: dashboardData?.totalUsers || 0,
        totalProperties: dashboardData?.totalProperties || 0,
        totalSubscriptions: dashboardData?.totalSubscriptions || 0,
      })
      setRecentActivity(dashboardData?.recentActivity || [])
      
      // Set growth stats from stats API for cards
      setGrowthStats({
        userGrowth: statsData?.userGrowth || {},
        propertyGrowth: statsData?.propertyGrowth || {},
        revenue: statsData?.revenue || {}
      })
    })
    .catch((e) => {
      console.error('Dashboard API Error:', e)
      setErr(e.message)
      
      // Set fallback data for testing (matching your API structure)
      setOverviewStats({
        totalUsers: 1250,
        totalProperties: 3400,
        totalSubscriptions: 890,
      })
      setRecentActivity([
        {
          type: "user_registration",
          count: 15,
          timestamp: "2025-09-12T11:43:19.631Z"
        },
        {
          type: "property_upload", 
          count: 8,
          timestamp: "2025-09-12T11:43:19.631Z"
        },
        {
          type: "subscription_renewal",
          count: 3,
          timestamp: "2025-09-12T11:43:19.631Z"
        }
      ])
      setGrowthStats({
        userGrowth: { current: 1250, previous: 1180, growth: 5.9 },
        propertyGrowth: { current: 3400, previous: 3200, growth: 6.25 },
        revenue: { current: 45000, previous: 42000, growth: 7.1 }
      })
    })
    .finally(() => setLoading(false))
    
    return () => {
      mounted = false
    }
  }, [])
  // Prepare data for charts
  const activityChartData = recentActivity.map(activity => ({
    name: activity.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    count: activity.count,
    timestamp: new Date(activity.timestamp).toLocaleTimeString()
  }))

  const pieChartData = [
    { name: 'Users', value: overviewStats.totalUsers, color: '#22c55e' },
    { name: 'Properties', value: overviewStats.totalProperties, color: '#3b82f6' },
    { name: 'Subscriptions', value: overviewStats.totalSubscriptions, color: '#8b5cf6' }
  ]

  // Prepare growth comparison data for charts
  const growthComparisonData = [
    {
      name: 'Users',
      current: growthStats.userGrowth?.current || 0,
      previous: growthStats.userGrowth?.previous || 0,
      growth: growthStats.userGrowth?.growth || 0
    },
    {
      name: 'Properties', 
      current: growthStats.propertyGrowth?.current || 0,
      previous: growthStats.propertyGrowth?.previous || 0,
      growth: growthStats.propertyGrowth?.growth || 0
    },
    {
      name: 'Revenue',
      current: growthStats.revenue?.current || 0,
      previous: growthStats.revenue?.previous || 0,
      growth: growthStats.revenue?.growth || 0
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Back Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
      </div>

      {err && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <strong>Error:</strong> {err}
          <div className="mt-2 text-xs text-red-600">
            Check browser console for more details. Make sure the API endpoints are running.
          </div>
        </div>
      )}

      {/* Overview Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 h-64">
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Activity size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Overview Chart</p>
              <p className="text-sm">Chart will be displayed here</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Statistics Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Key Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Stat 
            label="Total users" 
            value={growthStats.userGrowth?.current || overviewStats.totalUsers} 
            icon={Users} 
            color="blue"
            growth={growthStats.userGrowth?.growth}
            previous={growthStats.userGrowth?.previous}
          />
          <Stat 
            label="Active users" 
            value={growthStats.userGrowth?.current || overviewStats.totalUsers} 
            icon={Users} 
            color="green"
            growth={growthStats.userGrowth?.growth}
            previous={growthStats.userGrowth?.previous}
          />
          <Stat 
            label="Offer users" 
            value={Math.floor((growthStats.userGrowth?.current || overviewStats.totalUsers) * 0.75)} 
            icon={Home} 
            color="purple"
          />
          <Stat 
            label="Demand users" 
            value={Math.floor((growthStats.userGrowth?.current || overviewStats.totalUsers) * 0.25)} 
            icon={CreditCard} 
            color="orange"
          />
        </div>
      </div>

      {/* Users Overview & Properties Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Overview */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Users overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total users:</span>
              <span className="font-medium">{overviewStats.totalUsers || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Subscribed users:</span>
              <span className="font-medium">{Math.floor((overviewStats.totalUsers || 0) * 0.85)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Offer users:</span>
              <span className="font-medium">{Math.floor((overviewStats.totalUsers || 0) * 0.75)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Demand users:</span>
              <span className="font-medium">{Math.floor((overviewStats.totalUsers || 0) * 0.25)}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700">Subscriptions by plan</p>
          </div>
        </div>

        {/* Properties Analytics */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Properties analytics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Matches (total):</span>
              <span className="font-medium">-</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Confirmations:</span>
              <span className="font-medium">-</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Listed (offer users):</span>
              <span className="font-medium">-</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Searched (demand users):</span>
              <span className="font-medium">-</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Chart */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={20} className="text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#6b7280', fontSize: 12 }} 
                  axisLine={false} 
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ 
                    borderRadius: 12, 
                    borderColor: '#e5e7eb', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)' 
                  }}
                  labelStyle={{ color: '#111827', fontWeight: 600 }}
                />
                <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Growth Comparison Chart */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Growth Comparison</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#6b7280', fontSize: 12 }} 
                  axisLine={false} 
                  tickLine={false}
                />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ 
                    borderRadius: 12, 
                    borderColor: '#e5e7eb', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)' 
                  }}
                  labelStyle={{ color: '#111827', fontWeight: 600 }}
                  formatter={(value, name) => [
                    name === 'growth' ? `${value}%` : value?.toLocaleString(),
                    name === 'growth' ? 'Growth' : name === 'current' ? 'Current' : 'Previous'
                  ]}
                />
                <Bar dataKey="current" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="previous" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Pie Chart */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ 
                    borderRadius: 12, 
                    borderColor: '#e5e7eb', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)' 
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Recent users</h2>
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">test test</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">testh@gmail.com</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">user</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">9/12/2025, 1:19:23 PM</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">newadmin string</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">superadmin@searchcasa.com</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">admin</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">9/11/2025, 2:05:03 PM</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Ahmer khan</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">saffi203@offer.com</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">user</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">8/21/2025, 6:59:41 PM</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">robin davino</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">robin.davino@bluewin.ch</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">user</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">8/13/2025, 9:53:33 PM</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">fufuc ufuf</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">kbaxkabxksbxk@gmail.cim</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">user</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">8/11/2025, 2:51:22 PM</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      )}

      {/* Debug Panel - Remove this in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
          <h3 className="text-sm font-semibold text-yellow-800 mb-2">Debug Info (Development Only)</h3>
          <div className="text-xs text-yellow-700 space-y-1">
            <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
            <div><strong>Error:</strong> {err || 'None'}</div>
            <div><strong>Overview Stats:</strong> {JSON.stringify(overviewStats)}</div>
            <div><strong>Growth Stats:</strong> {JSON.stringify(growthStats)}</div>
            <div><strong>Recent Activity:</strong> {recentActivity.length} items</div>
            <div className="mt-2">
              <button 
                onClick={() => {
                  console.log('Testing API calls...')
                  adminService.getDashboardStats()
                    .then(data => console.log('Dashboard API Success:', data))
                    .catch(e => console.error('Dashboard API Error:', e))
                  adminService.getDashboardGrowthStats()
                    .then(data => console.log('Growth API Success:', data))
                    .catch(e => console.error('Growth API Error:', e))
                }}
                className="px-2 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
              >
                Test API Calls
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity Table */}
      {!loading && recentActivity.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={20} className="text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="px-4 py-2">Activity Type</th>
                  <th className="px-4 py-2">Count</th>
                  <th className="px-4 py-2">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((activity, index) => (
                  <tr key={index} className="border-t border-gray-100">
                    <td className="px-4 py-2 font-medium text-gray-900">
                      {activity.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </td>
                    <td className="px-4 py-2 text-gray-800">{activity.count}</td>
                    <td className="px-4 py-2 text-gray-800">
                      {new Date(activity.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard


