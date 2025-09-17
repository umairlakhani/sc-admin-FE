import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MoreVertical, Eye, Send, Trash2, MessageSquare, Edit, Shield } from 'lucide-react'
import { adminService } from '../lib/api'
import { showToast } from '../lib/toast'
import Pagination from '../components/Pagination'

function Modal({ open, onClose, title, children }) {
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

function Support() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [statistics, setStatistics] = useState({ total: 0, resolved: 0, inProgress: 0, open: 0, closed: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  
  // Modal states
  const [menuOpen, setMenuOpen] = useState('')
  const [viewOpen, setViewOpen] = useState(false)
  const [replyOpen, setReplyOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false)
  const [current, setCurrent] = useState(null)
  const [reply, setReply] = useState('')
  const [newStatus, setNewStatus] = useState('')
  
  // Loading states
  const [sending, setSending] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Load support tickets
  async function loadTickets() {
    setLoading(true)
    try {
      const params = {
        page,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(priorityFilter && { priority: priorityFilter })
      }
      const res = await adminService.listSupportTickets(params)
      setTickets(res?.data || [])
      setTotalPages(res?.pagination?.totalPages || 1)
    } catch (err) {
      showToast(err.message || 'Failed to load support tickets', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Load statistics
  async function loadStatistics() {
    try {
      const res = await adminService.getSupportStatistics()
      setStatistics(res?.data || { total: 0, resolved: 0, inProgress: 0, open: 0, closed: 0 })
    } catch (err) {
      console.error('Failed to load statistics:', err)
    }
  }

  // Load ticket with comments
  async function loadTicketDetails(ticketId) {
    try {
      const res = await adminService.getSupportTicketComments(ticketId)
      return res?.data || []
    } catch (err) {
      console.error('Failed to load ticket details:', err)
      return []
    }
  }

  function openView(ticket) {
    navigate(`/support/${ticket.id}`, { state: { ticket } })
  }

  function openReply(ticket) {
    setCurrent(ticket)
    setReply('')
    setReplyOpen(true)
  }

  function openDelete(ticket) {
    setCurrent(ticket)
    setDeleteOpen(true)
  }

  function openStatusUpdate(ticket) {
    setCurrent(ticket)
    setNewStatus(ticket.status)
    setStatusUpdateOpen(true)
  }

  async function sendReply() {
    if (!reply.trim()) {
      showToast('Please enter a reply message', 'error')
      return
    }
    
    setSending(true)
    try {
      await adminService.addSupportTicketResponse(current.id, { 
        message: reply,
        isInternal: false // This is a public response to the user
      })
      showToast('Reply sent successfully')
      setReplyOpen(false)
      setReply('')
      loadTickets()
      loadStatistics()
    } catch (err) {
      showToast(err.message || 'Failed to send reply', 'error')
    } finally {
      setSending(false)
    }
  }

  async function deleteTicket() {
    setDeleting(true)
    try {
      await adminService.deleteSupportTicket(current.id)
      showToast('Ticket deleted successfully')
      setDeleteOpen(false)
      setCurrent(null)
      loadTickets()
      loadStatistics()
    } catch (err) {
      showToast(err.message || 'Failed to delete ticket', 'error')
    } finally {
      setDeleting(false)
    }
  }

  async function updateStatus() {
    if (!newStatus) {
      showToast('Please select a status', 'error')
      return
    }
    
    setUpdatingStatus(true)
    try {
      await adminService.updateSupportTicketStatus(current.id, { status: newStatus })
      showToast('Status updated successfully')
      setStatusUpdateOpen(false)
      setNewStatus('')
      loadTickets()
      loadStatistics()
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error')
    } finally {
      setUpdatingStatus(false)
    }
  }

  useEffect(() => {
    loadTickets()
    loadStatistics()
  }, [page, searchTerm, statusFilter, priorityFilter])

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuOpen && !event.target.closest('.relative')) {
        setMenuOpen('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Support Requests</h1>
          <p className="text-sm text-gray-500">Manage customer support tickets</p>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 transition-colors hover:bg-green-50 hover:border-green-200">
          <div className="text-xs text-gray-500">Total</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">{statistics.total}</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 transition-colors hover:bg-green-50 hover:border-green-200">
          <div className="text-xs text-gray-500">Resolved</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">{statistics.resolved}</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 transition-colors hover:bg-green-50 hover:border-green-200">
          <div className="text-xs text-gray-500">In Progress</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">{statistics.inProgress}</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 transition-colors hover:bg-green-50 hover:border-green-200">
          <div className="text-xs text-gray-500">Open</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">{statistics.open}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* Tickets Table */}
      <div className="flex-1 rounded-2xl border border-gray-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading support tickets...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {ticket.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{ticket.name}</div>
                      <div className="text-sm text-gray-500">{ticket.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{ticket.subject}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{ticket.message}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                        ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        ticket.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="relative">
                        <button 
                          className="ml-auto flex items-center rounded-md border border-gray-200 bg-white p-2 hover:bg-gray-100" 
                          onClick={() => setMenuOpen(menuOpen === ticket.id ? '' : ticket.id)}
                        >
                          <MoreVertical size={16} />
                        </button>
                        {menuOpen === ticket.id && (
                          <div className="absolute right-0 z-50 mt-2 w-40 rounded-md border border-gray-200 bg-white shadow-lg">
                            <button 
                              onClick={() => { setMenuOpen(''); openView(ticket) }} 
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                            >
                              <Eye size={14} /> View
                            </button>
                            <button 
                              onClick={() => { setMenuOpen(''); openReply(ticket) }} 
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                            >
                              <MessageSquare size={14} /> Reply
                            </button>
                            <button 
                              onClick={() => { setMenuOpen(''); openStatusUpdate(ticket) }} 
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                            >
                              <Edit size={14} /> Update Status
                            </button>
                            <button 
                              onClick={() => { setMenuOpen(''); openDelete(ticket) }} 
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                            >
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
        )}
      </div>

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {/* View Ticket Modal */}
      <Modal open={viewOpen} onClose={() => setViewOpen(false)} title={`Ticket ${current?.id?.slice(0, 8)}...`}>
        {current && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                <p className="text-sm text-gray-900">{current.name} ({current.email})</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  current.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  current.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  current.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {current.status}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  current.priority === 'high' ? 'bg-red-100 text-red-800' :
                  current.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {current.priority}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <p className="text-sm text-gray-900 capitalize">{current.category}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <p className="text-sm text-gray-900">{current.subject}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{current.message}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                <p className="text-sm text-gray-900">
                  {current.createdAt ? new Date(current.createdAt).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                <p className="text-sm text-gray-900">
                  {current.updatedAt ? new Date(current.updatedAt).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
            {current.adminResponse && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Response</label>
                <p className="text-sm text-gray-900 bg-blue-50 p-3 rounded-lg">{current.adminResponse}</p>
                {current.adminResponseAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    Responded: {new Date(current.adminResponseAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reply Modal */}
      <Modal open={replyOpen} onClose={() => setReplyOpen(false)} title={`Reply to Ticket ${current?.id?.slice(0, 8)}...`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reply Message</label>
            <textarea 
              rows={4} 
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" 
              placeholder="Write your reply..." 
              value={reply} 
              onChange={(e) => setReply(e.target.value)} 
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button 
              onClick={() => setReplyOpen(false)} 
              className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={sendReply} 
              disabled={sending}
              className="rounded-md bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending...' : 'Send Reply'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Update Status Modal */}
      <Modal open={statusUpdateOpen} onClose={() => setStatusUpdateOpen(false)} title={`Update Status - Ticket ${current?.id?.slice(0, 8)}...`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
            <p className="text-sm text-gray-900 capitalize">{current?.status}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button 
              onClick={() => setStatusUpdateOpen(false)} 
              className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={updateStatus} 
              disabled={updatingStatus}
              className="rounded-md bg-purple-500 px-3 py-2 text-sm font-medium text-white hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updatingStatus ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Support Ticket">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this support ticket? This action cannot be undone.
          </p>
          {current && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-900">Ticket ID: {current.id.slice(0, 8)}...</p>
              <p className="text-sm text-gray-500 mt-1">Subject: {current.subject}</p>
              <p className="text-sm text-gray-500">User: {current.name} ({current.email})</p>
            </div>
          )}
          <div className="flex items-center justify-end gap-2">
            <button 
              onClick={() => setDeleteOpen(false)} 
              className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={deleteTicket} 
              disabled={deleting}
              className="rounded-md bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? 'Deleting...' : 'Delete Ticket'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Support


