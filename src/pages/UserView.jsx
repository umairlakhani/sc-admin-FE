import { useParams, useNavigate } from 'react-router-dom'
import { usersData } from '../data'

function UserView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = usersData.find((u) => u.id === id)

  if (!user) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">User not found</h2>
        <button onClick={() => navigate('/users')} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50">Back to users</button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">{user.name}</h2>
        <button onClick={() => navigate('/users')} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50">Back</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:col-span-2">
          <div className="text-base font-semibold text-gray-900 mb-3">Account details</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">User ID</div>
              <div className="mt-1 font-medium text-gray-900">{user.id}</div>
            </div>
            <div>
              <div className="text-gray-500">Email</div>
              <div className="mt-1 font-medium text-gray-900">{user.email}</div>
            </div>
            <div>
              <div className="text-gray-500">First name</div>
              <div className="mt-1 font-medium text-gray-900">{user.firstName}</div>
            </div>
            <div>
              <div className="text-gray-500">Last name</div>
              <div className="mt-1 font-medium text-gray-900">{user.lastName}</div>
            </div>
            <div>
              <div className="text-gray-500">Age</div>
              <div className="mt-1 font-medium text-gray-900">{user.age}</div>
            </div>
            <div>
              <div className="text-gray-500">Role</div>
              <div className="mt-1 font-medium text-gray-900">{user.role}</div>
            </div>
            <div className="sm:col-span-2">
              <div className="text-gray-500">Address</div>
              <div className="mt-1 font-medium text-gray-900">{user.address}</div>
            </div>
            <div>
              <div className="text-gray-500">Joined</div>
              <div className="mt-1 font-medium text-gray-900">{user.joinedAt}</div>
            </div>
            <div>
              <div className="text-gray-500">Status</div>
              <div className="mt-1">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  user.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {user.status}
                </span>
              </div>
            </div>
            <div>
              <div className="text-gray-500">Properties listed</div>
              <div className="mt-1 font-medium text-gray-900">{user.propertiesCount}</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="text-base font-semibold text-gray-900 mb-2">Quick stats</div>
          <ul className="text-sm space-y-2">
            <li className="flex items-center justify-between"><span className="text-gray-500">Status</span><span className="font-medium text-gray-900">{user.status}</span></li>
            <li className="flex items-center justify-between"><span className="text-gray-500">Role</span><span className="font-medium text-gray-900">{user.role}</span></li>
            <li className="flex items-center justify-between"><span className="text-gray-500">Joined</span><span className="font-medium text-gray-900">{user.joinedAt}</span></li>
            <li className="flex items-center justify-between"><span className="text-gray-500">Properties</span><span className="font-medium text-gray-900">{user.propertiesCount}</span></li>
          </ul>
        </div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="text-base font-semibold text-gray-900 mb-2">Recent activity</div>
        {user.activities?.length ? (
          <ul className="divide-y divide-gray-100">
            {user.activities.map((a) => (
              <li key={a.id} className="py-2 flex items-start justify-between">
                <div className="text-sm text-gray-800">{a.action}</div>
                <div className="text-xs text-gray-500">{a.at}</div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-gray-500">No recent activity.</div>
        )}
      </div>
    </div>
  )
}

export default UserView


