import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE || '/api' })

export const fetchStoricoStats        = (params) => api.get('/storico/stats',             { params }).then(r => r.data)
export const fetchStorico             = (params) => api.get('/storico',                   { params }).then(r => r.data)
export const fetchArticoli            = (params) => api.get('/articoli',                  { params }).then(r => r.data)
export const fetchComponenti          = (params) => api.get('/componenti',                { params }).then(r => r.data)
export const fetchHealth              = ()        => api.get('/health').then(r => r.data)
export const fetchAnalisiMisceleFiltri = ()       => api.get('/analisi-miscele/filtri').then(r => r.data)
export const fetchAnalisiMiscele      = (params) => api.get('/analisi-miscele',           { params }).then(r => r.data)
export const fetchStoricoRicette         = (params) => api.get('/storico-ricette',           { params }).then(r => r.data)
export const fetchStoricoRicetteDettaglio= (params) => api.get('/storico-ricette/dettaglio', { params }).then(r => r.data)
export const fetchAnalisiDettaglio    = (params) => api.get('/analisi-miscele/dettaglio', { params }).then(r => r.data)
