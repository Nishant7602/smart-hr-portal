import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

// Auto-attach JWT token
API.interceptors.request.use(config => {
  const token = localStorage.getItem('hr_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 and 403 globally - auto logout on invalid/expired token
API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hr_token');
      localStorage.removeItem('hr_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ===================== AUTH =====================
export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
};

// ===================== JOBS =====================
export const jobsAPI = {
  getAll: (params) => API.get('/jobs', { params }),
  getById: (id) => API.get(`/jobs/${id}`),
  create: (data) => API.post('/jobs', data),
  update: (id, data) => API.put(`/jobs/${id}`, data),
  delete: (id) => API.delete(`/jobs/${id}`),
  getDepartments: () => API.get('/jobs/departments'),
  generateJD: (data) => API.post('/jobs/generate-jd', data),
};

// ===================== APPLICANTS =====================
export const applicantsAPI = {
  apply: (jobId, data, resume) => {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (resume) formData.append('resume', resume);
    return API.post(`/applicants/job/${jobId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getByJob: (jobId, params) => API.get(`/applicants/job/${jobId}`, { params }),
  getById: (id) => API.get(`/applicants/${id}`),
  updateStatus: (id, status) => API.patch(`/applicants/${id}/status?status=${status}`),
  screen: (id) => API.post(`/applicants/${id}/screen`),
  getRanked: (jobId) => API.get(`/applicants/job/${jobId}/ranked`),
  delete: (id) => API.delete(`/applicants/${id}`),
};

// ===================== INTERVIEWS =====================
export const interviewsAPI = {
  schedule: (data) => API.post('/interviews', data),
  getById: (id) => API.get(`/interviews/${id}`),
  getByJob: (jobId) => API.get(`/interviews/job/${jobId}`),
  getByApplicant: (id) => API.get(`/interviews/applicant/${id}`),
  getUpcoming: () => API.get('/interviews/upcoming'),
  update: (id, data) => API.put(`/interviews/${id}`, data),
  submitFeedback: (id, data) => API.post(`/interviews/${id}/feedback`, data),
  cancel: (id) => API.post(`/interviews/${id}/cancel`),
  generateQuestions: (id) => API.get(`/interviews/${id}/questions`),
};

// ===================== EXTENDED AI =====================
export const aiAPI = {
  generateOfferLetter: (data) => API.post('/ai/offer-letter', data),
  generateRejectionEmail: (data) => API.post('/ai/rejection-email', data),
  chat: (message, context) => API.post('/ai/chat', { message, context }),
  skillGap: (data) => API.post('/ai/skill-gap', data),
  skillGapByApplicant: (applicantId) => API.get(`/ai/skill-gap/applicant/${applicantId}`),
  salaryBenchmark: (data) => API.post('/ai/salary-benchmark', data),
  hiringReport: (jobId) => API.get(`/ai/hiring-report/${jobId}`),
};

export default API;
