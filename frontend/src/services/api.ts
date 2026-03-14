import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fitapp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('fitapp_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// — Auth
export const getMe = () => api.get('/auth/me');

// — Workouts
export const getWorkouts = (limit = 20, skip = 0) =>
  api.get('/workouts', { params: { limit, skip } });

export const createWorkout = (data: object) => api.post('/workouts', data);

export const deleteWorkout = (id: string) => api.delete(`/workouts/${id}`);

// — Water
export const getWaterToday = (date?: string) =>
  api.get('/water', { params: date ? { date } : {} });

export const getWaterHistory = (limit = 30) =>
  api.get('/water/history', { params: { limit } });

export const logWater = (data: { amount: number; date?: string }) =>
  api.post('/water', data);

// — AI
export const askAI = (message: string) =>
  api.post('/ai/ask', { message });

// — AI Exercises & Routines
export const searchExercises = (data: { muscleGroup: string; weight: number; height: number }) =>
  api.post('/exercises/search', data);

export const generateRoutine = (data: { days: string[]; duration: number; weight: number; height: number }) =>
  api.post('/routines/generate', data);

// — Exercise AI Image (generate + cached in DB)
export const generateExerciseImage = (nombre: string, grupoMuscular: string) =>
  api.post<{ imageBase64: string; mimeType: string }>('/exercises/image', { nombre, grupoMuscular });
