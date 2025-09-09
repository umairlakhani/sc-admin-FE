export default function Pagination({ page, totalPages, onChange }) {
  const maxButtons = 10
  let start = Math.max(1, page - Math.floor(maxButtons / 2))
  let end = Math.min(totalPages, start + maxButtons - 1)
  start = Math.max(1, end - maxButtons + 1)
  const nums = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  return (
    <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
      <div className="text-xs text-gray-500">Page {page} of {totalPages}</div>
      <div className="inline-flex items-center gap-1">
        <button
          className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm disabled:opacity-50"
          disabled={page === 1}
          onClick={() => onChange(Math.max(1, page - 1))}
        >
          Prev
        </button>
        {nums.map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`rounded-md px-2 py-1 text-sm border ${n === page ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white border-gray-200'}`}
          >
            {n}
          </button>
        ))}
        <button
          className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm disabled:opacity-50"
          disabled={page === totalPages}
          onClick={() => onChange(Math.min(totalPages, page + 1))}
        >
          Next
        </button>
      </div>
    </div>
  )
}


