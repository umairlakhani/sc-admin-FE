import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { 
  ArrowLeft, 
  MessageSquare, 
  Clock, 
  User, 
  Mail, 
  Calendar, 
  Tag, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  Send,
  History,
  Eye,
  EyeOff
} from 'lucide-react'
import { adminService } from '../lib/api'
import { showToast } from '../lib/toast'

function SupportView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [ticket, setTicket] = useState(location.state?.ticket || null)
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyPage, setHistoryPage] = useState(1)
  const [historyTotalPages, setHistoryTotalPages] = useState(1)
  
  // Comments state
  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentsPage, setCommentsPage] = useState(1)
  const [commentsTotalPages, setCommentsTotalPages] = useState(1)
  
  // Comment and response states
  const [newComment, setNewComment] = useState('')
  const [newResponse, setNewResponse] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [sendingComment, setSendingComment] = useState(false)
  const [sendingResponse, setSendingResponse] = useState(false)
  
  // Status update states
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [newPriority, setNewPriority] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)
  
  // Active tab state
  const [activeTab, setActiveTab] = useState('details')

  useEffect(() => {
    if (ticket) {
      setLoading(false)
      // Initialize history from ticket data if available
      if (ticket.history) {
        setHistory(ticket.history)
      }
      // Initialize comments from ticket data if available
      if (ticket.comments) {
        setComments(ticket.comments)
      }
      loadTicketHistory()
      return
    }
    
    let mounted = true
    // Fallback: fetch single ticket if not provided from list
    adminService.getSupportTicket(id)
      .then((data) => { 
        if (mounted) {
          const ticketData = data?.data || data
          setTicket(ticketData)
          setLoading(false)
          // Initialize history from ticket data if available
          if (ticketData.history) {
            setHistory(ticketData.history)
          }
          // Initialize comments from ticket data if available
          if (ticketData.comments) {
            setComments(ticketData.comments)
          }
          loadTicketHistory()
        }
      })
      .catch(() => { 
        showToast('Failed to load support ticket', 'error')
        setLoading(false)
      })
    return () => { mounted = false }
  }, [id, ticket])

  // Load comments when comments tab is active
  useEffect(() => {
    if (activeTab === 'comments' && id) {
      loadComments()
    }
  }, [activeTab, id])

  async function loadTicketHistory() {
    setHistoryLoading(true)
    try {
      const response = await adminService.getSupportTicketHistory(id, {
        page: historyPage,
        limit: 20
      })
      setHistory(response?.data || [])
      setHistoryTotalPages(response?.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Failed to load ticket history:', error)
      // Fallback: use history from ticket data if separate API fails
      if (ticket?.history) {
        setHistory(ticket.history)
        setHistoryTotalPages(1)
      }
    } finally {
      setHistoryLoading(false)
    }
  }

  async function loadComments() {
    setCommentsLoading(true)
    try {
      console.log('Fetching comments using getSupportTicketComments API for ticket:', id)
      const response = await adminService.getSupportTicketComments(id)
      console.log('Comments API response:', response)
      // The API returns the full ticket data with comments
      const commentsData = response?.data?.comments || response?.comments || []
      setComments(commentsData)
      setCommentsTotalPages(1) // Comments are usually not paginated in this API
    } catch (error) {
      console.error('Failed to load comments:', error)
      // Fallback: use comments from ticket data if separate API fails
      if (ticket?.comments) {
        setComments(ticket.comments)
        setCommentsTotalPages(1)
      }
    } finally {
      setCommentsLoading(false)
    }
  }

  async function sendComment() {
    if (!newComment.trim()) {
      showToast('Please enter a comment', 'error')
      return
    }
    
    setSendingComment(true)
    try {
      await adminService.addSupportTicketResponse(id, { 
        message: newComment,
        isInternal: true // This is an internal comment
      })
      showToast('Comment added successfully')
      setNewComment('')
      loadTicketHistory()
      loadComments() // Reload comments using the dedicated API
      // Refresh ticket data
      const updatedTicket = await adminService.getSupportTicket(id)
      setTicket(updatedTicket?.data || updatedTicket)
    } catch (err) {
      showToast(err.message || 'Failed to add comment', 'error')
    } finally {
      setSendingComment(false)
    }
  }

  async function sendResponse() {
    if (!newResponse.trim()) {
      showToast('Please enter a response', 'error')
      return
    }
    
    setSendingResponse(true)
    try {
      await adminService.addSupportTicketResponse(id, { 
        message: newResponse,
        isInternal: isInternal
      })
      showToast('Response sent successfully')
      setNewResponse('')
      setIsInternal(false)
      loadTicketHistory()
      loadComments() // Reload comments using the dedicated API
      // Refresh ticket data
      const updatedTicket = await adminService.getSupportTicket(id)
      setTicket(updatedTicket?.data || updatedTicket)
    } catch (err) {
      showToast(err.message || 'Failed to send response', 'error')
    } finally {
      setSendingResponse(false)
    }
  }

  async function updateStatus() {
    if (!newStatus) {
      showToast('Please select a status', 'error')
      return
    }
    
    setUpdatingStatus(true)
    try {
      const payload = { status: newStatus }
      if (newPriority) payload.priority = newPriority
      
      await adminService.updateSupportTicketStatus(id, payload)
      showToast('Status updated successfully')
      setStatusUpdateOpen(false)
      setNewStatus('')
      setNewPriority('')
      loadTicketHistory()
      // Refresh ticket data
      const updatedTicket = await adminService.getSupportTicket(id)
      setTicket(updatedTicket?.data || updatedTicket)
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error')
    } finally {
      setUpdatingStatus(false)
    }
  }

  function getStatusIcon(status) {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />
      case 'closed':
        return <XCircle className="w-4 h-4 text-gray-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  function getPriorityColor(priority) {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  function formatHistoryAction(action) {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  function parseHistoryValue(value) {
    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading support ticket...</p>
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Support ticket not found</h2>
        <button 
          onClick={() => navigate('/support')} 
          className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
        >
          Back to support tickets
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/support')} 
            className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Support Ticket #{ticket.id?.slice(0, 8)}</h2>
            <p className="text-sm text-gray-500">{ticket.subject}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusUpdateOpen(true)}
            className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
          >
            <Edit size={16} />
            Update Status
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        {/* Tab Headers */}
        <div className="px-5 pt-5">
          <nav className="flex space-x-2" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex items-center gap-2 px-4 py-3 rounded-t-lg font-medium text-sm transition-all ${
                activeTab === 'details'
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200 border-b-0 relative z-10'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700'
              }`}
            >
              <MessageSquare size={16} />
              Details
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-3 rounded-t-lg font-medium text-sm transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200 border-b-0 relative z-10'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700'
              }`}
            >
              <History size={16} />
              History
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex items-center gap-2 px-4 py-3 rounded-t-lg font-medium text-sm transition-all ${
                activeTab === 'comments'
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200 border-b-0 relative z-10'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700'
              }`}
            >
              <MessageSquare size={16} />
              Comments & Responses
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="border-t border-gray-200 bg-white">
          {activeTab === 'details' && (
            <div className="p-5">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Ticket Information */}
                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Ticket ID</div>
                        <div className="mt-1 font-medium text-gray-900">{ticket.id}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Status</div>
                        <div className="mt-1">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {getStatusIcon(ticket.status)}
                            {ticket.status}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Priority</div>
                        <div className="mt-1">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Category</div>
                        <div className="mt-1 font-medium text-gray-900 capitalize">{ticket.category || 'General'}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Created</div>
                        <div className="mt-1 font-medium text-gray-900">
                          {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Last Updated</div>
                        <div className="mt-1 font-medium text-gray-900">
                          {ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString() : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User Information */}
                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Name</div>
                        <div className="mt-1 font-medium text-gray-900">{ticket.name}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Email</div>
                        <div className="mt-1 font-medium text-gray-900">{ticket.email}</div>
                      </div>
                      {ticket.user && (
                        <>
                          <div>
                            <div className="text-gray-500">User ID</div>
                            <div className="mt-1 font-medium text-gray-900">{ticket.user.id}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">User Role</div>
                            <div className="mt-1 font-medium text-gray-900">{ticket.user.role || 'N/A'}</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Message</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{ticket.message}</p>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Status</span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {getStatusIcon(ticket.status)}
                          {ticket.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Priority</span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Comments</span>
                        <span className="font-medium text-gray-900">{comments.length || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">History Items</span>
                        <span className="font-medium text-gray-900">{history.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Staff */}
                  {ticket.assignedStaff && (
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Assigned Staff</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <div className="text-gray-500">Name</div>
                          <div className="mt-1 font-medium text-gray-900">{ticket.assignedStaff.name}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Email</div>
                          <div className="mt-1 font-medium text-gray-900">{ticket.assignedStaff.email}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="p-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Ticket History</h3>
                  <button
                    onClick={loadTicketHistory}
                    disabled={historyLoading}
                    className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    {historyLoading ? 'Loading...' : 'Refresh'}
                  </button>
                </div>

                {historyLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-sm text-gray-500">Loading history...</div>
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-sm text-gray-500">No history available for this ticket</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((item, index) => (
                      <div key={item.id} className="flex gap-4 p-4 rounded-lg border border-gray-200 bg-white">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <History className="w-4 h-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900">
                              {formatHistoryAction(item.action)}
                            </h4>
                            <time className="text-xs text-gray-500">
                              {new Date(item.createdAt).toLocaleString()}
                            </time>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          
                          {item.oldValue && item.newValue && (
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div className="bg-red-50 p-2 rounded">
                                <div className="font-medium text-red-800">Before:</div>
                                <div className="text-red-700">
                                  {typeof parseHistoryValue(item.oldValue) === 'object' 
                                    ? JSON.stringify(parseHistoryValue(item.oldValue), null, 2)
                                    : parseHistoryValue(item.oldValue)
                                  }
                                </div>
                              </div>
                              <div className="bg-green-50 p-2 rounded">
                                <div className="font-medium text-green-800">After:</div>
                                <div className="text-green-700">
                                  {typeof parseHistoryValue(item.newValue) === 'object' 
                                    ? JSON.stringify(parseHistoryValue(item.newValue), null, 2)
                                    : parseHistoryValue(item.newValue)
                                  }
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className="mt-2 text-xs text-gray-500">
                            Performed by: {item.user?.name || item.staff?.name || 'System'}
                            {item.user?.email && ` (${item.user.email})`}
                            {item.staff?.email && ` (${item.staff.email})`}
                            {item.performedByType && ` [${item.performedByType}]`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="p-5">
              <div className="space-y-6">
                {/* Add Comment */}
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Internal Comment</h3>
                  <div className="space-y-3">
                    <textarea
                      rows={3}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add an internal comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setNewComment('')}
                        className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
                      >
                        Clear
                      </button>
                      <button
                        onClick={sendComment}
                        disabled={sendingComment || !newComment.trim()}
                        className="rounded-md bg-gray-500 px-3 py-2 text-sm font-medium text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendingComment ? 'Adding...' : 'Add Comment'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Add Response */}
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Response to User</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isInternal"
                        checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="isInternal" className="text-sm text-gray-700">
                        Internal note (not visible to user)
                      </label>
                    </div>
                    <textarea
                      rows={4}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Write your response to the user..."
                      value={newResponse}
                      onChange={(e) => setNewResponse(e.target.value)}
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setNewResponse('')
                          setIsInternal(false)
                        }}
                        className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
                      >
                        Clear
                      </button>
                      <button
                        onClick={sendResponse}
                        disabled={sendingResponse || !newResponse.trim()}
                        className="rounded-md bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendingResponse ? 'Sending...' : 'Send Response'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Comments and Responses */}
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Comments & Responses</h3>
                    <button
                      onClick={loadComments}
                      disabled={commentsLoading}
                      className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                      {commentsLoading ? 'Loading...' : 'Refresh'}
                    </button>
                  </div>
                  {commentsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-sm text-gray-500">Loading comments...</div>
                    </div>
                  ) : !comments || comments.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-sm text-gray-500">No comments or responses yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {comments.map((comment) => {
                        // Determine author name and type
                        const authorName = comment.authorType === 'user' 
                          ? (comment.user?.name || 'User')
                          : (comment.staff?.name || 'Staff')
                        const authorEmail = comment.authorType === 'user' 
                          ? comment.user?.email 
                          : comment.staff?.email

                        // Determine color scheme based on author type
                        const getCommentColors = () => {
                          if (comment.authorType === 'user') {
                            return {
                              container: 'border-red-200 bg-red-50',
                              badge: 'bg-red-100 text-red-800',
                              text: 'text-red-900'
                            }
                          } else if (comment.authorType === 'staff') {
                            // Check if it's super admin
                            const isSuperAdmin = comment.staff?.email === 'superadmin@admin.com' || 
                                               comment.staff?.name === 'Super Admin'
                            if (isSuperAdmin) {
                              return {
                                container: 'border-green-200 bg-green-50',
                                badge: 'bg-green-100 text-green-800',
                                text: 'text-green-900'
                              }
                            } else {
                              return {
                                container: 'border-yellow-200 bg-yellow-50',
                                badge: 'bg-yellow-100 text-yellow-800',
                                text: 'text-yellow-900'
                              }
                            }
                          }
                          // Default fallback
                          return {
                            container: 'border-gray-200 bg-gray-50',
                            badge: 'bg-gray-100 text-gray-800',
                            text: 'text-gray-900'
                          }
                        }

                        const colors = getCommentColors()

                        return (
                          <div key={comment.id} className={`p-4 rounded-lg border ${colors.container}`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                                  comment.isInternal 
                                    ? 'bg-orange-100 text-orange-800' 
                                    : colors.badge
                                }`}>
                                  {comment.isInternal ? (
                                    <>
                                      <EyeOff size={12} />
                                      Internal
                                    </>
                                  ) : (
                                    <>
                                      <Eye size={12} />
                                      Public
                                    </>
                                  )}
                                </span>
                                <span className={`text-sm font-medium ${colors.text}`}>
                                  {authorName}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({comment.authorType})
                                </span>
                                {authorEmail && (
                                  <span className="text-xs text-gray-400">
                                    {authorEmail}
                                  </span>
                                )}
                              </div>
                              <time className="text-xs text-gray-500">
                                {new Date(comment.createdAt).toLocaleString()}
                              </time>
                            </div>
                            <p className={`text-sm ${colors.text} whitespace-pre-wrap`}>{comment.message}</p>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      {statusUpdateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setStatusUpdateOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-200 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-base font-semibold text-gray-900">Update Status</div>
              <button 
                onClick={() => setStatusUpdateOpen(false)} 
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority (Optional)</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Keep Current</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
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
                  disabled={updatingStatus || !newStatus}
                  className="rounded-md bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingStatus ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SupportView
