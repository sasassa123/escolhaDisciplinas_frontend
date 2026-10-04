import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({ baseURL: API_BASE_URL });

export async function fetchApiHealth() {
  const response = await api.get('/health');
  return response.data;
}

export async function fetchProducts() {
  const response = await api.get('/products');
  return Array.isArray(response.data) ? response.data : [];
}

export default api;
