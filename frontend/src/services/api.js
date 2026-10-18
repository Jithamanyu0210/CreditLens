/**
 * CreditLens FinTech Shared API Client
 * Connects frontend to Express REST backend on http://localhost:5000/api
 * Supports automatic JWT token attachment and network fallback.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.port === '5173' ? '/api' : 'http://localhost:5000/api');

const getAuthHeaders = () => {
  const token = localStorage.getItem('creditlens_token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const safeFetch = async (url, options) => {
  try {
    return await fetch(url, options);
  } catch (err) {
    // If the browser failed to fetch (backend down or refused), provide an actionable message
    const netError = new Error('Cannot connect to CreditLens backend service. Please check your network connection or verify the server is running on port 5000.');
    netError.statusCode = 0;
    netError.isNetworkError = true;
    throw netError;
  }
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    let errorMsg = data.message || (data.errors && data.errors[0]?.msg);
    if (!errorMsg) {
      if (response.status === 401) {
        errorMsg = 'Invalid email or password.';
      } else if (response.status === 409) {
        errorMsg = 'An account with this email address already exists.';
      } else if (response.status === 503) {
        errorMsg = 'CreditLens database is currently unavailable. Please verify MongoDB Atlas connection.';
      } else {
        errorMsg = `Request failed with status ${response.status}`;
      }
    }
    const error = new Error(errorMsg);
    error.statusCode = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

export const api = {
  get: async (endpoint) => {
    const response = await safeFetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  post: async (endpoint, body) => {
    const response = await safeFetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    });
    return handleResponse(response);
  },

  put: async (endpoint, body) => {
    const response = await safeFetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    });
    return handleResponse(response);
  },

  delete: async (endpoint) => {
    const response = await safeFetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// 1. Authentication APIs
export const authAPI = {
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout', {})
};

// 2. Financial Profile APIs
export const profileAPI = {
  getProfile: () => api.get('/profile'),
  saveProfile: (profileData) => api.post('/profile', profileData),
  updateProfile: (profileData) => api.put('/profile', profileData),
  deleteProfile: () => api.delete('/profile')
};

// 3. Loan Calculation APIs
export const loanAPI = {
  calculateEMI: (principal, annualRate, tenureMonths) =>
    api.post('/loans/calculate-emi', { principal, annualRate, tenureMonths }),
  getAffordability: (params) =>
    api.post('/loans/affordability', params),
  getAmortization: (principal, annualRate, tenureMonths) =>
    api.post('/loans/amortization', { principal, annualRate, tenureMonths }),
  compareLoans: (loans, profile = null) =>
    api.post('/loans/compare', { loans, profile })
};

// 4. Simulator APIs
export const simulatorAPI = {
  getMaxLoan: (params) => api.post('/simulators/max-loan', params),
  getPrepayment: (params) => api.post('/simulators/prepayment', params),
  getEmergencyFund: (params) => api.post('/simulators/emergency-fund', params),
  compareScenarios: (scenarioIds, scenarios = null) =>
    api.post('/simulators/compare-scenarios', { scenarioIds, scenarios })
};

// 5. Saved Scenarios APIs
export const scenarioAPI = {
  getScenarios: () => api.get('/scenarios'),
  getScenario: (id) => api.get(`/scenarios/${id}`),
  createScenario: (scenarioData) => api.post('/scenarios', scenarioData),
  updateScenario: (id, scenarioData) => api.put(`/scenarios/${id}`, scenarioData),
  duplicateScenario: (id) => api.post(`/scenarios/${id}/duplicate`, {}),
  deleteScenario: (id) => api.delete(`/scenarios/${id}`)
};

// 6. Google Gemini AI Financial Intelligence APIs
export const aiAPI = {
  getStatus: () => api.get('/ai/status'),
  explainAffordability: (params) => api.post('/ai/explain-affordability', params),
  explainComparison: (params) => api.post('/ai/explain-comparison', params)
};

// 7. Bank Interest Rate Comparison APIs
export const bankRateAPI = {
  getRates: (params = {}) => {
    const query = new URLSearchParams();
    if (params.loanType) query.append('loanType', params.loanType);
    if (params.category && !params.loanType) query.append('category', params.category);
    if (params.bank) query.append('bank', params.bank);
    if (params.bankType) query.append('bankType', params.bankType);
    if (params.search) query.append('search', params.search);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return api.get(`/bank-rates${queryString}`);
  },
  getCategories: () => api.get('/bank-rates/categories'),
  getBanks: () => api.get('/bank-rates/banks'),
  searchRate: (bank, loanType) => {
    const query = new URLSearchParams({ bank, loanType });
    return api.get(`/bank-rates/search?${query.toString()}`);
  },
  getRateById: (id) => api.get(`/bank-rates/${id}`),
  updateRate: (id, data) => api.put(`/bank-rates/${id}`, data),
  seedRates: () => api.post('/bank-rates/seed', {})
};

