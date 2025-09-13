import { useState, useEffect } from 'react'
import { plansData } from '../data'
import { Plus, Trash2, Download, Eye, MoreVertical, ExternalLink } from 'lucide-react'
import { adminService } from '../lib/api'
import Pagination from '../components/Pagination'

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl bg-white shadow-xl border border-gray-200 p-6 overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-lg font-semibold text-gray-900">{title}</div>
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Billing() {
  // Subscription analytics state
  const [analytics, setAnalytics] = useState(null)
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState(null)
  const [planDetails, setPlanDetails] = useState(null)
  const [userDetails, setUserDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  // Stripe invoices state
  const [invoices, setInvoices] = useState([])
  const [invoiceLoading, setInvoiceLoading] = useState(false)
  const [invoicePage, setInvoicePage] = useState(1)
  const [invoiceTotalPages, setInvoiceTotalPages] = useState(1)
  const [invoiceFilters, setInvoiceFilters] = useState({
    status: '',
    currency: '',
    period: '7d'
  })

  // Tab state
  const [activeTab, setActiveTab] = useState('subscriptions')

  // Load analytics data
  async function loadAnalytics() {
    try {
      const response = await adminService.getSubscriptionAnalytics({ period: '7d' })
      setAnalytics(response?.data || response)
    } catch (error) {
      console.error('Error loading analytics:', error)
      // Set fallback data
      setAnalytics({
        summary: {
          totalSubscribedUsers: 0,
          newSubscriptions: 0,
          totalIncome: 0,
          totalRefunds: 0,
          netProfit: 0
        }
      })
    }
  }

  // Load subscriptions data
  async function loadSubscriptions() {
    setLoading(true)
    try {
      const response = await adminService.getSubscriptions({ page, limit: 20 })
      setSubscriptions(response?.data?.subscriptions || response?.subscriptions || [])
      setTotalPages(response?.data?.totalPages || response?.totalPages || 1)
    } catch (error) {
      console.error('Error loading subscriptions:', error)
      setSubscriptions([])
    } finally {
      setLoading(false)
    }
  }

  // Load Stripe invoices data
  async function loadInvoices() {
    setInvoiceLoading(true)
    try {
      const params = {
        page: invoicePage,
        // limit: 6,
        period: invoiceFilters.period,
        ...(invoiceFilters.status && { status: invoiceFilters.status }),
        ...(invoiceFilters.currency && { currency: invoiceFilters.currency })
      }
      const response = await adminService.getStripeInvoices(params)
      setInvoices(response?.data?.invoices || response?.invoices || [])
      setInvoiceTotalPages(response?.data?.totalPages || response?.totalPages || 1)
    } catch (error) {
      console.error('Error loading invoices:', error)
      setInvoices([])
    } finally {
      setInvoiceLoading(false)
    }
  }

  // Load data on component mount and page change
  useEffect(() => {
    loadAnalytics()
    loadSubscriptions()
  }, [page])

  // Load invoices when invoices tab is active or filters change
  useEffect(() => {
    if (activeTab === 'invoices') {
      loadInvoices()
    }
  }, [activeTab, invoicePage, invoiceFilters])

  async function openView(subscription) {
    setSelectedSubscription(subscription)
    setViewModalOpen(true)
    setLoadingDetails(true)
    setPlanDetails(null)
    setUserDetails(null)

    try {
      // Load plan and user details in parallel
      const [planResponse, userResponse] = await Promise.allSettled([
        adminService.getPlanDetails(subscription.planId),
        adminService.getUserDetails(subscription.userId)
      ])

      if (planResponse.status === 'fulfilled') {
        setPlanDetails(planResponse.value?.data || planResponse.value)
      }

      if (userResponse.status === 'fulfilled') {
        setUserDetails(userResponse.value?.data || userResponse.value)
      }
    } catch (error) {
      console.error('Error loading subscription details:', error)
    } finally {
      setLoadingDetails(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Subscriptions & Payments</h2>
        <div className="inline-flex items-center gap-2">
          <button className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50">Stripe Dashboard</button>
        </div>
      </div>

      {/* Subscriptions overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card 
          label="Total Subscribed Users" 
          value={analytics?.summary?.totalSubscribedUsers?.toLocaleString() || '0'} 
        />
        <Card 
          label="New Subscriptions (7d)" 
          value={analytics?.summary?.newSubscriptions?.toLocaleString() || '0'} 
        />
        <Card 
          label="Total Income" 
          value={`£${analytics?.summary?.totalIncome?.toLocaleString() || '0'}`} 
        />
        <Card 
          label="Net Profit" 
          value={`£${analytics?.summary?.netProfit?.toLocaleString() || '0'}`} 
        />
      </div>


      {/* Tabs */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        {/* Tab Headers */}
        <div className="px-5 pt-5">
          <nav className="flex space-x-2" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`flex items-center gap-2 px-4 py-3 rounded-t-lg font-medium text-sm transition-all ${
                activeTab === 'subscriptions'
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200 border-b-0 relative z-10'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Subscriptions
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`flex items-center gap-2 px-4 py-3 rounded-t-lg font-medium text-sm transition-all ${
                activeTab === 'invoices'
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200 border-b-0 relative z-10'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Invoices
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="border-t border-gray-200 bg-white">
          {activeTab === 'subscriptions' && (
            <div>
              <div className="px-5 py-3 text-base font-semibold text-gray-900">Recent Subscriptions</div>
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-sm text-gray-500">Loading subscriptions...</div>
                  </div>
                ) : subscriptions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Download size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions found</h3>
                    <p className="text-sm text-gray-500 text-center max-w-sm">
                      There are no subscriptions to display at the moment. Check back later or try refreshing the page.
                    </p>
                  </div>
                ) : (
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                        <th className="px-4 py-3">User ID</th>
                        <th className="px-4 py-3">Plan ID</th>
                        <th className="px-4 py-3">Platform</th>
                        <th className="px-4 py-3">Interval</th>
                        <th className="px-4 py-3">Matching Count</th>
                        <th className="px-4 py-3">Transaction Date</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                      {subscriptions.map((subscription) => (
                        <tr key={subscription.id} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {subscription.userId?.substring(0, 8)}...
                          </td>
                          <td className="px-4 py-3 text-gray-800">
                            {subscription.planId?.substring(0, 20)}...
                          </td>
                          <td className="px-4 py-3 text-gray-800 capitalize">
                            {subscription.platform || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-gray-800 capitalize">
                            {subscription.interval || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-gray-800">
                            {subscription.matchingCount || 0}
                          </td>
                          <td className="px-4 py-3 text-gray-800">
                            {subscription.transactionDate ? 
                              new Date(subscription.transactionDate).toLocaleDateString() : 
                              'N/A'
                            }
                          </td>
                        <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              subscription.cancelledAt ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                            }`}>
                              {subscription.cancelledAt ? 'Cancelled' : 'Active'}
                            </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button 
                              onClick={() => openView(subscription)}
                              className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-600 hover:bg-gray-50"
                          >
                              <Eye size={14} /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                )}
              </div>
              
              {/* Table Info and Pagination */}
              <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-gray-600">
                    Showing {subscriptions.length} subscription{subscriptions.length !== 1 ? 's' : ''} 
                    {totalPages > 1 && ` • Page ${page} of ${totalPages}`}
                  </div>
                  <div className="text-sm text-gray-500">
                    {loading && 'Loading...'}
                  </div>
                </div>
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </div>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div>
              <div className="px-5 py-3 text-base font-semibold text-gray-900">Stripe Invoices</div>
              
              {/* Filters */}
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Status:</label>
                    <select
                      value={invoiceFilters.status}
                      onChange={(e) => setInvoiceFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="rounded-lg border border-gray-300 px-3 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">All Status</option>
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Currency:</label>
                    <select
                      value={invoiceFilters.currency}
                      onChange={(e) => setInvoiceFilters(prev => ({ ...prev, currency: e.target.value }))}
                      className="rounded-lg border border-gray-300 px-3 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">All Currencies</option>
                      <option value="CHF">CHF</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Period:</label>
                    <select
                      value={invoiceFilters.period}
                      onChange={(e) => setInvoiceFilters(prev => ({ ...prev, period: e.target.value }))}
                      className="rounded-lg border border-gray-300 px-3 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="7d">Last 7 days</option>
                      <option value="30d">Last 30 days</option>
                      <option value="90d">Last 90 days</option>
                      <option value="1y">Last year</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                {invoiceLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-sm text-gray-500">Loading invoices...</div>
                  </div>
                ) : invoices.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Download size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
                    <p className="text-sm text-gray-500 text-center max-w-sm">
                      There are no invoices to display for the selected filters. Try adjusting your filters or check back later.
                    </p>
                  </div>
                ) : (
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="px-4 py-3">Invoice #</th>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Created</th>
                        <th className="px-4 py-3">Paid At</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {invoice.number}
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium text-gray-900">{invoice.customerName}</div>
                              <div className="text-xs text-gray-500">{invoice.customerEmail}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-gray-900">
                              {invoice.currency} {invoice.amountPaid?.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              invoice.status === 'paid' ? 'bg-green-50 text-green-700' :
                              invoice.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                              'bg-red-50 text-red-700'
                            }`}>
                              {invoice.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-800">
                            {new Date(invoice.created).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-gray-800">
                            {invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {invoice.hostedInvoiceUrl && (
                                <a
                                  href={invoice.hostedInvoiceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-600 hover:bg-gray-50"
                                >
                                  <Eye size={14} /> View
                                </a>
                              )}
                              {invoice.invoicePdf && (
                                <a
                                  href={invoice.invoicePdf}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-600 hover:bg-gray-50"
                                >
                                  <Download size={14} /> PDF
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              
              {/* Invoice Table Info and Pagination */}
              <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-gray-600">
                    Showing {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} 
                    {invoiceTotalPages > 1 && ` • Page ${invoicePage} of ${invoiceTotalPages}`}
                  </div>
                  <div className="text-sm text-gray-500">
                    {invoiceLoading && 'Loading...'}
                  </div>
                </div>
                <Pagination page={invoicePage} totalPages={invoiceTotalPages} onChange={setInvoicePage} />
              </div>
            </div>
          )}
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


      {/* Subscription View Modal */}
      <Modal open={viewModalOpen} onClose={() => setViewModalOpen(false)} title="Subscription Details">
        {selectedSubscription && (
          <div className="space-y-6">
            {/* Status Header */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  selectedSubscription.cancelledAt ? 'bg-red-500' : 'bg-green-500'
                }`}></div>
            <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedSubscription.cancelledAt ? 'Cancelled Subscription' : 'Active Subscription'}
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      {selectedSubscription.transactionDate ? 
                        `Created on ${new Date(selectedSubscription.transactionDate).toLocaleDateString()}` : 
                        'No creation date available'
                      }
                    </p>
                    {loadingDetails ? (
                      <p className="text-blue-600">Loading details...</p>
                    ) : (
                      <div className="flex items-center gap-4">
                        {planDetails?.name && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Plan: {planDetails.name}
                          </span>
                        )}
                        {userDetails?.name && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            User: {userDetails.name}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                selectedSubscription.cancelledAt 
                  ? 'bg-red-100 text-red-800 border border-red-200' 
                  : 'bg-green-100 text-green-800 border border-green-200'
              }`}>
                {selectedSubscription.cancelledAt ? 'Cancelled' : 'Active'}
              </span>
            </div>

            {/* Main Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Subscription Info */}
              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Subscription Information
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Subscription ID</label>
                      <div className="text-sm font-mono text-gray-900 bg-white px-3 py-2 rounded border break-all">
                        {selectedSubscription.id}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Plan</label>
                      <div className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                        {planDetails?.name || 'Loading...'}
                        {planDetails?.price && (
                          <span className="ml-2 text-green-600 font-semibold">
                            £{planDetails.price}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 font-mono break-all">
                        ID: {selectedSubscription.planId}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Customer ID</label>
                      <div className="text-sm font-mono text-gray-900 bg-white px-3 py-2 rounded border break-all">
                        {selectedSubscription.customerId || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Column - User & Platform */}
              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    User & Platform Details
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">User</label>
                      <div className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                        {userDetails?.name || userDetails?.email || 'Loading...'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 font-mono break-all">
                        ID: {selectedSubscription.userId}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Platform</label>
                      <div className="text-sm font-semibold text-gray-900 capitalize bg-white px-3 py-2 rounded border">
                        {selectedSubscription.platform || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Payment Method</label>
                      <div className="text-sm font-semibold text-gray-900 capitalize bg-white px-3 py-2 rounded border">
                        {selectedSubscription.paymentMethod || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Billing Interval</label>
                      <div className="text-sm font-semibold text-gray-900 capitalize bg-white px-3 py-2 rounded border">
                        {selectedSubscription.interval || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Usage & Transaction */}
              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Usage Limits
                  </h4>
                  <div className="space-y-4">
            <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Matching Count</label>
                      <div className="text-xl font-bold text-gray-900 bg-white px-3 py-2 rounded border text-center">
                        {selectedSubscription.matchingCount || 0}
                      </div>
            </div>
            <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Monthly Limit</label>
                      <div className="text-xl font-bold text-gray-900 bg-white px-3 py-2 rounded border text-center">
                        {selectedSubscription.totalMonthlyCount || 0}
                      </div>
            </div>
            <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Yearly Limit</label>
                      <div className="text-xl font-bold text-gray-900 bg-white px-3 py-2 rounded border text-center">
                        {selectedSubscription.totalYearlyCount || 0}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Transaction Details
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Transaction Date</label>
                      <div className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                        {selectedSubscription.transactionDate ? 
                          new Date(selectedSubscription.transactionDate).toLocaleString() : 
                          'N/A'
                        }
                      </div>
                    </div>
                    {selectedSubscription.cancelledAt && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Cancelled At</label>
                        <div className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                          {new Date(selectedSubscription.cancelledAt).toLocaleString()}
                        </div>
                      </div>
                    )}
                    {selectedSubscription.cancelReason && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Cancel Reason</label>
                        <div className="text-sm text-gray-900 bg-red-50 px-3 py-2 rounded border border-red-200">
                          {selectedSubscription.cancelReason}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button 
                onClick={() => setViewModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Close
              </button>
              {!selectedSubscription.cancelledAt && (
                <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                  Cancel Subscription
            </button>
              )}
            </div>
          </div>
        )}
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


