import { useState, useEffect } from "react";
import {
  Plus,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Settings,
  ToggleLeft,
  ToggleRight,
  Search,
  Filter,
} from "lucide-react";
import { adminService } from "../lib/api";
import { showToast } from "../lib/toast";
import Pagination from "../components/Pagination";

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-xl border border-gray-200 p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-base font-semibold text-gray-900">{title}</div>
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Criteria() {
  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [current, setCurrent] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Function to validate and correct pagination data
  function validatePagination(totalItems, totalPages, currentPage, itemsPerPage) {
    // If total items is 0, there should be 1 page
    if (totalItems === 0) {
      return { totalItems: 0, totalPages: 1 };
    }
    
    // Calculate what total pages should be
    const calculatedPages = Math.ceil(totalItems / itemsPerPage);
    
    // If API says there are more pages than items suggest, use calculated
    if (totalPages > calculatedPages) {
      console.warn('API total pages seems incorrect, using calculated:', calculatedPages);
      return { totalItems, totalPages: calculatedPages };
    }
    
    // If we're on a page that doesn't exist, reset to page 1
    if (currentPage > totalPages) {
      console.warn('Current page exceeds total pages, resetting to page 1');
      return { totalItems, totalPages, resetPage: true };
    }
    
    return { totalItems, totalPages };
  }


  // Filter states
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, multi, single

  // Load criteria
  async function loadCriteria() {
    setLoading(true);
    try {
      const params = { page, limit: 6 };
      if (search) params.search = search;
      if (filterType === "multi") params.isMultiSelect = "true";
      if (filterType === "single") params.isMultiSelect = "false";

      const res = await adminService.listCriteria(params);
      console.log('Criteria API Response:', res);
      console.log('Pagination data:', res?.data?.pagination);
      console.log('Total items:', res?.data?.total || res?.data?.pagination?.total);
      
      const criteriaList = res?.data?.criteria || [];
      setCriteria(criteriaList);
      
      // Get total items from API response
      const apiTotalItems = res?.data?.pagination?.total || res?.data?.total;
      const apiTotalPages = res?.data?.pagination?.totalPages || res?.data?.totalPages;
      
      console.log('API Total Items:', apiTotalItems);
      console.log('API Total Pages:', apiTotalPages);
      console.log('Current page items:', criteriaList.length);
      
      // If API provides total items, use it; otherwise estimate based on current data
      let totalItems = apiTotalItems;
      let totalPages = apiTotalPages;
      
      // If API doesn't provide total items, estimate based on current page
      if (!totalItems && criteriaList.length > 0) {
        // If we got a full page, there might be more
        if (criteriaList.length === params.limit) {
          totalItems = (page * params.limit) + 1; // Estimate there's at least one more item
        } else {
          // This is the last page
          totalItems = ((page - 1) * params.limit) + criteriaList.length;
        }
      }
      
      // Calculate total pages if not provided
      if (!totalPages && totalItems) {
        totalPages = Math.ceil(totalItems / params.limit);
      }
      
      // Fallback to 1 if no data
      if (!totalItems) {
        totalItems = criteriaList.length;
        totalPages = 1;
      }
      
      console.log('Final Total Items:', totalItems);
      console.log('Final Total Pages:', totalPages);
      console.log('Has More:', page < totalPages);
      
      setTotalItems(totalItems);
      setTotalPages(totalPages);
      setHasMore(page < totalPages);
    } catch (err) {
      showToast(err.message || "Failed to load criteria", "error");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setCurrent({
      id: "",
      identifier: "",
      isMultiSelect: true,
      isActive: true,
      sortOrder: 0,
      translations: [{ language: "en", name: "" }],
      options: []
    });
    setCreateOpen(true);
  }

  function openEdit(criterion) {
    setCurrent(criterion);
    setEditOpen(true);
  }

  async function saveCriteria() {
    if (!current.identifier) {
      showToast("Please enter a criteria identifier", "error");
      return;
    }
    if (!current.translations[0]?.name) {
      showToast("Please enter a criteria name", "error");
      return;
    }

    setSaving(true);
    try {
      if (current.id) {
        // Update existing criteria
        await adminService.updateCriteria(current.id, current);
        showToast("Criteria updated successfully");
      } else {
        // Create new criteria
        await adminService.createCriteria(current);
        showToast("Criteria created successfully");
      }
      setCreateOpen(false);
      setEditOpen(false);
      loadCriteria();
    } catch (err) {
      showToast(err.message || "Failed to save criteria", "error");
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(criterion) {
    setCurrent(criterion);
    setDeleteOpen(true);
  }

  async function doDelete() {
    setDeleting(true);
    try {
      await adminService.deleteCriteria(current.id);
      showToast("Criteria deleted successfully");
      setDeleteOpen(false);
      loadCriteria();
    } catch (err) {
      showToast(err.message || "Failed to delete criteria", "error");
    } finally {
      setDeleting(false);
    }
  }

  async function toggleMultiSelect(criterion) {
    try {
      await adminService.toggleCriteriaMultiSelect(criterion.id, {
        isMultiSelect: !criterion.isMultiSelect
      });
      showToast(`Multi-select ${!criterion.isMultiSelect ? 'enabled' : 'disabled'} successfully`);
      loadCriteria();
    } catch (err) {
      showToast(err.message || "Failed to toggle multi-select", "error");
    }
  }

  function addTranslation() {
    setCurrent(prev => ({
      ...prev,
      translations: [...prev.translations, { language: "en", name: "" }]
    }));
  }

  function updateTranslation(index, field, value) {
    setCurrent(prev => ({
      ...prev,
      translations: prev.translations.map((t, i) => 
        i === index ? { ...t, [field]: value } : t
      )
    }));
  }

  function removeTranslation(index) {
    setCurrent(prev => ({
      ...prev,
      translations: prev.translations.filter((_, i) => i !== index)
    }));
  }

  function addOption() {
    setCurrent(prev => ({
      ...prev,
      options: [...prev.options, {
        identifier: "",
        sortOrder: prev.options.length + 1,
        translations: [{ language: "en", value: "" }]
      }]
    }));
  }

  function updateOption(optionIndex, field, value) {
    setCurrent(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => 
        i === optionIndex ? { ...opt, [field]: value } : opt
      )
    }));
  }

  function updateOptionTranslation(optionIndex, transIndex, field, value) {
    setCurrent(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => 
        i === optionIndex ? {
          ...opt,
          translations: opt.translations.map((t, ti) => 
            ti === transIndex ? { ...t, [field]: value } : t
          )
        } : opt
      )
    }));
  }

  function removeOption(optionIndex) {
    setCurrent(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== optionIndex)
    }));
  }

  useEffect(() => {
    loadCriteria();
  }, [page, search, filterType]);

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Manage Criteria
          </h2>
          {totalItems > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Showing {criteria.length} of {totalItems} criteria (Page {page} of {totalPages})
            </p>
          )}
        </div>
        <div className="inline-flex items-center gap-2">
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600"
          >
            <Plus size={16} /> New criteria
          </button>
        </div>
      </div>

      <div className="flex-1 rounded-2xl border border-gray-200 bg-white flex flex-col">
        {/* Filters */}
        <div className="p-3 flex flex-wrap items-center gap-2 border-b border-gray-100">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (setPage(1), loadCriteria())
              }
              placeholder="Search criteria..."
              className="pl-10 rounded-md border border-gray-300 px-3 py-2 text-sm w-64"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => {
              setPage(1);
              setFilterType(e.target.value);
            }}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="all">All Criteria</option>
            <option value="multi">Multi-Select Only</option>
            <option value="single">Single-Select Only</option>
          </select>
          <button
            onClick={() => {
              setPage(1);
              loadCriteria();
            }}
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
          >
            Apply
          </button>
        </div>


        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">
                Loading criteria...
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto overflow-y-visible flex-1 min-h-[360px]">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="px-4 py-3">Identifier</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Options</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Sort Order</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {criteria.map((c) => (
                    <tr
                      key={c.id}
                      className="border-t border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {c.identifier}
                      </td>
                      <td className="px-4 py-3 text-gray-800">
                        {c.translations?.[0]?.name || "No name"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            c.isMultiSelect
                              ? "bg-blue-50 text-blue-700"
                              : "bg-orange-50 text-orange-700"
                          }`}
                        >
                          {c.isMultiSelect ? "Multi-Select" : "Single-Select"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-800">
                        {c.options?.length || 0} options
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            c.isActive
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {c.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-800">{c.sortOrder}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleMultiSelect(c)}
                            className={`p-2 rounded-md border transition-colors ${
                              c.isMultiSelect
                                ? "border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
                                : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                            }`}
                            title={c.isMultiSelect ? "Disable multi-select" : "Enable multi-select"}
                          >
                            {c.isMultiSelect ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          </button>
                          <div className="relative">
                            <button
                              className="ml-auto flex items-center rounded-md border border-gray-200 bg-white p-2 hover:bg-gray-100"
                              onClick={() =>
                                setMenuOpen(menuOpen === c.id ? "" : c.id)
                              }
                            >
                              <MoreVertical size={16} />
                            </button>
                            {menuOpen === c.id && (
                              <div className="absolute right-0 z-50 mt-2 w-40 rounded-md border border-gray-200 bg-white shadow-lg">
                                <button
                                  onClick={() => {
                                    setMenuOpen("");
                                    openEdit(c);
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                                >
                                  <Pencil size={14} /> Edit
                                </button>
                                <button
                                  onClick={() => {
                                    setMenuOpen("");
                                    confirmDelete(c);
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && totalPages <= 50 ? (
              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={setPage}
              />
            ) : hasMore ? (
              <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-center">
                <button
                  onClick={() => setPage(page + 1)}
                  className="rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
                >
                  Load More Criteria
                </button>
              </div>
            ) : totalPages > 50 ? (
              <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-center">
                <p className="text-sm text-gray-500">
                  Too many pages to display. Use search or filters to narrow down results.
                </p>
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* Create/Edit criteria */}
      <Modal
        open={createOpen || editOpen}
        onClose={() => {
          setCreateOpen(false);
          setEditOpen(false);
        }}
        title={current?.id ? "Edit criteria" : "Create criteria"}
      >
        {current && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm text-gray-700">
                  Identifier
                </label>
                <input
                  value={current.identifier || ""}
                  onChange={(e) =>
                    setCurrent((p) => ({ ...p, identifier: e.target.value }))
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., facilities, condition"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-700">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={current.sortOrder || 0}
                  onChange={(e) =>
                    setCurrent((p) => ({
                      ...p,
                      sortOrder: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={current.isMultiSelect}
                  onChange={(e) =>
                    setCurrent((p) => ({ ...p, isMultiSelect: e.target.checked }))
                  }
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Multi-Select</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={current.isActive}
                  onChange={(e) =>
                    setCurrent((p) => ({ ...p, isActive: e.target.checked }))
                  }
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>

            {/* Translations */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Translations
                </label>
                <button
                  type="button"
                  onClick={addTranslation}
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  + Add Translation
                </button>
              </div>
              {current.translations?.map((trans, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <select
                    value={trans.language}
                    onChange={(e) => updateTranslation(index, "language", e.target.value)}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="en">English</option>
                    <option value="de">German</option>
                    <option value="fr">French</option>
                    <option value="it">Italian</option>
                  </select>
                  <input
                    value={trans.name}
                    onChange={(e) => updateTranslation(index, "name", e.target.value)}
                    placeholder="Translation name"
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeTranslation(index)}
                    className="px-2 py-1 text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Options */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Options
                </label>
                <button
                  type="button"
                  onClick={addOption}
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  + Add Option
                </button>
              </div>
              {current.options?.map((option, optionIndex) => (
                <div key={optionIndex} className="border border-gray-200 rounded-md p-3 mb-2">
                  <div className="flex gap-2 mb-2">
                    <input
                      value={option.identifier}
                      onChange={(e) => updateOption(optionIndex, "identifier", e.target.value)}
                      placeholder="Option identifier"
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="number"
                      value={option.sortOrder}
                      onChange={(e) => updateOption(optionIndex, "sortOrder", parseInt(e.target.value) || 0)}
                      placeholder="Order"
                      className="w-20 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(optionIndex)}
                      className="px-2 py-1 text-sm text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                  {option.translations?.map((trans, transIndex) => (
                    <div key={transIndex} className="flex gap-2">
                      <select
                        value={trans.language}
                        onChange={(e) => updateOptionTranslation(optionIndex, transIndex, "language", e.target.value)}
                        className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                      >
                        <option value="en">English</option>
                        <option value="de">German</option>
                        <option value="fr">French</option>
                        <option value="it">Italian</option>
                      </select>
                      <input
                        value={trans.value}
                        onChange={(e) => updateOptionTranslation(optionIndex, transIndex, "value", e.target.value)}
                        placeholder="Option value"
                        className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setCreateOpen(false);
                  setEditOpen(false);
                }}
                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveCriteria}
                disabled={saving}
                className="rounded-md bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete criteria"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Are you sure you want to delete{" "}
            <span className="font-medium">
              {current?.identifier || "this criteria"}
            </span>
            ?
          </p>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setDeleteOpen(false)}
              className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={doDelete}
              disabled={deleting}
              className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Criteria;
