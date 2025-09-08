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
    name: 'Priya Sharma',
    firstName: 'Priya',
    lastName: 'Sharma',
    age: 28,
    email: 'priya@example.com',
    role: 'Customer',
    status: 'Active',
    joinedAt: '2024-11-12',
    address: 'A-104, MG Road, Pune',
    propertiesCount: 12,
    activities: [
      { id: 'a1', at: '2025-01-10 09:41', action: 'Created new property listing' },
      { id: 'a2', at: '2025-01-08 18:22', action: 'Upgraded to Pro plan' },
      { id: 'a3', at: '2025-01-05 11:03', action: 'Signed in from new device' },
    ],
  },
  {
    id: 'u-1002',
    name: 'Rahul Mehta',
    firstName: 'Rahul',
    lastName: 'Mehta',
    age: 33,
    email: 'rahul@example.com',
    role: 'Customer',
    status: 'Active',
    joinedAt: '2024-10-03',
    address: '221B Baker Street, Mumbai',
    propertiesCount: 4,
    activities: [
      { id: 'a1', at: '2025-01-11 14:05', action: 'Updated profile' },
      { id: 'a2', at: '2025-01-07 09:10', action: 'Renewed subscription' },
    ],
  },
  {
    id: 'u-1003',
    name: 'Aisha Khan',
    firstName: 'Aisha',
    lastName: 'Khan',
    age: 26,
    email: 'aisha@example.com',
    role: 'Customer',
    status: 'Suspended',
    joinedAt: '2024-08-21',
    address: '7 Park Avenue, Delhi',
    propertiesCount: 0,
    activities: [
      { id: 'a1', at: '2025-01-02 16:32', action: 'Account suspended by admin' },
    ],
  },
  {
    id: 'u-1004',
    name: 'Vikram Patel',
    firstName: 'Vikram',
    lastName: 'Patel',
    age: 31,
    email: 'vikram@example.com',
    role: 'Customer',
    status: 'Active',
    joinedAt: '2025-01-05',
    address: 'Sunset Blvd 19, Ahmedabad',
    propertiesCount: 2,
    activities: [
      { id: 'a1', at: '2025-01-06 08:15', action: 'Added payment method' },
    ],
  },
]


