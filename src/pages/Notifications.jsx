import { useEffect, useState } from 'react'
import { Bell, Plus, Search, MoreVertical, Edit, Trash2, Send, Eye, Filter } from 'lucide-react'
import { adminService } from '../lib/api'
import { showToast } from '../lib/toast'
import Pagination from '../components/Pagination'

function Modal({ open, onClose, children, title }) {
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

function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [batchModalOpen, setBatchModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  // Send notification form state
  const [sendForm, setSendForm] = useState({
    userId: '',
    selectedUser: '',
    title: '',
    body: '',
    type: 'info',
    channel: 'push',
    data: {},
    priority: 'normal'
  })

  // Batch notification form state
  const [batchForm, setBatchForm] = useState({
    userIds: [],
    selectedUsers: [],
    title: '',
    body: '',
    type: 'info',
    channel: 'push',
    data: {},
    priority: 'normal'
  })

  async function loadNotifications() {
    setLoading(true)
    try {
      const res = await adminService.listNotifications({ 
        page, 
        limit: 10,
        search: searchTerm 
      })
      setNotifications(res?.data || [])
      setTotalPages(res?.pagination?.totalPages || 1)
    } catch (err) {
      showToast(err.message || 'Failed to load notifications', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function loadUsers() {
    setLoadingUsers(true)
    try {
      const res = await adminService.listUsers({ 
        limit: 100
      })
      console.log('Users API Response:', res)
      // The API returns users in a 'users' array
      setUsers(res?.users || res?.data || [])
    } catch (err) {
      console.error('Error loading users:', err)
      showToast(err.message || 'Failed to load users', 'error')
    } finally {
      setLoadingUsers(false)
    }
  }

  async function sendNotification() {
    setSending(true)
    try {
      const payload = {
        ...sendForm,
        userId: sendForm.selectedUser || sendForm.userId
      }
      await adminService.sendNotification(payload)
      showToast('Notification sent successfully')
      setSendModalOpen(false)
      setSendForm({
        userId: '',
        selectedUser: '',
        title: '',
        body: '',
        type: 'info',
        channel: 'push',
        data: {},
        priority: 'normal'
      })
      loadNotifications()
    } catch (err) {
      showToast(err.message || 'Failed to send notification', 'error')
    } finally {
      setSending(false)
    }
  }

  async function sendBatchNotifications() {
    setSending(true)
    try {
      const payload = {
        ...batchForm,
        userIds: batchForm.selectedUsers.length > 0 ? batchForm.selectedUsers : batchForm.userIds
      }
      await adminService.sendBatchNotifications(payload)
      showToast('Batch notifications sent successfully')
      setBatchModalOpen(false)
      setBatchForm({
        userIds: [],
        selectedUsers: [],
        title: '',
        body: '',
        type: 'info',
        channel: 'push',
        data: {},
        priority: 'normal'
      })
      loadNotifications()
    } catch (err) {
      showToast(err.message || 'Failed to send batch notifications', 'error')
    } finally {
      setSending(false)
    }
  }

  async function resendNotification(id) {
    try {
      await adminService.resendNotification(id)
      showToast('Notification resent successfully')
      loadNotifications()
    } catch (err) {
      showToast(err.message || 'Failed to resend notification', 'error')
    }
  }

  async function deleteNotification() {
    setDeleting(true)
    try {
      await adminService.deleteNotification(selectedNotification.id)
      showToast('Notification deleted successfully')
      setDeleteModalOpen(false)
      setSelectedNotification(null)
      loadNotifications()
    } catch (err) {
      showToast(err.message || 'Failed to delete notification', 'error')
    } finally {
      setDeleting(false)
    }
  }

  useEffect(() => {
    loadNotifications()
    loadUsers()
  }, [page, searchTerm])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setPage(1)
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Manage Notifications</h1>
          <p className="text-sm text-gray-500">Send and manage system notifications</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setBatchModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            <Send size={16} />
            Send Batch
          </button>
          <button 
            onClick={() => setSendModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600"
          >
            <Plus size={16} />
            Send Notification
          </button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Total: {notifications.length}</span>
        </div>
      </div>

      {/* Notifications Table */}
      <div className="flex-1 rounded-2xl border border-gray-200 bg-white overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading notifications...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <tr key={notification.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{notification.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{notification.body}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        notification.type === 'info' ? 'bg-blue-100 text-blue-800' :
                        notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        notification.type === 'error' ? 'bg-red-100 text-red-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {notification.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {notification.channel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                        notification.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {notification.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        notification.status === 'sent' ? 'bg-green-100 text-green-800' :
                        notification.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {notification.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedNotification(notification)
                            setViewModalOpen(true)
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => resendNotification(notification.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Send size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedNotification(notification)
                            setDeleteModalOpen(true)
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {/* Send Notification Modal */}
      <Modal open={sendModalOpen} onClose={() => setSendModalOpen(false)} title="Send Notification">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select User</label>
            <select
              value={sendForm.selectedUser}
              onChange={(e) => setSendForm({ ...sendForm, selectedUser: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select a user...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} {user.surname} ({user.email})
                </option>
              ))}
            </select>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Or enter User ID manually</label>
              <input
                type="text"
                value={sendForm.userId}
                onChange={(e) => setSendForm({ ...sendForm, userId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter user ID manually"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={sendForm.title}
              onChange={(e) => setSendForm({ ...sendForm, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Notification title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
            <textarea
              value={sendForm.body}
              onChange={(e) => setSendForm({ ...sendForm, body: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
              placeholder="Notification message"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={sendForm.type}
                onChange={(e) => setSendForm({ ...sendForm, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="success">Success</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
              <select
                value={sendForm.channel}
                onChange={(e) => setSendForm({ ...sendForm, channel: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="push">Push</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="in-app">In-App</option>
                <option value="in_app">In_App</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={sendForm.priority}
              onChange={(e) => setSendForm({ ...sendForm, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button 
              onClick={() => setSendModalOpen(false)} 
              className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={sendNotification} 
              disabled={sending}
              className="rounded-md bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Send Batch Notifications Modal */}
      <Modal open={batchModalOpen} onClose={() => setBatchModalOpen(false)} title="Send Batch Notifications">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Users</label>
            <select
              multiple
              value={batchForm.selectedUsers}
              onChange={(e) => {
                const selectedOptions = Array.from(e.target.selectedOptions, option => option.value)
                setBatchForm({ ...batchForm, selectedUsers: selectedOptions })
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent h-32"
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} {user.surname} ({user.email})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple users</p>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Or enter User IDs manually (comma-separated)</label>
              <textarea
                value={batchForm.userIds.join(', ')}
                onChange={(e) => setBatchForm({ ...batchForm, userIds: e.target.value.split(',').map(id => id.trim()).filter(id => id) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
                placeholder="user1, user2, user3"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={batchForm.title}
              onChange={(e) => setBatchForm({ ...batchForm, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Notification title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
            <textarea
              value={batchForm.body}
              onChange={(e) => setBatchForm({ ...batchForm, body: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
              placeholder="Notification message"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={batchForm.type}
                onChange={(e) => setBatchForm({ ...batchForm, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="success">Success</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
              <select
                value={batchForm.channel}
                onChange={(e) => setBatchForm({ ...batchForm, channel: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="push">Push</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="in-app">In-App</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={batchForm.priority}
              onChange={(e) => setBatchForm({ ...batchForm, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button 
              onClick={() => setBatchModalOpen(false)} 
              className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={sendBatchNotifications} 
              disabled={sending}
              className="rounded-md bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending...' : 'Send Batch'}
            </button>
          </div>
        </div>
      </Modal>

      {/* View Notification Modal */}
      <Modal open={viewModalOpen} onClose={() => setViewModalOpen(false)} title="Notification Details">
        {selectedNotification && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <p className="text-sm text-gray-900">{selectedNotification.title}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
              <p className="text-sm text-gray-900">{selectedNotification.body}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  selectedNotification.type === 'info' ? 'bg-blue-100 text-blue-800' :
                  selectedNotification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  selectedNotification.type === 'error' ? 'bg-red-100 text-red-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {selectedNotification.type}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
                <p className="text-sm text-gray-900">{selectedNotification.channel}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  selectedNotification.priority === 'high' ? 'bg-red-100 text-red-800' :
                  selectedNotification.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedNotification.priority}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  selectedNotification.status === 'sent' ? 'bg-green-100 text-green-800' :
                  selectedNotification.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedNotification.status}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
              <p className="text-sm text-gray-900">
                {selectedNotification.createdAt ? new Date(selectedNotification.createdAt).toLocaleString() : 'N/A'}
              </p>
            </div>
            {selectedNotification.data && Object.keys(selectedNotification.data).length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Data</label>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(selectedNotification.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Notification">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this notification? This action cannot be undone.
          </p>
          {selectedNotification && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-900">{selectedNotification.title}</p>
              <p className="text-xs text-gray-500 mt-1">{selectedNotification.body}</p>
            </div>
          )}
          <div className="flex items-center justify-end gap-2">
            <button 
              onClick={() => setDeleteModalOpen(false)} 
              className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={deleteNotification} 
              disabled={deleting}
              className="rounded-md bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  )
}

export default Notifications


