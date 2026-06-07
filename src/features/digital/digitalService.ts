import api from '../../lib/axios';

export const digitalService = {
  getSermons: () => api.get('/digital/sermons').then(r => r.data),
  createSermon: (data: any) => api.post('/digital/sermons', data).then(r => r.data),
  deleteSermon: (id: string) => api.delete(`/digital/sermons/${id}`),

  getConfig: () => api.get('/digital/config').then(r => r.data),
  updateConfig: (data: any) => api.put('/digital/config', data).then(r => r.data),
  generateApiKey: () => api.post('/digital/config/apikey').then(r => r.data),
};
