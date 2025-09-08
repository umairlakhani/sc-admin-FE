import { useMemo, useState } from 'react'
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
                <div className="mt-1 font-medium text-gray-900">{currency.format(property.price)}</div>
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


