import { useState, useEffect } from "react";
import {
  propertiesData,
  usersData,
  matchingRules,
  matchingSettings,
} from "../data";
import {
  Plus,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Upload,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { adminService } from "../lib/api";
import { showToast } from "../lib/toast";
import Pagination from "../components/Pagination";

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-6xl max-h-[90vh] rounded-2xl bg-white shadow-xl border border-gray-200 p-5 overflow-y-auto">
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

function Properties() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [current, setCurrent] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [rules, setRules] = useState(matchingRules);
  const [settings, setSettings] = useState(matchingSettings);
  const [availableAttributes, setAvailableAttributes] = useState([
    "bedrooms",
    "location_radius_km",
    "price",
    "type",
    "areaSqft",
  ]);
  const [newAttribute, setNewAttribute] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  
  // Multi-step property creation state
  const [currentStep, setCurrentStep] = useState(1);
  const [propertyId, setPropertyId] = useState(null);
  const [criteria, setCriteria] = useState([]);
  const [criteriaLoading, setCriteriaLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Filter states
  const [search, setSearch] = useState("");
  const [userId, setUserId] = useState("");
  const [offeringType, setOfferingType] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [listType, setListType] = useState("");

  // Load properties
  async function loadProperties() {
    setLoading(true);
    try {
      const params = { page, limit: 6 };
      if (search) params.search = search;
      if (userId) params.userId = userId;
      if (offeringType) params.offeringType = offeringType;
      if (propertyType) params.propertyType = propertyType;
      if (listType) params.listType = listType;

      const res = await adminService.listProperties(params);
      setProperties(res?.data?.properties || []);
      console.log(res);
      setTotalPages(res?.data?.pagination?.totalPages || 1);
    } catch (err) {
      showToast(err.message || "Failed to load properties", "error");
    } finally {
      setLoading(false);
    }
  }

  // Load users for dropdown
  async function loadUsers() {
    setUsersLoading(true);
    try {
      const res = await adminService.listUsers({ limit: 1000 }); // Get all users
      console.log(res)
      setUsers(res?.users || []);
    } catch (err) {
      showToast(err.message || "Failed to load users", "error");
    } finally {
      setUsersLoading(false);
    }
  }

  console.log(properties);

  function openCreate() {
    setCurrent({
      id: "",
      propertyTitle: "",
      propertyType: "apartment",
      offeringType: "purchase",
      price: 0,
      currency: "CHF",
      bedrooms: 0,
      units: 0,
      squareMeters: 0,
      userId: "",
      listType: "offer",
      countryISO: "",
      countryName: "",
      city: "",
      zipCode: "",
      fullAddress: "",
      zipList: {},
      flatZipList: {}
    });
    setCurrentStep(1);
    setPropertyId(null);
    setUploadedImages([]);
    setCreateOpen(true);
    loadUsers(); // Load users when opening create modal
    loadCriteria(); // Load criteria for step 2
  }

  async function saveProperty() {
    if (!current.propertyTitle) {
      showToast("Please enter a property title", "error");
      return;
    }
    if (!current.price || current.price <= 0) {
      showToast("Please enter a valid price", "error");
      return;
    }
    if (!current.userId) {
      showToast("Please select a user", "error");
      return;
    }

    setSaving(true);
    try {
      if (current.id) {
        // Update existing property
        await adminService.updateProperty(current.id, current);
        showToast("Property updated successfully");
      } else {
        // Create new property
        await adminService.createProperty(current);
        showToast("Property created successfully");
      }
      setCreateOpen(false);
      setEditOpen(false);
      loadProperties();
    } catch (err) {
      showToast(err.message || "Failed to save property", "error");
    } finally {
      setSaving(false);
    }
  }

  // Load criteria for multi-step creation
  async function loadCriteria() {
    setCriteriaLoading(true);
    try {
      const response = await adminService.listCriteria({ limit: 100 });
      setCriteria(response.data?.criteria || []);
    } catch (error) {
      console.error("Error loading criteria:", error);
      showToast("Error loading criteria", "error");
    } finally {
      setCriteriaLoading(false);
    }
  }

  // Step 1: Create property draft
  async function createPropertyDraft() {
    if (!current.propertyTitle) {
      showToast("Please enter a property title", "error");
      return;
    }
    if (!current.price || current.price <= 0) {
      showToast("Please enter a valid price", "error");
      return;
    }
    if (!current.userId) {
      showToast("Please select a user", "error");
      return;
    }

    setSaving(true);
    try {
      const response = await adminService.createPropertyDraft(current);
      setPropertyId(response.data.propertyId);
      setCurrentStep(2);
      showToast("Property draft created successfully", "success");
    } catch (error) {
      console.error("Error creating property draft:", error);
      showToast("Error creating property draft", "error");
    } finally {
      setSaving(false);
    }
  }

  // Step 2: Add criteria
  async function addPropertyCriteria(criteriaData) {
    if (!propertyId) return;

    setSaving(true);
    try {
      await adminService.addPropertyCriteria(propertyId, criteriaData);
      setCurrentStep(3);
      showToast("Property criteria added successfully", "success");
    } catch (error) {
      console.error("Error adding criteria:", error);
      showToast("Error adding criteria", "error");
    } finally {
      setSaving(false);
    }
  }

  // Step 3: Add showcase
  async function addPropertyShowcase(showcaseData) {
    if (!propertyId) return;

    setSaving(true);
    try {
      await adminService.addPropertyShowcase(propertyId, showcaseData);
      setCurrentStep(4);
      showToast("Property showcase added successfully", "success");
    } catch (error) {
      console.error("Error adding showcase:", error);
      showToast("Error adding showcase", "error");
    } finally {
      setSaving(false);
    }
  }

  // Step 4: Finalize property
  async function finalizeProperty() {
    if (!propertyId) return;

    setSaving(true);
    try {
      await adminService.finalizeProperty(propertyId);
      setCreateOpen(false);
      setCurrentStep(1);
      setPropertyId(null);
      setUploadedImages([]);
      loadProperties();
      showToast("Property created successfully", "success");
    } catch (error) {
      console.error("Error finalizing property:", error);
      showToast("Error finalizing property", "error");
    } finally {
      setSaving(false);
    }
  }

  // Handle image upload
  async function handleImageUpload(files) {
    setUploadingImages(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('images', file);
      });

      const response = await adminService.uploadImages(formData);
      const newImages = response.data.urls || [];
      setUploadedImages(prev => [...prev, ...newImages]);
      showToast("Images uploaded successfully", "success");
    } catch (error) {
      console.error("Error uploading images:", error);
      showToast("Error uploading images", "error");
    } finally {
      setUploadingImages(false);
    }
  }

  // Load property details for editing
  async function loadPropertyDetails(propertyId) {
    if (!propertyId) return;
    
    try {
      // Load complete property data including all details
      const propertyRes = await adminService.getProperty(propertyId);
      console.log('Raw API response:', propertyRes);
      const propertyData = propertyRes?.data || propertyRes;
      
      if (propertyData) {
        console.log('Loaded property data:', propertyData);
        console.log('Property addresses:', propertyData.PropertyAddresses);
        console.log('Property location:', propertyData.location);
        console.log('Property city:', propertyData.city);
        console.log('Property country:', propertyData.country);
        console.log('Property countryISO:', propertyData.countryISO);
        console.log('Property countryName:', propertyData.countryName);
        console.log('Property zipCode:', propertyData.zipCode);
        console.log('Property fullAddress:', propertyData.fullAddress);
        
        // Extract location data from PropertyAddresses array (correct structure)
        const locationData = propertyData.PropertyAddresses?.[0] || propertyData.addresses?.[0] || propertyData.location || {};
        console.log('Extracted location data:', locationData);
        
        // If no location data found, try to get it from the property's current state
        // This handles cases where the API might not return complete location data
        if (!locationData.city && !locationData.country && !locationData.address) {
          console.log('No location data found in API response, using existing property data');
          // The property data from the list might have some location info
          // We'll use what we have from the current property state
        }
        
        // Update current property with all loaded data
        setCurrent(prev => {
          const updatedProperty = {
            ...prev,
            ...propertyData,
            // Ensure all fields are properly set
            propertyTitle: propertyData.propertyTitle || prev.propertyTitle,
            propertyType: propertyData.propertyType || prev.propertyType,
            offeringType: propertyData.offeringType || prev.offeringType,
            listType: propertyData.listType || prev.listType,
            price: propertyData.price || prev.price,
            currency: propertyData.currency || prev.currency,
            bedrooms: propertyData.bedrooms || prev.bedrooms,
            squareMeters: propertyData.squareMeters || prev.squareMeters,
            units: propertyData.units || prev.units,
            userId: propertyData.userId || prev.userId,
            // Location fields - use PropertyAddresses structure
            countryISO: locationData.countryISO || propertyData.countryISO || prev.countryISO,
            countryName: locationData.countryName || propertyData.countryName || prev.countryName,
            city: locationData.city || propertyData.city || prev.city,
            zipCode: locationData.zipCode || propertyData.zipCode || prev.zipCode,
            fullAddress: locationData.fullAddress || propertyData.fullAddress || prev.fullAddress,
            // Additional address fields
            street: locationData.street || propertyData.street || prev.street,
            streetNumber: locationData.streetNumber || propertyData.streetNumber || prev.streetNumber,
            state: locationData.state || propertyData.state || prev.state,
            // Load additional data
            criteria: propertyData.criteria || prev.criteria,
            showcase: propertyData.showcase || prev.showcase,
            demandCriteria: propertyData.demandCriteria || prev.demandCriteria,
            images: propertyData.images || propertyData.showcase?.images || prev.images,
            mainImage: propertyData.mainImage || propertyData.showcase?.mainImage || prev.mainImage
          };
          console.log('Updated property state:', updatedProperty);
          return updatedProperty;
        });

        // Set uploaded images for display if they exist
        if (propertyData.images || propertyData.showcase?.images) {
          setUploadedImages(propertyData.images || propertyData.showcase.images);
        }
      }
    } catch (err) {
      console.error('Error loading property details:', err);
      showToast('Error loading property details', 'error');
    }
  }

  function confirmDelete(property) {
    setCurrent(property);
    setDeleteOpen(true);
  }

  async function doDelete() {
    setDeleting(true);
    try {
      await adminService.deleteProperty(current.id);
      showToast("Property deleted successfully");
      setDeleteOpen(false);
      loadProperties();
    } catch (err) {
      showToast(err.message || "Failed to delete property", "error");
    } finally {
      setDeleting(false);
    }
  }

  useEffect(() => {
    loadProperties();
  }, [page, search, userId, offeringType, propertyType, listType]);

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">
          Manage Properties
        </h2>
        <div className="inline-flex items-center gap-2">
          {/* <button onClick={() => setRulesOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50">
            <Settings size={16} /> Matching rules
          </button> */}
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600"
          >
            <Plus size={16} /> New property
          </button>
        </div>
      </div>

      <div className="flex-1 rounded-2xl border border-gray-200 bg-white flex flex-col">
        {/* Filters */}
        <div className="p-3 flex flex-wrap items-center gap-2 border-b border-gray-100">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && (setPage(1), loadProperties())
            }
            placeholder="Search by property title, type, or offering type..."
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          {/* <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="User ID"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          /> */}
          <select
            value={offeringType}
            onChange={(e) => {
              setPage(1);
              setOfferingType(e.target.value);
            }}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Offering: any</option>
            <option value="purchase">Purchase</option>
            <option value="rental">Rental</option>
          </select>
          <select
            value={propertyType}
            onChange={(e) => {
              setPage(1);
              setPropertyType(e.target.value);
            }}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Property: any</option>
            <option value="house/villa">House/Villa</option>
            <option value="apartment">Apartment</option>
            <option value="plot">Plot</option>
            <option value="multifamily">Multifamily</option>
          </select>
          <select
            value={listType}
            onChange={(e) => {
              setPage(1);
              setListType(e.target.value);
            }}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">List: any</option>
            <option value="offer">Offer</option>
            <option value="demand">Demand</option>
          </select>
          <button
            onClick={() => {
              setPage(1);
              loadProperties();
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
                Loading properties...
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto overflow-y-visible flex-1 min-h-[360px]">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Offering</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Beds</th>
                    <th className="px-4 py-3">Units</th>
                    <th className="px-4 py-3">Area (m²)</th>
                    <th className="px-4 py-3">List Type</th>
                    <th className="px-4 py-3">Owner</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((p) => (
                    <tr
                      key={p.id}
                      className="border-t border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {p.propertyTitle || "Untitled Property"}
                      </td>
                      <td className="px-4 py-3 text-gray-800 capitalize">
                        {p.propertyType?.replace("/", " / ")}
                      </td>
                      <td className="px-4 py-3 text-gray-800 capitalize">
                        {p.offeringType}
                      </td>
                      <td className="px-4 py-3 text-gray-800">
                        {new Intl.NumberFormat("en-CH", {
                          style: "currency",
                          currency: p.currency || "CHF",
                        }).format(p.price)}
                      </td>
                      <td className="px-4 py-3 text-gray-800">{p.bedrooms}</td>
                      <td className="px-4 py-3 text-gray-800">{p.units || 0}</td>
                      <td className="px-4 py-3 text-gray-800">
                        {p.squareMeters}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            p.listType === "offer"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-orange-50 text-orange-700"
                          }`}
                        >
                          {p.listType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-800">
                        {p.User
                          ? `${p.User.name} ${p.User.surname}`
                          : "Unknown"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            p.deletedAt
                              ? "bg-red-50 text-red-700"
                              : "bg-green-50 text-green-700"
                          }`}
                        >
                          {p.deletedAt ? "Deleted" : "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <button
                            className="ml-auto flex items-center rounded-md border border-gray-200 bg-white p-2 hover:bg-gray-100"
                            onClick={() =>
                              setMenuOpen(menuOpen === p.id ? "" : p.id)
                            }
                          >
                            <MoreVertical size={16} />
                          </button>
                          {menuOpen === p.id && (
                            <div className="absolute right-0 z-50 mt-2 w-40 rounded-md border border-gray-200 bg-white shadow-lg">
                              <button
                                onClick={() => {
                                  setMenuOpen("");
                                  navigate(`/properties/${p.id}`);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                              >
                                <Eye size={14} /> View
                              </button>
                              <button
                                onClick={async () => {
                                  setMenuOpen("");
                                  setCurrent(p);
                                  setEditOpen(true);
                                  setCurrentStep(1);
                                  setPropertyId(null);
                                  setUploadedImages([]);
                                  // Load users and property details for editing
                                  await Promise.all([
                                    loadUsers(),
                                    loadPropertyDetails(p.id)
                                  ]);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                              >
                                <Pencil size={14} /> Edit
                              </button>
                              <button
                                onClick={() => {
                                  setMenuOpen("");
                                  confirmDelete(p);
                                }}
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
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          </>
        )}
      </div>

      {/* Create/Edit property - Multi-step form */}
      <Modal
        open={createOpen || editOpen}
        onClose={() => {
          setCreateOpen(false);
          setEditOpen(false);
          setCurrentStep(1);
          setPropertyId(null);
          setUploadedImages([]);
        }}
        title={current?.id ? "Edit property" : "Create property"}
      >
        {current && (
          <div className="space-y-4">
            {/* Step indicator */}
            <div className="flex items-center justify-center space-x-2 mb-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= step
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`w-8 h-0.5 ${
                        currentStep > step ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-900">Property Information</h3>
                <div className="grid grid-cols-3 gap-3">
              <div>
                    <label className="mb-1 block text-sm text-gray-700">
                      Property Title *
                    </label>
                <input 
                      value={current.propertyTitle || ""}
                      onChange={(e) =>
                        setCurrent((p) => ({ ...p, propertyTitle: e.target.value }))
                      }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" 
                  placeholder="Enter property title"
                />
              </div>
              <div>
                    <label className="mb-1 block text-sm text-gray-700">
                      Property Type
                    </label>
                <select 
                      value={current.propertyType || "apartment"}
                      onChange={(e) =>
                        setCurrent((p) => ({ ...p, propertyType: e.target.value }))
                      }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="apartment">Apartment</option>
                  <option value="house/villa">House/Villa</option>
                  <option value="plot">Plot</option>
                      <option value="multifamily">Multifamily</option>
                </select>
              </div>
              <div>
                    <label className="mb-1 block text-sm text-gray-700">
                      Offering Type
                    </label>
                <select 
                      value={current.offeringType || "purchase"}
                      onChange={(e) =>
                        setCurrent((p) => ({ ...p, offeringType: e.target.value }))
                      }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="purchase">Purchase</option>
                      <option value="rental">Rental</option>
                </select>
              </div>
              <div>
                    <label className="mb-1 block text-sm text-gray-700">
                      List Type
                    </label>
                <select 
                      value={current.listType || "offer"}
                      onChange={(e) =>
                        setCurrent((p) => ({ ...p, listType: e.target.value }))
                      }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="offer">Offer</option>
                  <option value="demand">Demand</option>
                </select>
              </div>
              <div>
                    <label className="mb-1 block text-sm text-gray-700">
                      Price *
                    </label>
                <input 
                  type="number" 
                  value={current.price || 0} 
                      onChange={(e) =>
                        setCurrent((p) => ({
                          ...p,
                          price: parseFloat(e.target.value) || 0,
                        }))
                      }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" 
                />
              </div>
              <div>
                    <label className="mb-1 block text-sm text-gray-700">
                      Currency
                    </label>
                <select 
                      value={current.currency || "CHF"}
                      onChange={(e) =>
                        setCurrent((p) => ({ ...p, currency: e.target.value }))
                      }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="CHF">CHF</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div>
                    <label className="mb-1 block text-sm text-gray-700">
                      Bedrooms
                    </label>
                <input 
                  type="number" 
                  value={current.bedrooms || 0} 
                      onChange={(e) =>
                        setCurrent((p) => ({
                          ...p,
                          bedrooms: parseInt(e.target.value) || 0,
                        }))
                      }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" 
                />
              </div>
              <div>
                    <label className="mb-1 block text-sm text-gray-700">
                      Area (m²)
                    </label>
                <input 
                  type="number" 
                  value={current.squareMeters || 0} 
                      onChange={(e) =>
                        setCurrent((p) => ({
                          ...p,
                          squareMeters: parseInt(e.target.value) || 0,
                        }))
                      }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" 
                />
              </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-700">
                      Units
                    </label>
                    <input
                      type="number"
                      value={current.units || 0}
                      onChange={(e) =>
                        setCurrent((p) => ({
                          ...p,
                          units: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
            </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-700">
                      User *
                    </label>
                    <select
                      value={current.userId || ""}
                      onChange={(e) =>
                        setCurrent((p) => ({ ...p, userId: e.target.value }))
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      disabled={usersLoading}
                    >
                      <option value="">Select a user</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} {user.surname} ({user.email})
                        </option>
                      ))}
                    </select>
                    {usersLoading && (
                      <p className="mt-1 text-xs text-gray-500">Loading users...</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-700">
                      Country ISO
                    </label>
                    <input
                      value={current.countryISO || ""}
                      onChange={(e) =>
                        setCurrent((p) => ({ ...p, countryISO: e.target.value }))
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., CH, DE, FR"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-700">
                      Country Name
                    </label>
                    <input
                      value={current.countryName || ""}
                      onChange={(e) =>
                        setCurrent((p) => ({ ...p, countryName: e.target.value }))
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., Switzerland, Germany, France"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-700">
                      City
                    </label>
                    <input
                      value={current.city || ""}
                      onChange={(e) =>
                        setCurrent((p) => ({ ...p, city: e.target.value }))
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter city name"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-700">
                      ZIP Code
                    </label>
                    <input
                      value={current.zipCode || ""}
                      onChange={(e) =>
                        setCurrent((p) => ({ ...p, zipCode: e.target.value }))
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter ZIP code"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="mb-1 block text-sm text-gray-700">
                      Full Address
                    </label>
                    <input
                      value={current.fullAddress || ""}
                      onChange={(e) =>
                        setCurrent((p) => ({ ...p, fullAddress: e.target.value }))
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter complete address"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Property Criteria */}
            {currentStep === 2 && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-900">Property Criteria</h3>
                {criteriaLoading ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">Loading criteria...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {criteria.map((criterion) => (
                      <div key={criterion.id} className="border rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {criterion.translations?.[0]?.name || criterion.identifier}
                        </label>
                        {criterion.isMultiSelect ? (
                          <div className="space-y-2">
                            {criterion.options?.map((option) => {
                              const isSelected = current?.criteria?.[criterion.identifier]?.includes(option.identifier);
                              return (
                                <label key={option.id} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      const currentValues = current?.criteria?.[criterion.identifier] || [];
                                      const newValues = e.target.checked 
                                        ? [...currentValues, option.identifier]
                                        : currentValues.filter(v => v !== option.identifier);
                                      setCurrent(prev => ({
                                        ...prev,
                                        criteria: { ...prev.criteria, [criterion.identifier]: newValues }
                                      }));
                                    }}
                                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                  />
                                  <span className="ml-2 text-sm text-gray-700">
                                    {option.translations?.[0]?.value || option.identifier}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {criterion.options?.map((option) => {
                              const isSelected = current?.criteria?.[criterion.identifier] === option.identifier;
                              return (
                                <label key={option.id} className="flex items-center">
                                  <input
                                    type="radio"
                                    name={criterion.identifier}
                                    checked={isSelected}
                                    onChange={(e) => {
                                      setCurrent(prev => ({
                                        ...prev,
                                        criteria: { ...prev.criteria, [criterion.identifier]: option.identifier }
                                      }));
                                    }}
                                    className="border-gray-300 text-green-600 focus:ring-green-500"
                                  />
                                  <span className="ml-2 text-sm text-gray-700">
                                    {option.translations?.[0]?.value || option.identifier}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Property Showcase */}
            {currentStep === 3 && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-900">Property Showcase</h3>
                
                {/* Image Upload */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Images
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files)}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer"
                      >
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          Click to upload images or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                      </label>
                    </div>
                    {uploadingImages && (
                      <p className="text-sm text-gray-500 mt-2">Uploading images...</p>
                    )}
                    {uploadedImages.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Images:</p>
                        <div className="grid grid-cols-3 gap-2">
                          {uploadedImages.map((url, index) => (
                            <div key={index} className="relative">
                              <img
                                src={url}
                                alt={`Property ${index + 1}`}
                                className="w-full h-20 object-cover rounded"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Vendor Information */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vendor Name
                      </label>
                      <input
                        type="text"
                        value={current?.showcase?.vendorName || ""}
                        onChange={(e) => setCurrent(prev => ({ 
                          ...prev, 
                          showcase: { ...prev.showcase, vendorName: e.target.value }
                        }))}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter vendor name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={current?.showcase?.email || ""}
                        onChange={(e) => setCurrent(prev => ({ 
                          ...prev, 
                          showcase: { ...prev.showcase, email: e.target.value }
                        }))}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={current?.showcase?.phone || ""}
                        onChange={(e) => setCurrent(prev => ({ 
                          ...prev, 
                          showcase: { ...prev.showcase, phone: e.target.value }
                        }))}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Website URL
                      </label>
                      <input
                        type="url"
                        value={current?.showcase?.webUrl || ""}
                        onChange={(e) => setCurrent(prev => ({ 
                          ...prev, 
                          showcase: { ...prev.showcase, webUrl: e.target.value }
                        }))}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter website URL"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Finalize */}
            {currentStep === 4 && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-900">Review & Publish</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Property Summary</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Title:</strong> {current.propertyTitle}</p>
                    <p><strong>Type:</strong> {current.propertyType}</p>
                    <p><strong>Offering:</strong> {current.offeringType}</p>
                    <p><strong>Price:</strong> {current.currency} {current.price}</p>
                    <p><strong>Bedrooms:</strong> {current.bedrooms}</p>
                    <p><strong>Area:</strong> {current.squareMeters} m²</p>
                    <p><strong>Images:</strong> {uploadedImages.length} uploaded</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Review your property details above. Click "Publish" to create the property.
                </p>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                {currentStep > 1 && (
              <button 
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Back
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCreateOpen(false);
                    setEditOpen(false);
                    setCurrentStep(1);
                    setPropertyId(null);
                    setUploadedImages([]);
                  }}
                  className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                {currentStep === 1 && (
                  <button
                    onClick={current?.id ? saveProperty : createPropertyDraft}
                disabled={saving}
                    className="rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                    {saving ? (current?.id ? "Updating..." : "Creating...") : (current?.id ? "Update Property" : "Next")}
              </button>
                )}
                {currentStep === 2 && (
                  <button
                    onClick={current?.id ? saveProperty : () => addPropertyCriteria({})}
                    disabled={saving}
                    className="rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Saving..." : (current?.id ? "Update Property" : "Next")}
                  </button>
                )}
                {currentStep === 3 && (
                  <button
                    onClick={current?.id ? saveProperty : () => addPropertyShowcase({})}
                    disabled={saving}
                    className="rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Saving..." : (current?.id ? "Update Property" : "Next")}
                  </button>
                )}
                {currentStep === 4 && (
                  <button
                    onClick={finalizeProperty}
                    disabled={saving}
                    className="rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Publishing..." : "Publish Property"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete property"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Are you sure you want to delete{" "}
            <span className="font-medium">
              {current?.propertyTitle || "this property"}
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

      {/* Matching rules */}
      <Modal
        open={rulesOpen}
        onClose={() => setRulesOpen(false)}
        title="Property matching rules"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-700">
              Overall threshold (%)
            </label>
            <input
              type="number"
              value={settings.overallThresholdPct}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  overallThresholdPct: parseInt(e.target.value) || 0,
                }))
              }
              className="w-32 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
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
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={r.enabled}
                        onChange={(e) =>
                          setRules((arr) =>
                            arr.map((x, i) =>
                              i === idx
                                ? { ...x, enabled: e.target.checked }
                                : x
                            )
                          )
                        }
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={r.attribute}
                        onChange={(e) =>
                          setRules((arr) =>
                            arr.map((x, i) =>
                              i === idx
                                ? { ...x, attribute: e.target.value }
                                : x
                            )
                          )
                        }
                        className="rounded-md border border-gray-300 px-2 py-1"
                      >
                        {availableAttributes.map((attr) => (
                          <option key={attr} value={attr}>
                            {attr}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={r.operator}
                        onChange={(e) =>
                          setRules((arr) =>
                            arr.map((x, i) =>
                              i === idx ? { ...x, operator: e.target.value } : x
                            )
                          )
                        }
                        className="rounded-md border border-gray-300 px-2 py-1"
                      >
                        <option>{"=="}</option>
                        <option>{">="}</option>
                        <option>{"<="}</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={r.value}
                        onChange={(e) =>
                          setRules((arr) =>
                            arr.map((x, i) =>
                              i === idx
                                ? {
                                    ...x,
                                    value: isNaN(Number(e.target.value))
                                      ? e.target.value
                                      : Number(e.target.value),
                                  }
                                : x
                            )
                          )
                        }
                        className="w-full rounded-md border border-gray-300 px-2 py-1"
                      />
                    </td>
                    <td className="px-3 py-2 w-32">
                      <input
                        type="number"
                        value={r.weightPct}
                        onChange={(e) =>
                          setRules((arr) =>
                            arr.map((x, i) =>
                              i === idx
                                ? {
                                    ...x,
                                    weightPct: parseInt(e.target.value) || 0,
                                  }
                                : x
                            )
                          )
                        }
                        className="w-full rounded-md border border-gray-300 px-2 py-1"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() =>
                          setRules((arr) => arr.filter((_, i) => i !== idx))
                        }
                        className="text-sm text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-end gap-2">
            <div>
              <label className="mb-1 block text-sm text-gray-700">
                Add new attribute
              </label>
              <input
                value={newAttribute}
                onChange={(e) => setNewAttribute(e.target.value)}
                placeholder="e.g. furnishing, pets_allowed"
                className="w-64 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button
              onClick={() => {
                if (
                  newAttribute &&
                  !availableAttributes.includes(newAttribute)
                ) {
                  setAvailableAttributes((a) => [...a, newAttribute]);
                  setNewAttribute("");
                }
              }}
              className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
            >
              Add attribute
            </button>
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={() =>
                setRules((arr) => [
                  ...arr,
                  {
                    id: `r-${Math.floor(Math.random() * 9000) + 1000}`,
                    attribute: "bedrooms",
                    operator: ">=",
                    value: 1,
                    weightPct: 10,
                    enabled: true,
                  },
                ])
              }
              className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
            >
              Add rule
            </button>
            <button
              onClick={() => setRulesOpen(false)}
              className="rounded-md bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Properties;
