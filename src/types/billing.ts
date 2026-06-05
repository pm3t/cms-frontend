export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'suspended' | 'cancelled';
export type InvoiceStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  maxMembers: number | null;
  maxUsers: number | null;
  features: string[];
}

export interface Subscription {
  id: string;
  plan: Plan;
  status: SubscriptionStatus;
  trialEndsAt: string | null;
  endDate: string;
  pendingPlanId: string | null;
  pendingPlanEffectiveAt: string | null;
  pendingPlan?: Plan; // Include the actual plan details if joined
}

export interface Invoice {
  id: string;
  amount: number;
  status: InvoiceStatus;
  createdAt: string;
  dueDate: string;
  paidAt: string | null;
  invoiceUrl: string | null;
  xenditInvoiceId: string | null;
}
