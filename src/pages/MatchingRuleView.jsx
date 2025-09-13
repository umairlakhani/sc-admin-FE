import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { adminService } from '../lib/api'
import PermissionButton from '../components/PermissionButton'
import { showToast } from '../lib/toast'

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

const MatchingRuleView = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [rule, setRule] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [language, setLanguage] = useState('en')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [ruleForm, setRuleForm] = useState({
    name: '',
    description: '',
    options: []
  })

  useEffect(() => {
    if (id) {
      loadRule()
    }
  }, [id, language])

  const loadRule = async () => {
    try {
      setLoading(true)
      const response = await adminService.getMatchingRule(id, { language })
      setRule(response.data)
      setRuleForm({
        name: response.data.name,
        description: response.data.description,
        options: response.data.options || []
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const openEdit = () => {
    setEditModalOpen(true)
  }

  const updateItem = async () => {
    try {
      setSaving(true)
      await adminService.updateMatchingRule(id, ruleForm)
      setEditModalOpen(false)
      loadRule() // Reload the rule data
      showToast('Rule updated successfully')
    } catch (err) {
      showToast(err.message || 'Failed to update rule', 'error')
    } finally {
      setSaving(false)
    }
  }

  const addOption = () => {
    setRuleForm(prev => ({
      ...prev,
      options: [...prev.options, {
        label: '',
        value: '',
        comparator_type: 'equal',
        language: 'en'
      }]
    }))
  }

  const updateOption = (index, field, value) => {
    setRuleForm(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === index ? { ...option, [field]: value } : option
      )
    }))
  }

  const removeOption = (index) => {
    setRuleForm(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading rule details...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">Error: {error}</div>
      </div>
    )
  }

  if (!rule) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="text-yellow-800">Rule not found</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{rule.name}</h1>
          <p className="text-gray-600">Rule Details & Options</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Language:</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="en">English</option>
              <option value="de">German</option>
              <option value="fr">French</option>
              <option value="it">Italian</option>
            </select>
          </div>
          <button
            onClick={() => navigate('/matching-rules')}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Rules</span>
          </button>
        </div>
      </div>

      {/* Content Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Rule Name:</span>
                  <p className="text-sm text-gray-900 mt-1">{rule.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Description:</span>
                  <p className="text-sm text-gray-900 mt-1">{rule.description}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Options Count:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                    {rule.options?.length || 0} options
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Rule Options */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Rule Options</h3>
              </div>
            </div>
            <div className="p-4">
              {rule.options && rule.options.length > 0 ? (
                <div className="space-y-3">
                  {rule.options.map((option, index) => (
                    <div key={option.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center space-x-6">
                        <div>
                          <span className="text-sm font-medium text-gray-900">{option.label}</span>
                          <p className="text-xs text-gray-500">Label</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900">{option.value}</span>
                          <p className="text-xs text-gray-500">Value</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900">{option.comparator_type}</span>
                          <p className="text-xs text-gray-500">Comparator</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900">{option.language}</span>
                          <p className="text-xs text-gray-500">Language</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No options defined for this rule.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Details */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Account Details</h3>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Rule ID:</span>
                <p className="text-sm text-gray-900 font-mono mt-1">{rule.id}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Created At:</span>
                <p className="text-sm text-gray-900 mt-1">{new Date(rule.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Last Updated:</span>
                <p className="text-sm text-gray-900 mt-1">{new Date(rule.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Edit Options */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Edit Options</h3>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {rule.options && rule.options.map((option, index) => (
                  <div key={option.id || index} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-900">{option.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-4">
              <PermissionButton permission="properties.update">
                <button
                  onClick={openEdit}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Edit Rule
                </button>
              </PermissionButton>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Rule">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rule Name *</label>
            <input
              type="text"
              value={ruleForm.name}
              onChange={(e) => setRuleForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={100}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              value={ruleForm.description}
              onChange={(e) => setRuleForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              maxLength={500}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="en">English</option>
              <option value="de">German</option>
              <option value="fr">French</option>
              <option value="it">Italian</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-lg font-medium text-gray-900">Rule Options</h4>
              <button
                type="button"
                onClick={addOption}
                className="px-3 py-1 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
              >
                + Add Option
              </button>
            </div>
            
            {ruleForm.options.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {ruleForm.options.map((option, index) => (
                  <div key={index} className="flex gap-2 items-center p-2 border border-gray-200 rounded-md bg-gray-50">
                    <input
                      type="text"
                      placeholder="Label"
                      value={option.label}
                      onChange={(e) => updateOption(index, 'label', e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={option.value}
                      onChange={(e) => updateOption(index, 'value', e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <select
                      value={option.comparator_type}
                      onChange={(e) => updateOption(index, 'comparator_type', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="equal">Equal</option>
                      <option value="greater">Greater</option>
                      <option value="less">Less</option>
                      <option value="greater-equal">Greater or Equal</option>
                      <option value="less-equal">Less or Equal</option>
                      <option value="none">None</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="px-2 py-1 text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => setEditModalOpen(false)}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={updateItem}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default MatchingRuleView
