import { create } from 'zustand';
import type { Plan, SubscriptionStatus, Subscription } from '../types/billing';

interface SubscriptionState {
  plan: Plan | null;
  status: SubscriptionStatus | null;
  isFeatureEnabled: (featureKey: string) => boolean;
  setSubscription: (data: Subscription) => void;
  clearSubscription: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  plan: null,
  status: null,
  isFeatureEnabled: (featureKey: string) => {
    const { plan, status } = get();
    if (!plan || status === 'suspended' || status === 'cancelled') return false;
    return plan.features.includes(featureKey);
  },
  setSubscription: (data) => set({ 
    plan: data.plan, 
    status: data.status 
  }),
  clearSubscription: () => set({ plan: null, status: null }),
}));
