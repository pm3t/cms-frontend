import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import type { Plan, Subscription, Invoice } from '../types/billing';

/**
 * Hook to fetch all available subscription plans.
 */
export const usePlans = () => {
  return useQuery({
    queryKey: ['billing', 'plans'],
    queryFn: async () => {
      const response = await api.get<Plan[]>('/billing/plans');
      return response.data;
    },
  });
};

/**
 * Hook to fetch current tenant subscription details.
 * Syncs data with subscriptionStore.
 */
export const useSubscription = () => {
  const setSubscription = useSubscriptionStore((state) => state.setSubscription);

  const query = useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: async () => {
      const response = await api.get<Subscription>('/billing/subscription');
      return response.data;
    },
  });

  useEffect(() => {
    if (query.data) {
      setSubscription(query.data);
    }
  }, [query.data, setSubscription]);

  return query;
};

/**
 * Hook to fetch all invoices for the tenant.
 */
export const useInvoices = () => {
  return useQuery({
    queryKey: ['billing', 'invoices'],
    queryFn: async () => {
      const response = await api.get<Invoice[]>('/billing/invoices');
      return response.data;
    },
  });
};


/**
 * Hook to fetch specific invoice details.
 */
export const useInvoiceDetail = (id: string) => {
  return useQuery({
    queryKey: ['billing', 'invoices', id],
    queryFn: async () => {
      const response = await api.get<Invoice>(`/billing/invoices/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Hook to upgrade or change current plan.
 * Invalidates subscription and plans queries on success.
 */
export const useUpgradePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: string) => {
      const response = await api.post('/billing/upgrade', { plan_id: planId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing', 'subscription'] });
      queryClient.invalidateQueries({ queryKey: ['billing', 'plans'] });
    },
  });
};

/**
 * Hook to cancel current subscription.
 */
export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.delete('/billing/subscription');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing', 'subscription'] });
    },
  });
};
