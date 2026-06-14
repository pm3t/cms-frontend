import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

/**
 * Hook to fetch all tenants in the platform.
 */
export const useTenants = () => {
  return useQuery({
    queryKey: ['super-admin', 'tenants'],
    queryFn: async () => {
      const response = await api.get('/super-admin/tenants');
      return response.data;
    },
  });
};

/**
 * Hook to suspend or activate a tenant.
 */
export const useUpdateTenantStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'suspend' | 'activate' }) => {
      const response = await api.patch(`/super-admin/tenants/${id}/${action}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'tenants'] });
    },
  });
};

/**
 * Hook to bulk delete tenants.
 */
export const useBulkDeleteTenants = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await api.post('/super-admin/tenants/bulk-delete', { ids });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'tenants'] });
    },
  });
};

/**
 * Hook to fetch all available plans for superadmin.
 */
export const useSuperAdminPlans = () => {
  return useQuery({
    queryKey: ['super-admin', 'plans'],
    queryFn: async () => {
      const response = await api.get('/super-admin/plans');
      return response.data;
    },
  });
};

/**
 * Hook to update a tenant's plan directly.
 */
export const useUpdateTenantPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, planId }: { id: string; planId: string }) => {
      const response = await api.patch(`/super-admin/tenants/${id}/plan`, { planId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'tenants'] });
    },
  });
};

/**
 * Hook to fetch revenue summary for superadmin.
 */
export const useRevenueSummary = () => {
  return useQuery({
    queryKey: ['super-admin', 'revenue'],
    queryFn: async () => {
      const response = await api.get('/super-admin/revenue');
      return response.data;
    },
  });
};

/**
 * Hook to fetch all invoices across all tenants.
 */
export const useSuperAdminInvoices = () => {
  return useQuery({
    queryKey: ['super-admin', 'invoices'],
    queryFn: async () => {
      const response = await api.get('/super-admin/invoices');
      return response.data;
    },
  });
};
