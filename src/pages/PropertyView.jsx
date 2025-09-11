import { useMemo, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { propertiesData, usersData } from '../data'

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-2xl border border-gray-200 bg-white">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between px-5 py-3">
        <div className="text-base font-semibold text-gray-900">{title}</div>
        <span className="text-sm text-gray-500">{open ? 'Hide' : 'Show'}</span>
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  )
}

function PropertyView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const property = propertiesData.find((p) => p.id === id)
  const owner = usersData.find((u) => u.id === property?.ownerId)
  const currency = useMemo(
    () => new Intl.NumberFormat('en-IN', { style: 'currency', currency: property?.currency || 'INR' }),
    [property?.currency]
  )
  const [propRules, setPropRules] = useState({})
  const [customRules, setCustomRules] = useState([])
  const [attributes, setAttributes] = useState(['bedrooms','bathrooms','price','type','location_radius_km','areaSqft'])
  const [newAttr, setNewAttr] = useState('')

  useEffect(() => {
    if (!property) return
    const key = `prop_rules_${property.id}`
    const saved = localStorage.getItem(key)
    if (saved) {
      setPropRules(JSON.parse(saved))
    } else {
      setPropRules({ bedrooms: true, bathrooms: true, price: true, type: true, location_radius_km: true, areaSqft: false })
    }
    const key2 = `prop_custom_rules_${property.id}`
    const saved2 = localStorage.getItem(key2)
    if (saved2) setCustomRules(JSON.parse(saved2))
  }, [property?.id])

  function savePropRules() {
    if (!property) return
    const key = `prop_rules_${property.id}`
    localStorage.setItem(key, JSON.stringify(propRules))
  }

  function saveCustomRules() {
    if (!property) return
    const key = `prop_custom_rules_${property.id}`
    localStorage.setItem(key, JSON.stringify(customRules))
  }

  if (!property) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Property not found</h2>
        <button onClick={() => navigate('/properties')} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50">Back to properties</button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">{property.title}</h2>
        <button onClick={() => navigate('/properties')} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50">Back</button>
      </div>

      {/* Image slider */}
      <div className="rounded-2xl border border-gray-200 bg-white p-2">
        {property.images?.length ? (
          <Slider images={property.images} />
        ) : (
          <div className="p-5 text-sm text-gray-500">No images uploaded.</div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Section title="Overview">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Type</div>
                <div className="mt-1 font-medium text-gray-900">{property.type}</div>
              </div>
              <div>
                <div className="text-gray-500">Price</div>
                <div className="mt-1 font-medium text-gray-900">{property.price}</div>

                {/* <div className="mt-1 font-medium text-gray-900">{currency.format(property.price)}</div> */}
              </div>
              <div>
                <div className="text-gray-500">Bedrooms</div>
                <div className="mt-1 font-medium text-gray-900">{property.bedrooms}</div>
              </div>
              <div>
                <div className="text-gray-500">Bathrooms</div>
                <div className="mt-1 font-medium text-gray-900">{property.bathrooms}</div>
              </div>
              <div>
                <div className="text-gray-500">Area (sqft)</div>
                <div className="mt-1 font-medium text-gray-900">{property.areaSqft}</div>
              </div>
              <div>
                <div className="text-gray-500">Status</div>
                <div className="mt-1">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    property.status === 'Listed' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {property.status}
                  </span>
                </div>
              </div>
            </div>
          </Section>

          <Section title="Location">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Address</div>
                <div className="mt-1 font-medium text-gray-900">{property.location.address}</div>
              </div>
              <div>
                <div className="text-gray-500">City</div>
                <div className="mt-1 font-medium text-gray-900">{property.location.city}</div>
              </div>
              <div>
                <div className="text-gray-500">State</div>
                <div className="mt-1 font-medium text-gray-900">{property.location.state}</div>
              </div>
              <div>
                <div className="text-gray-500">Country</div>
                <div className="mt-1 font-medium text-gray-900">{property.location.country}</div>
              </div>
              <div>
                <div className="text-gray-500">Latitude</div>
                <div className="mt-1 font-medium text-gray-900">{property.location.lat}</div>
              </div>
              <div>
                <div className="text-gray-500">Longitude</div>
                <div className="mt-1 font-medium text-gray-900">{property.location.lng}</div>
              </div>
            </div>
            <div className="mt-4">
              <MapPreview lat={property.location.lat} lng={property.location.lng} />
              <a
                href={`https://www.google.com/maps?q=${property.location.lat},${property.location.lng}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm text-green-600 hover:underline"
              >
                Open in Google Maps
              </a>
            </div>
          </Section>

          <Section title="Matching options (per property)">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {attributes.map((attr) => (
                <label key={attr} className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={propRules[attr] ?? true} onChange={(e) => setPropRules((r) => ({ ...r, [attr]: e.target.checked }))} />
                  <span className="text-gray-800">{attr === 'areaSqft' ? 'Area (sqft)' : attr.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                </label>
              ))}
            </div>
            <div className="mt-3 flex items-end gap-2">
              <div>
                <label className="mb-1 block text-sm text-gray-700">Add option</label>
                <input value={newAttr} onChange={(e) => setNewAttr(e.target.value)} placeholder="e.g. furnishing"
                  className="w-64 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <button onClick={() => { if (newAttr && !attributes.includes(newAttr)) { setAttributes((a) => [...a, newAttr]); setPropRules((r) => ({ ...r, [newAttr]: true })); setNewAttr('') } }}
                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50">Add</button>
            </div>
            <div className="mt-3">
              <button onClick={savePropRules} className="rounded-md bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600">Save rules</button>
              <span className="ml-2 text-xs text-gray-500">Saved locally per property</span>
            </div>
          </Section>

          {/* <Section title="Custom matching rules (per property)">
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <div>
                  <label className="mb-1 block text-sm text-gray-700">Add attribute</label>
                  <input value={newAttr} onChange={(e) => setNewAttr(e.target.value)} placeholder="e.g. furnishing"
                    className="w-64 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <button onClick={() => { if (newAttr && !attributes.includes(newAttr)) { setAttributes((a) => [...a, newAttr]); setNewAttr('') } }}
                  className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50">Add attribute</button>
                <button onClick={() => setCustomRules((arr) => [...arr, { id: `cr-${Math.floor(Math.random()*9000)+1000}`, attribute: attributes[0], operator: '>=', value: 1, weightPct: 10, enabled: true }])}
                  className="rounded-md bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600">Add rule</button>
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
                    {customRules.map((r, idx) => (
                      <tr key={r.id} className="border-t border-gray-100">
                        <td className="px-3 py-2"><input type="checkbox" checked={r.enabled} onChange={(e) => setCustomRules((arr) => arr.map((x, i) => i === idx ? { ...x, enabled: e.target.checked } : x))} /></td>
                        <td className="px-3 py-2">
                          <select value={r.attribute} onChange={(e) => setCustomRules((arr) => arr.map((x, i) => i === idx ? { ...x, attribute: e.target.value } : x))} className="rounded-md border border-gray-300 px-2 py-1">
                            {attributes.map((attr) => (
                              <option key={attr} value={attr}>{attr}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <select value={r.operator} onChange={(e) => setCustomRules((arr) => arr.map((x, i) => i === idx ? { ...x, operator: e.target.value } : x))} className="rounded-md border border-gray-300 px-2 py-1">
                            <option>{'=='}</option>
                            <option>{'>='}</option>
                            <option>{'<='}</option>
                          </select>
                        </td>
                        <td className="px-3 py-2"><input value={r.value} onChange={(e) => setCustomRules((arr) => arr.map((x, i) => i === idx ? { ...x, value: isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value) } : x))} className="w-full rounded-md border border-gray-300 px-2 py-1" /></td>
                        <td className="px-3 py-2 w-32"><input type="number" value={r.weightPct} onChange={(e) => setCustomRules((arr) => arr.map((x, i) => i === idx ? { ...x, weightPct: parseInt(e.target.value) || 0 } : x))} className="w-full rounded-md border border-gray-300 px-2 py-1" /></td>
                        <td className="px-3 py-2 text-right"><button onClick={() => setCustomRules((arr) => arr.filter((_, i) => i !== idx))} className="text-sm text-red-600 hover:underline">Remove</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-end">
                <button onClick={saveCustomRules} className="rounded-md bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600">Save custom rules</button>
              </div>
            </div>
          </Section> */}

          <Section title="Media">
            {property.images?.length ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.images.map((src, i) => (
                  <img key={i} src={src} alt="Property" className="aspect-video w-full rounded-lg object-cover border border-gray-200" />
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No images uploaded.</div>
            )}
          </Section>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="text-base font-semibold text-gray-900 mb-2">Owner</div>
            {owner ? (
              <div className="text-sm space-y-1">
                <div className="flex items-center justify-between"><span className="text-gray-500">Name</span><span className="font-medium text-gray-900">{owner.firstName} {owner.lastName}</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-500">Email</span><span className="font-medium text-gray-900">{owner.email}</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-500">Role</span><span className="font-medium text-gray-900">{owner.role}</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-500">Status</span><span className="font-medium text-gray-900">{owner.status}</span></div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Unknown owner</div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="text-base font-semibold text-gray-900 mb-2">Meta</div>
            <ul className="text-sm space-y-2">
              <li className="flex items-center justify-between"><span className="text-gray-500">Property ID</span><span className="font-medium text-gray-900">{property.id}</span></li>
              <li className="flex items-center justify-between"><span className="text-gray-500">Created</span><span className="font-medium text-gray-900">{property.createdAt}</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function Slider({ images }) {
  const [index, setIndex] = useState(0)
  const count = images.length

  function prev() {
    setIndex((i) => (i - 1 + count) % count)
  }
  function next() {
    setIndex((i) => (i + 1) % count)
  }

  return (
    <div className="relative h-[400px] sm:h-[500px]">
      <img src={images[index]} alt="Property" className="h-full w-full rounded-xl object-cover" />
      <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-2 py-1 text-sm shadow hover:bg-white">‹</button>
      <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-2 py-1 text-sm shadow hover:bg-white">›</button>
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
        {images.map((_, i) => (
          <button key={i} onClick={() => setIndex(i)} className={`h-2 w-2 rounded-full ${i === index ? 'bg-green-500' : 'bg-white/70 border border-gray-300'}`}></button>
        ))}
      </div>
    </div>
  )
}

function MapPreview({ lat, lng }) {
  const src = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=14&size=640x240&maptype=roadmap&markers=color:green%7C${lat},${lng}`
  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-200">
      <img src={src} alt="Map preview" className="w-full h-40 object-cover" />
    </div>
  )
}

export default PropertyView


