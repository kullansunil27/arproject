// Shared API utilities for consistent backend connections
window.API_BASE = window.location.port === '3000' ? 'http://localhost:5000/api' : '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

async function apiFetch(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: getAuthHeaders(),
      ...options
    });
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Server error. Check if backend is running: cd backend && npm start');
  }
}

async function fetchProducts() {
  try {
    // Try backend first
    const data = await apiFetch('/products');
    localStorage.setItem('products', JSON.stringify(data));
    return data;
  } catch (error) {
    // Fallback to localStorage/offline (backend already has fallback)
    const cached = localStorage.getItem('products');
    if (cached) return JSON.parse(cached);
    throw error;
  }
}

// Global exports
window.apiFetch = apiFetch;
window.fetchProducts = fetchProducts;
window.getAuthHeaders = getAuthHeaders;
window.API_BASE = API_BASE;

