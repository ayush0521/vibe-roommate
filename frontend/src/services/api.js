import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  timeout: 15000,
  withCredentials: true, // Send httpOnly cookies on every request
});

// ── Auto-Refresh Interceptor ───────────────────────────────────────────────
// When a 401 is received (access token expired), automatically tries to refresh
// using the vr_refresh httpOnly cookie. If refresh succeeds, retries the
// original request transparently. If refresh fails, redirects to login.

let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) => error ? reject(error) : resolve());
  failedQueue = [];
};

API.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // Auth endpoints themselves — never retry (avoids infinite loops)
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/');

    if (err.response?.status === 401 && !originalRequest?._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Queue concurrent requests while a refresh is in-flight
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => API(originalRequest))
          .catch(() => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Silent token refresh — browser sends vr_refresh cookie automatically
        await API.post('/auth/refresh');
        processQueue(null);
        return API(originalRequest); // Retry original request with new access token
      } catch (refreshErr) {
        processQueue(refreshErr);
        // Refresh failed — clear stale local data and redirect to login
        localStorage.removeItem('vr_token');
        localStorage.removeItem('vr_user');
        if (!window.location.pathname.startsWith('/login') &&
            !window.location.pathname.startsWith('/forgot-password') &&
            !window.location.pathname.startsWith('/reset-password')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

// ── Auth ───────────────────────────────────────────────────────────────────
export const authAPI = {
  register:           (data) => API.post('/auth/register', data),
  login:              (data) => API.post('/auth/login', data),
  googleAuth:         (data) => API.post('/auth/google', data),
  me:                 ()     => API.get('/auth/me'),
  logout:             ()     => API.post('/auth/logout'),
  forgotPassword:     (data) => API.post('/auth/forgot-password', data),
  resetPassword:      (data) => API.post('/auth/reset-password', data),
  refresh:            ()     => API.post('/auth/refresh'),
  verifyEmail:        (data) => API.post('/auth/verify-email', data),
  resendVerification: ()     => API.post('/auth/resend-verification'),
};

// ── Users ──────────────────────────────────────────────────────────────────
export const usersAPI = {
  getProfile:         (id)       => API.get(`/users/profile/${id}`),
  getMe:              ()         => API.get('/users/me'),
  updateProfile:      (data)     => API.put('/users/profile', data),
  uploadPhoto:        (formData) => API.post('/users/profile/photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  toggleSavedListing: (listingId)=> API.put(`/users/saved-listings/${listingId}`),
  search:             (params)   => API.get('/users/search', { params }),
  deleteAccount:      ()         => API.delete('/users/me'),
  blockUser:          (userId)   => API.post(`/users/block/${userId}`),
  unblockUser:        (userId)   => API.delete(`/users/block/${userId}`),
  enhanceBio:         (data)     => API.post('/users/profile/enhance-bio', data),
};

// ── Quiz ───────────────────────────────────────────────────────────────────
export const quizAPI = {
  getQuestions: () => API.get('/quiz/questions'),
  submit:       (data) => API.post('/quiz/submit', data),
  getResult:    () => API.get('/quiz/result'),
};

// ── Matches ────────────────────────────────────────────────────────────────
export const matchesAPI = {
  getMatches:     (params) => API.get('/matches', { params }),
  computeMatches: () => API.post('/matches/compute'),
  getMatch:       (id) => API.get(`/matches/${id}`),
};

// ── Messages ───────────────────────────────────────────────────────────────
export const messagesAPI = {
  getConversations:  ()           => API.get('/messages/conversations'),
  getMessages:       (id, params) => API.get(`/messages/conversations/${id}`, { params }),
  startConversation: (userId)     => API.post(`/messages/conversations/start/${userId}`),
  sendMessage:       (id, data)   => API.post(`/messages/conversations/${id}`, data),
  uploadFile:        (id, formData) =>
    API.post(`/messages/conversations/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ── Meetings ───────────────────────────────────────────────────────────────
export const meetingsAPI = {
  markReady:     (conversationId) => API.post(`/meetings/ready/${conversationId}`),
  getHistory:    ()               => API.get('/meetings/history'),
  getMeeting:    (id)             => API.get(`/meetings/${id}`),
  safetyCheckin: (data)           => API.post('/meetings/safety-checkin', data),
};

// ── Listings ───────────────────────────────────────────────────────────────
export const listingsAPI = {
  getListings:   (params)       => API.get('/listings', { params }),
  getListing:    (id)           => API.get(`/listings/${id}`),
  createListing: (data)         => API.post('/listings', data),
  updateListing: (id, data)     => API.put(`/listings/${id}`, data),
  deleteListing: (id)           => API.delete(`/listings/${id}`),
  uploadImages:  (id, formData) =>
    API.post(`/listings/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMyListings: ()             => API.get('/listings/my'),
};

// ── Notifications ──────────────────────────────────────────────────────────
export const notificationsAPI = {
  getNotifications: ()   => API.get('/notifications'),
  markAsRead:       (id) => API.put(`/notifications/${id}/read`),
  markAllAsRead:    ()   => API.put('/notifications/read-all'),
};

// ── Verification ───────────────────────────────────────────────────────────
export const verificationAPI = {
  submitCollegeEmail: (data) => API.post('/verification/college-email', data),
  submitManual:       ()     => API.post('/verification/manual'),
};

// ── Reports ────────────────────────────────────────────────────────────────
export const reportsAPI = {
  createReport: (data) => API.post('/reports', data),
};

// ── Payments (Razorpay) ────────────────────────────────────────────────────
export const paymentsAPI = {
  createOrder:   ()     => API.post('/payments/create-order'),
  verifyPayment: (data) => API.post('/payments/verify', data),
  getStatus:     ()     => API.get('/payments/status'),
};

// ── Admin ──────────────────────────────────────────────────────────────────
export const adminAPI = {
  getStats:      ()          => API.get('/admin/stats'),
  getUsers:      (params)    => API.get('/admin/users', { params }),
  toggleActive:  (id)        => API.put(`/admin/users/${id}/toggle-active`),
  makePremium:   (id)        => API.put(`/admin/users/${id}/make-premium`),
  getReports:    (params)    => API.get('/admin/reports', { params }),
  resolveReport: (id, data)  => API.put(`/admin/reports/${id}/resolve`, data),
  deleteListing: (id)        => API.delete(`/admin/listings/${id}`),
};

export default API;
