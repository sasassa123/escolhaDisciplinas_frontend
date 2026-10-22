import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const TOKEN_KEY = 'portal.token';

const api = axios.create({ baseURL: API_BASE_URL });

// Envia o token da sessão em todas as requisições
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Sessão expirada/inválida: avisa o AuthContext para deslogar
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && getStoredToken() && !error.config?.url?.startsWith('/auth/login')) {
      window.dispatchEvent(new Event('portal:unauthorized'));
    }
    return Promise.reject(error);
  },
);

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function storeToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Navegação privada sem storage: a sessão dura até recarregar a página
  }
}

/** Extrai uma mensagem amigável de um erro do Axios. */
export function getErrorMessage(error, fallback = 'Algo deu errado. Tente novamente.') {
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.code === 'ERR_NETWORK') return 'Não foi possível conectar com a API. Verifique se ela está rodando.';
  return fallback;
}

const data = (request) => request.then((response) => response.data);

// Autenticação
export const login = (email, password) => data(api.post('/auth/login', { email, password }));
export const register = (payload) => data(api.post('/auth/register', payload));
export const confirmEmail = (token) => data(api.post('/auth/confirm', { token }));
export const resendConfirmation = (email) => data(api.post('/auth/resend', { email }));
export const logout = () => data(api.post('/auth/logout'));

// Geral
export const fetchApiHealth = () => data(api.get('/health'));
export const fetchMeta = () => data(api.get('/meta'));
export const fetchActivity = () => data(api.get('/activity'));
export const searchAll = (q) => data(api.get('/search', { params: { q } }));

// Disciplinas
export const fetchDisciplines = (params = {}) => data(api.get('/disciplines', { params }));
export const fetchDiscipline = (code) => data(api.get(`/disciplines/${encodeURIComponent(code)}`));

// Materiais
export const fetchMaterials = (code, params = {}) => data(api.get(`/disciplines/${encodeURIComponent(code)}/materials`, { params }));
export const uploadMaterial = (code, payload) => data(api.post(`/disciplines/${encodeURIComponent(code)}/materials`, payload));
export const voteMaterial = (id, value) => data(api.post(`/materials/${id}/vote`, { value }));
export const deleteMaterial = (id) => data(api.delete(`/materials/${id}`));
export const materialDownloadUrl = (id) => `${API_BASE_URL}/materials/${id}/download`;
export const materialViewUrl = (id) => `${API_BASE_URL}/materials/${id}/view`;

// Avaliações
export const fetchReviews = (code, params = {}) => data(api.get(`/disciplines/${encodeURIComponent(code)}/reviews`, { params }));
export const saveReview = (code, payload) => data(api.put(`/disciplines/${encodeURIComponent(code)}/reviews`, payload));
export const deleteReview = (id) => data(api.delete(`/reviews/${id}`));

// Perguntas e respostas
export const fetchQuestions = (code, params = {}) => data(api.get(`/disciplines/${encodeURIComponent(code)}/questions`, { params }));
export const createQuestion = (code, payload) => data(api.post(`/disciplines/${encodeURIComponent(code)}/questions`, payload));
export const fetchQuestion = (id) => data(api.get(`/questions/${id}`));
export const deleteQuestion = (id) => data(api.delete(`/questions/${id}`));
export const createAnswer = (questionId, body) => data(api.post(`/questions/${questionId}/answers`, { body }));
export const markBestAnswer = (questionId, answerId) => data(api.post(`/questions/${questionId}/best`, { answerId }));
export const voteAnswer = (id, value) => data(api.post(`/answers/${id}/vote`, { value }));
export const deleteAnswer = (id) => data(api.delete(`/answers/${id}`));

// Denúncias e moderação
export const createReport = (payload) => data(api.post('/reports', payload));
export const fetchReports = (status) => data(api.get('/moderation/reports', { params: { status } }));
export const decideReport = (id, action) => data(api.post(`/moderation/reports/${id}/decision`, { action }));

// Usuários e notificações
export const fetchMe = () => data(api.get('/users/me'));
export const updateMe = (payload) => data(api.patch('/users/me', payload));
export const fetchUser = (id) => data(api.get(`/users/${id}`));
export const fetchNotifications = () => data(api.get('/notifications'));
export const markNotificationsRead = (id) => data(api.post('/notifications/read', id ? { id } : {}));

export default api;
