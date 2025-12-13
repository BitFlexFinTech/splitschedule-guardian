// Mock Stripe service for sandbox/demo mode
// Replace with real Stripe integration when ready for production

import { APP_CONFIG } from './config';

export interface MockCheckoutSession {
  id: string;
  url: string;
  status: 'open' | 'complete' | 'expired';
}

export interface MockSubscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  plan: 'free' | 'pro_monthly' | 'pro_yearly';
  currentPeriodEnd: Date;
}

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockStripe = {
  // Create a mock checkout session
  createCheckoutSession: async (planType: 'pro_monthly' | 'pro_yearly'): Promise<MockCheckoutSession> => {
    await delay(1000); // Simulate API call
    
    return {
      id: `cs_mock_${Date.now()}`,
      url: '#mock-checkout', // In real implementation, this would be a Stripe URL
      status: 'open',
    };
  },

  // Complete a mock checkout (simulates successful payment)
  completeCheckout: async (sessionId: string): Promise<MockSubscription> => {
    await delay(1500);
    
    return {
      id: `sub_mock_${Date.now()}`,
      status: 'active',
      plan: 'pro_monthly',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    };
  },

  // Get mock subscription
  getSubscription: async (subscriptionId: string): Promise<MockSubscription | null> => {
    await delay(500);
    
    if (!subscriptionId || subscriptionId === 'none') return null;
    
    return {
      id: subscriptionId,
      status: 'active',
      plan: 'pro_monthly',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
  },

  // Cancel mock subscription
  cancelSubscription: async (subscriptionId: string): Promise<boolean> => {
    await delay(1000);
    return true;
  },

  // Issue a mock restricted debit card
  issueCard: async (): Promise<{ id: string; last4: string; status: string }> => {
    await delay(2000);
    
    return {
      id: `card_mock_${Date.now()}`,
      last4: Math.floor(1000 + Math.random() * 9000).toString(),
      status: 'active',
    };
  },

  // Process a mock payment
  processPayment: async (amount: number, description: string): Promise<{ id: string; status: string }> => {
    await delay(1500);
    
    return {
      id: `pay_mock_${Date.now()}`,
      status: 'succeeded',
    };
  },
};

export default mockStripe;
