import api from '../../lib/axios';

export type ReportModule = 'MEMBERSHIP' | 'ATTENDANCE' | 'FINANCE' | 'CUSTOM';

export interface ReportTemplate {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  module: ReportModule;
  config: any;
  isPublic: boolean;
  createdAt: string;
}

export const reportingService = {
  getDashboardKPIs: () => api.get('/reports/dashboard/kpi').then(r => r.data),
  getMembershipStats: () => api.get('/reports/membership/stats').then(r => r.data),
  getAttendanceStats: () => api.get('/reports/attendance/stats').then(r => r.data),
  getFinancialStats: () => api.get('/reports/finance/stats').then(r => r.data),
  
  executeCustomReport: (module: ReportModule, config: any) => 
    api.post('/reports/custom/execute', { module, config }).then(r => r.data),
    
  getTemplates: () => api.get('/reports/templates').then(r => r.data as ReportTemplate[]),
  saveTemplate: (data: any) => api.post('/reports/templates', data).then(r => r.data),
  deleteTemplate: (id: string) => api.delete(`/reports/templates/${id}`),

  getGrowthAnalytics: () => api.get('/reports/analytics/growth').then(r => r.data),
  getEngagementMetrics: () => api.get('/reports/analytics/engagement').then(r => r.data),
  getFinancialAnalytics: () => api.get('/reports/analytics/financial').then(r => r.data),
  getBenchmarking: () => api.get('/reports/analytics/benchmark').then(r => r.data),
};
