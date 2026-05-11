import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE || '/api' });

export const fetchOverview       = ()         => api.get('/overview').then(r => r.data);
export const fetchLanci          = (params)   => api.get('/lanci', { params }).then(r => r.data);
export const fetchLancio         = (id)       => api.get(`/lanci/${id}`).then(r => r.data);
export const fetchStorico        = (params)   => api.get('/storico', { params }).then(r => r.data);
export const fetchRicette        = (params)   => api.get('/ricette', { params }).then(r => r.data);
export const fetchSuggerimenti   = (tipo, q)  => api.get(`/suggerimenti/${tipo}`, { params: { q } }).then(r => r.data);
export const fetchHealth         = ()         => api.get('/health').then(r => r.data);
