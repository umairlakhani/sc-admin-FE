// Centralized dummy data for the whole app

export const dashboardChart = [
  { name: 'Jan', value: 120 },
  { name: 'Feb', value: 210 },
  { name: 'Mar', value: 180 },
  { name: 'Apr', value: 230 },
  { name: 'May', value: 250 },
  { name: 'Jun', value: 190 },
  { name: 'Jul', value: 140 },
  { name: 'Aug', value: 200 },
  { name: 'Sep', value: 280 },
  { name: 'Oct', value: 310 },
  { name: 'Nov', value: 260 },
  { name: 'Dec', value: 180 },
]

export const dashboardStats = {
  signUps: 3,
  logins: 13,
  activeUsers: 2135,
  genderMix: '45%',
  // Admin analytics
  totalUsers: 4235,
  offerUsers: 1800,
  demandUsers: 2435,
  subscribedUsers: 1560,
  subscriptionsByPlan: {
    Basic: 720,
    Pro: 620,
    Enterprise: 220,
  },
  propertiesMatchedTotal: 980,
  propertiesConfirmations: 410,
  listedPropertiesOfferUsers: 3120,
  searchedPropertiesDemandUsers: 4875,
}

export const plansData = [
  { id: 'basic', name: 'Basic', price: 9.99, currency: 'USD', billing: 'Monthly', features: ['Up to 50 listings', 'Email support'], status: 'Active' },
  { id: 'pro', name: 'Pro', price: 19.99, currency: 'USD', billing: 'Monthly', features: ['Unlimited listings', 'Priority support', 'Analytics'], status: 'Active' },
  { id: 'enterprise', name: 'Enterprise', price: 49.99, currency: 'USD', billing: 'Monthly', features: ['Custom SLA', 'Dedicated manager'], status: 'Draft' },
]

export const usersData = [
  {
    id: 'u-1001',
    name: 'Oliver Smith',
    firstName: 'Oliver',
    lastName: 'Smith',
    age: 28,
    email: 'oliver.smith@example.co.uk',
    role: 'Customer',
    status: 'Active',
    joinedAt: '2024-11-12',
    address: '221B Baker Street, London',
    propertiesCount: 12,
    activities: [
      { id: 'a1', at: '2025-01-10 09:41', action: 'Created new property listing' },
      { id: 'a2', at: '2025-01-08 18:22', action: 'Upgraded to Pro plan' },
      { id: 'a3', at: '2025-01-05 11:03', action: 'Signed in from new device' },
    ],
  },
  {
    id: 'u-1002',
    name: 'Amelia Johnson',
    firstName: 'Amelia',
    lastName: 'Johnson',
    age: 33,
    email: 'amelia.johnson@example.co.uk',
    role: 'Customer',
    status: 'Active',
    joinedAt: '2024-10-03',
    address: '1 King Street, Manchester',
    propertiesCount: 4,
    activities: [
      { id: 'a1', at: '2025-01-11 14:05', action: 'Updated profile' },
      { id: 'a2', at: '2025-01-07 09:10', action: 'Renewed subscription' },
    ],
  },
  {
    id: 'u-1003',
    name: 'Jack Brown',
    firstName: 'Jack',
    lastName: 'Brown',
    age: 26,
    email: 'jack.brown@example.co.uk',
    role: 'Customer',
    status: 'Suspended',
    joinedAt: '2024-08-21',
    address: '7 Princes Street, Edinburgh',
    propertiesCount: 0,
    activities: [
      { id: 'a1', at: '2025-01-02 16:32', action: 'Account suspended by admin' },
    ],
  },
  {
    id: 'u-1004',
    name: 'Sophia Wilson',
    firstName: 'Sophia',
    lastName: 'Wilson',
    age: 31,
    email: 'sophia.wilson@example.co.uk',
    role: 'Customer',
    status: 'Active',
    joinedAt: '2025-01-05',
    address: 'Sunset Way 19, Birmingham',
    propertiesCount: 2,
    activities: [
      { id: 'a1', at: '2025-01-06 08:15', action: 'Added payment method' },
    ],
  },
]

export const propertiesData = [
  {
    id: 'p-1001',
    title: '2-Bed Flat in London',
    type: 'Apartment',
    price: 2450,
    currency: 'GBP',
    bedrooms: 2,
    bathrooms: 2,
    areaSqft: 950,
    location: {
      address: 'Marylebone',
      city: 'London',
      state: 'England',
      country: 'United Kingdom',
      lat: 51.522,
      lng: -0.163,
    },
    ownerId: 'u-1001',
    status: 'Listed',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1560448075-bb4caa6c0f11?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=1200&auto=format&fit=crop',
    ],
    createdAt: '2024-12-02',
  },
  {
    id: 'p-1002',
    title: 'Detached House with Garden',
    type: 'House',
    price: 685000,
    currency: 'GBP',
    bedrooms: 4,
    bathrooms: 4,
    areaSqft: 3200,
    location: {
      address: 'Didsbury',
      city: 'Manchester',
      state: 'England',
      country: 'United Kingdom',
      lat: 53.417,
      lng: -2.231,
    },
    ownerId: 'u-1002',
    status: 'Listed',
    images: [
      'https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop',
    ],
    createdAt: '2024-10-18',
  },
  {
    id: 'p-1003',
    title: 'Commercial Office Space',
    type: 'Office',
    price: 4200,
    currency: 'GBP',
    bedrooms: 0,
    bathrooms: 2,
    areaSqft: 1500,
    location: {
      address: 'Spinningfields',
      city: 'Manchester',
      state: 'England',
      country: 'United Kingdom',
      lat: 53.479,
      lng: -2.252,
    },
    ownerId: 'u-1004',
    status: 'Draft',
    images: [
      'https://images.unsplash.com/photo-1507206130118-b5907f817163?q=80&w=1200&auto=format&fit=crop',
    ],
    createdAt: '2025-01-07',
  },
]

// Properties dummy data used across the app


