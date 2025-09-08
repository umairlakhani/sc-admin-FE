import { useState } from 'react'
import { propertiesData, usersData, matchingRules, matchingSettings } from '../data'
import { Plus, MoreVertical, Eye, Pencil, Trash2, Upload, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

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

function Properties() {
  const navigate = useNavigate()
  const [rows, setRows] = useState(propertiesData)
  const [menuOpen, setMenuOpen] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [current, setCurrent] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [rulesOpen, setRulesOpen] = useState(false)
  const [rules, setRules] = useState(matchingRules)
  const [settings, setSettings] = useState(matchingSettings)
  const [availableAttributes, setAvailableAttributes] = useState(['bedrooms','location_radius_km','price','type','areaSqft'])
  const [newAttribute, setNewAttribute] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const start = (page - 1) * pageSize
  const pageRows = rows.slice(start, start + pageSize)

  function openCreate() {
    setCurrent({
      id: '',
      title: '',
      type: 'Apartment',
      price: 0,
      currency: 'INR',
      bedrooms: 0,
      bathrooms: 0,
      areaSqft: 0,
      location: { address: '', city: '', state: '', country: 'India', lat: '', lng: '' },
      ownerId: usersData[0]?.id || '',
      status: 'Listed',
      images: [],
    })
    setCreateOpen(true)
  }

  function saveProperty() {
    if (!current.title) return
    setRows((prev) => {
      const exists = prev.some((p) => p.id === current.id && current.id)
      if (exists) return prev.map((p) => (p.id === current.id ? { ...current } : p))
      const id = `p-${Math.floor(Math.random() * 9000) + 1000}`
      return [{ ...current, id }, ...prev]
    })
    setCreateOpen(false)
    setEditOpen(false)
  }

  function confirmDelete(row) {
    setCurrent(row)
    setDeleteOpen(true)
  }

  function doDelete() {
    setRows((prev) => prev.filter((r) => r.id !== current.id))
    setDeleteOpen(false)
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Manage Properties</h2>
        <div className="inline-flex items-center gap-2">
          <button onClick={() => setRulesOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50">
            <Settings size={16} /> Matching rules
          </button>
          <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600">
            <Plus size={16} /> New property
          </button>
        </div>
      </div>

      <div className="flex-1 rounded-2xl border border-gray-200 bg-white flex flex-col">
        <div className="overflow-x-auto overflow-y-visible flex-1 min-h-[360px]">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Beds</th>
                <th className="px-4 py-3">Baths</th>
                <th className="px-4 py-3">Area (sqft)</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((p) => (
                <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.title}</td>
                  <td className="px-4 py-3 text-gray-800">{p.type}</td>
                  <td className="px-4 py-3 text-gray-800">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: p.currency }).format(p.price)}</td>
                  <td className="px-4 py-3 text-gray-800">{p.bedrooms}</td>
                  <td className="px-4 py-3 text-gray-800">{p.bathrooms}</td>
                  <td className="px-4 py-3 text-gray-800">{p.areaSqft}</td>
                  <td className="px-4 py-3 text-gray-800">{p.location.city}, {p.location.state}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.status === 'Listed' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <button
                        className="ml-auto flex items-center rounded-md border border-gray-200 bg-white p-2 hover:bg-gray-100"
                        onClick={() => setMenuOpen(menuOpen === p.id ? '' : p.id)}
                      >
                        <MoreVertical size={16} />
                      </button>
                      {menuOpen === p.id && (
                        <div className="absolute right-0 z-50 mt-2 w-40 rounded-md border border-gray-200 bg-white shadow-md">
                          <button onClick={() => { setMenuOpen(''); navigate(`/properties/${p.id}`) }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50">
                            <Eye size={14} /> View
                          </button>
                          <button onClick={() => { setMenuOpen(''); setCurrent(p); setEditOpen(true) }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50">
                            <Pencil size={14} /> Edit
                          </button>
                          <button onClick={() => { setMenuOpen(''); confirmDelete(p) }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
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

        <div className="mt-auto border-t border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="text-xs text-gray-500">Page {page} of {totalPages}</div>
          <div className="inline-flex items-center gap-1">
            <button className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm disabled:opacity-50" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
            {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => {
              const n = i + 1
              return (
                <button key={n} onClick={() => setPage(n)} className={`rounded-md px-2 py-1 text-sm border ${n === page ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white border-gray-200'}`}>{n}</button>
              )
            })}
            <button className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm disabled:opacity-50" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
          </div>
        </div>
      </div>

      {/* Create/Edit property */}
      <Modal open={createOpen || editOpen} onClose={() => { setCreateOpen(false); setEditOpen(false) }} title={current?.id ? 'Edit property' : 'Create property'}>
        {current && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm text-gray-700">Title</label>
                <input value={current.title} onChange={(e) => setCurrent((p) => ({ ...p, title: e.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-700">Type</label>
                <select value={current.type} onChange={(e) => setCurrent((p) => ({ ...p, type: e.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option>Apartment</option>
                  <option>Villa</option>
                  <option>Office</option>
                  <option>Plot</option>
                  <option>House</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-700">Price</label>
                <input type="number" value={current.price} onChange={(e) => setCurrent((p) => ({ ...p, price: parseFloat(e.target.value) || 0 }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-700">Currency</label>
                <select value={current.currency} onChange={(e) => setCurrent((p) => ({ ...p, currency: e.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option>INR</option>
                  <option>USD</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-700">Bedrooms</label>
                <input type="number" value={current.bedrooms} onChange={(e) => setCurrent((p) => ({ ...p, bedrooms: parseInt(e.target.value) || 0 }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-700">Bathrooms</label>
                <input type="number" value={current.bathrooms} onChange={(e) => setCurrent((p) => ({ ...p, bathrooms: parseInt(e.target.value) || 0 }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-700">Area (sqft)</label>
                <input type="number" value={current.areaSqft} onChange={(e) => setCurrent((p) => ({ ...p, areaSqft: parseInt(e.target.value) || 0 }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-700">Owner</label>
                <select value={current.ownerId} onChange={(e) => setCurrent((p) => ({ ...p, ownerId: e.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  {usersData.map((u) => (
                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm text-gray-700">Address</label>
                <input value={current.location.address} onChange={(e) => setCurrent((p) => ({ ...p, location: { ...p.location, address: e.target.value } }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-700">City</label>
                <input value={current.location.city} onChange={(e) => setCurrent((p) => ({ ...p, location: { ...p.location, city: e.target.value } }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-700">State</label>
                <input value={current.location.state} onChange={(e) => setCurrent((p) => ({ ...p, location: { ...p.location, state: e.target.value } }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-700">Country</label>
                <input value={current.location.country} onChange={(e) => setCurrent((p) => ({ ...p, location: { ...p.location, country: e.target.value } }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-700">Latitude</label>
                <input value={current.location.lat} onChange={(e) => setCurrent((p) => ({ ...p, location: { ...p.location, lat: e.target.value } }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-700">Longitude</label>
                <input value={current.location.lng} onChange={(e) => setCurrent((p) => ({ ...p, location: { ...p.location, lng: e.target.value } }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-700">Images</label>
              <div className="flex items-center gap-2">
                <button className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"><Upload size={14} /> Upload</button>
                <span className="text-xs text-gray-500">(Mock only)</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button onClick={() => { setCreateOpen(false); setEditOpen(false) }} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={saveProperty} className="rounded-md bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600">Save</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete property">
        <div className="space-y-4">
          <p className="text-sm text-gray-700">Are you sure you want to delete <span className="font-medium">{current?.title}</span>?</p>
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setDeleteOpen(false)} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={doDelete} className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700">Delete</button>
          </div>
        </div>
      </Modal>

      {/* Matching rules */}
      <Modal open={rulesOpen} onClose={() => setRulesOpen(false)} title="Property matching rules">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-700">Overall threshold (%)</label>
            <input type="number" value={settings.overallThresholdPct} onChange={(e) => setSettings((s) => ({ ...s, overallThresholdPct: parseInt(e.target.value) || 0 }))} className="w-32 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="px-3 py-2">Enabled</th>
                  <th className="px-3 py-2">Attribute</th>
                  <th className="px-3 py-2">Operator</th>
                  <th className="px-3 py-2">Value</th>
                  <th className="px-3 py-2">Weight (%)</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {rules.map((r, idx) => (
                  <tr key={r.id} className="border-t border-gray-100">
                    <td className="px-3 py-2"><input type="checkbox" checked={r.enabled} onChange={(e) => setRules((arr) => arr.map((x, i) => i === idx ? { ...x, enabled: e.target.checked } : x))} /></td>
                    <td className="px-3 py-2">
                      <select value={r.attribute} onChange={(e) => setRules((arr) => arr.map((x, i) => i === idx ? { ...x, attribute: e.target.value } : x))} className="rounded-md border border-gray-300 px-2 py-1">
                        {availableAttributes.map((attr) => (
                          <option key={attr} value={attr}>{attr}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <select value={r.operator} onChange={(e) => setRules((arr) => arr.map((x, i) => i === idx ? { ...x, operator: e.target.value } : x))} className="rounded-md border border-gray-300 px-2 py-1">
                        <option>{'=='}</option>
                        <option>{'>='}</option>
                        <option>{'<='}</option>
                      </select>
                    </td>
                    <td className="px-3 py-2"><input value={r.value} onChange={(e) => setRules((arr) => arr.map((x, i) => i === idx ? { ...x, value: isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value) } : x))} className="w-full rounded-md border border-gray-300 px-2 py-1" /></td>
                    <td className="px-3 py-2 w-32"><input type="number" value={r.weightPct} onChange={(e) => setRules((arr) => arr.map((x, i) => i === idx ? { ...x, weightPct: parseInt(e.target.value) || 0 } : x))} className="w-full rounded-md border border-gray-300 px-2 py-1" /></td>
                    <td className="px-3 py-2 text-right">
                      <button onClick={() => setRules((arr) => arr.filter((_, i) => i !== idx))} className="text-sm text-red-600 hover:underline">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-end gap-2">
            <div>
              <label className="mb-1 block text-sm text-gray-700">Add new attribute</label>
              <input value={newAttribute} onChange={(e) => setNewAttribute(e.target.value)} placeholder="e.g. furnishing, pets_allowed" className="w-64 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <button
              onClick={() => { if (newAttribute && !availableAttributes.includes(newAttribute)) { setAvailableAttributes((a) => [...a, newAttribute]); setNewAttribute('') } }}
              className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
            >
              Add attribute
            </button>
          </div>
          <div className="flex items-center justify-between">
            <button onClick={() => setRules((arr) => [...arr, { id: `r-${Math.floor(Math.random()*9000)+1000}`, attribute: 'bedrooms', operator: '>=', value: 1, weightPct: 10, enabled: true }])} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50">Add rule</button>
            <button onClick={() => setRulesOpen(false)} className="rounded-md bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600">Done</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Properties


