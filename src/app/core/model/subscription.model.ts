import { SubscriptionPlan, SubscriptionStatus } from './enums';

export interface Subscription {
  id: string;
  clientId: string;
  planType: SubscriptionPlan;
  status: SubscriptionStatus;
  monthlyPrice: number;
  startDate: string;
  nextBillingDate: string;
  cancelledAt?: string;
  deliveryAddressId: string;
  preferredDeliveryDay: number;
  preferredCategories?: string;
}

export interface SurpriseBoxPlan {
  id: string;
  name: string;
  description?: string;
  monthlyPrice: number;
  deliveriesPerMonth: number;
  estimatedBoxValue: number;
  isActive: boolean;
}

export interface SurpriseBoxSubscription {
  id: string;
  clientId: string;
  surpriseBoxPlanId: string;
  status: SubscriptionStatus;
  deliveriesUsedThisMonth: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  startDate: string;
  nextBillingDate: string;
  cancelledAt?: string;
  plan?: SurpriseBoxPlan;
}
