// Real data client — talks to /api/*. Same function shapes as the previous mock.
import { api } from './api'

// ----- PUBLIC (customer) -----
export const listRestaurants  = ()   => api.get('/restaurants')
export const getRestaurant    = (id) => api.get(`/restaurants/${id}`)
export const listContests     = ({ restaurantId } = {}) =>
  restaurantId
    ? api.get(`/admin/contests`)        // admin view → scoped by token
    : api.get('/contests')              // public view
export const listWinners      = ({ restaurantId } = {}) =>
  restaurantId ? api.get('/admin/winners') : api.get('/winners')

// ----- ADMIN (scoped by JWT on server) -----
export const getMyRestaurant    = () => api.get('/admin/restaurant')
export const updateMyRestaurant = (patch) => api.patch('/admin/restaurant', patch)

// For the admin dashboard we always operate on the admin's own restaurant, so id
// is ignored server-side. We keep the signature for UI parity.
export const updateRestaurant = (_id, patch) => api.patch('/admin/restaurant', patch)

export const addContest    = (data) => api.post('/admin/contests', data)
export const deleteContest = (id)   => api.del(`/admin/contests/${id}`)
export const listContestWinners = (contestId) => api.get(`/admin/contests/${contestId}/winners`)
export const declareContestWinners = (contestId, winners) =>
  api.post(`/admin/contests/${contestId}/declare-winners`, { winners })
export const addWinner     = (data) => api.post('/admin/winners', data)
export const deleteWinner  = (id)   => api.del(`/admin/winners/${id}`)

// ----- SUPER -----
export const listAdmins     = ()               => api.get('/super/admins')
export const setAdminStatus = (phone, status)  =>
  api.patch(`/super/admins/${phone}/status`, { status })

// ----- PARTNER onboarding -----
export const submitPartnerOnboarding = (payload) => api.post('/partner/onboard', payload)
