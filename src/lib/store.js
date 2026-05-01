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
export const listSuperRestaurants = ()       => api.get('/super/restaurants')
export const listSuperWinners     = ()       => api.get('/super/winners')
export const addSuperWinner       = (data)   => api.post('/super/winners', data)
export const deleteSuperWinner    = (id)     => api.del(`/super/winners/${id}`)

export const listSuperContests           = ()           => api.get('/super/contests')
export const addSuperContest             = (data)       => api.post('/super/contests', data)
export const deleteSuperContest          = (id)         => api.del(`/super/contests/${id}`)
export const listSuperContestWinners     = (id)         => api.get(`/super/contests/${id}/winners`)
export const declareSuperContestWinners  = (id, winners) => api.post(`/super/contests/${id}/declare-winners`, { winners })

export const getWalletConfig        = ()           => api.get('/super/wallet-config')
export const setWalletConfig        = (data)       => api.post('/super/wallet-config', data)
export const disburseWalletCredits  = ()           => api.post('/super/wallet-config/disburse', {})
export const listWalletTransactions = ()           => api.get('/super/wallet-transactions')
export const listMyWalletTxns       = ()           => api.get('/wallet/me')
export const getRedeemHistory       = ()           => api.get('/redeem/history')
export const submitRedeemRequest    = (data)       => api.post('/redeem/request', data)
export const listAdminRedeemReqs    = (status)     => api.get(`/redeem/admin/requests${status ? `?status=${status}` : ''}`)
export const resolveRedeemRequest   = (id, data)   => api.patch(`/redeem/admin/requests/${id}`, data)
export const sendWalletCredit       = (data)       => api.post('/super/wallet/send', data)

// ----- PARTNER onboarding -----
export const submitPartnerOnboarding = (payload) => api.post('/partner/onboard', payload)
