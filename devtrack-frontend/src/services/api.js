/**
 * api.js — Real API service (connected to Express backend)
 *
 * Uses Axios with:
 *  - Base URL from .env (VITE_API_URL)
 *  - Request interceptor  → attaches JWT token to every request
 *  - Response interceptor → unwraps data, handles auth errors globally
 *
 * To switch back to mock data, restore the mock version of this file.
 */

import axios from 'axios'

// ── Axios instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor — attach stored JWT to every request ─────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('devtrack_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor — unwrap data & handle errors globally ───────────────
api.interceptors.response.use(
  // Success: return only the response body (so callers get data directly)
  (response) => response.data,

  // Error: extract a clean message; handle 401 (expired / invalid token)
  (error) => {
    if (error.response?.status === 401) {
      // Token is gone or expired — clear storage and force re-login
      localStorage.removeItem('devtrack_token')
      localStorage.removeItem('devtrack_user')
      window.location.href = '/login'
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.msg ||
      error.message ||
      'Something went wrong. Please try again.'

    return Promise.reject(new Error(message))
  }
)

// ── Auth API ──────────────────────────────────────────────────────────────────
// POST /api/register  →  { message, token, user }
// POST /api/login     →  { message, token, user }
// POST /api/logout    →  { message }
export const authAPI = {
  register: (data)     => api.post('/api/register', data),
  login:    (data)     => api.post('/api/login', data),
  logout:   ()         => api.post('/api/logout'),
}

// ── Projects API ──────────────────────────────────────────────────────────────
// GET    /api/projects       →  Project[]
// POST   /api/projects       →  Project
// PUT    /api/projects/:id   →  Project
// DELETE /api/projects/:id   →  { message }
export const projectsAPI = {
  getAll: ()           => api.get('/api/projects'),
  create: (data)       => api.post('/api/projects', data),
  update: (id, data)   => api.put(`/api/projects/${id}`, data),
  delete: (id)         => api.delete(`/api/projects/${id}`),
}

// ── Tasks API ─────────────────────────────────────────────────────────────────
// GET    /api/tasks/:projectId  →  Task[]
// POST   /api/tasks             →  Task   (body must include projectId)
// PUT    /api/tasks/:id         →  Task
// DELETE /api/tasks/:id         →  { message }
//
// Note: projectId is kept as 2nd param in update/delete so callers don't
// need to change — it is not sent to the backend (not needed for REST calls).
export const tasksAPI = {
  getByProject: (projectId)              => api.get(`/api/tasks/${projectId}`),
  create:       (data)                   => api.post('/api/tasks', data),
  update:       (id, _projectId, data)   => api.put(`/api/tasks/${id}`, data),
  delete:       (id, _projectId)         => api.delete(`/api/tasks/${id}`),
}
