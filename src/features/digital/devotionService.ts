import api from '../../lib/axios';

export const devotionService = {
  getDevotions: (query?: { search?: string; startDate?: string; endDate?: string }) => 
    api.get('/devotions', { params: query }).then(r => r.data),
  getDevotionById: (id: string) => api.get(`/devotions/${id}`).then(r => r.data),
  createDevotion: (data: any) => api.post('/devotions', data).then(r => r.data),
  updateDevotion: (id: string, data: any) => api.put(`/devotions/${id}`, data).then(r => r.data),
  deleteDevotion: (id: string) => api.delete(`/devotions/${id}`),

  getBiblePlans: () => api.get('/devotions/plans/all').then(r => r.data),
  getBiblePlanById: (id: string) => api.get(`/devotions/plans/${id}`).then(r => r.data),
  createBiblePlan: (data: any) => api.post('/devotions/plans', data).then(r => r.data),
  updateBiblePlan: (id: string, data: any) => api.put(`/devotions/plans/${id}`, data).then(r => r.data),
  deleteBiblePlan: (id: string) => api.delete(`/devotions/plans/${id}`),
};
