// App configuration - Set MOCK_MODE to false when ready for production
export const APP_CONFIG = {
  MODE: 'demo' as 'demo' | 'live',
  MOCK_MODE: true,
  STRIPE_TEST_MODE: true,
  VERSION: '1.0.1',
  SHOW_MODE_TOGGLE: true,
};

// Helper to check current mode
export const isLiveMode = () => APP_CONFIG.MODE === 'live';
export const isDemoMode = () => APP_CONFIG.MODE === 'demo';

// Mock Stripe configuration
export const MOCK_STRIPE = {
  PUBLISHABLE_KEY: 'pk_test_mock_key',
  PRICES: {
    PRO_MONTHLY: 'price_mock_pro_monthly',
    PRO_YEARLY: 'price_mock_pro_yearly',
  },
};

// Demo accounts configuration
export const DEMO_ACCOUNTS = {
  parent: {
    email: 'demo-parent@testsplitschedule.com',
    password: 'Demo1234$$',
    name: 'Demo Parent',
    role: 'parent' as const,
    redirectTo: '/dashboard',
  },
  lawyer: {
    email: 'demo-lawyer@testsplitschedule.com',
    password: 'Demo1234$$',
    name: 'Demo Lawyer',
    role: 'lawyer' as const,
    redirectTo: '/dashboard-lawyer',
  },
  admin: {
    email: 'admin@testsplitschedule.com',
    password: 'Admin1234$$',
    name: 'Super Admin',
    role: 'superadmin' as const,
    redirectTo: '/admin',
  },
  support: {
    email: 'support@testsplitschedule.com',
    password: 'Support1234$$',
    name: 'Support Agent',
    role: 'support_agent' as const,
    redirectTo: '/admin',
  },
};

// Currency configuration for UK/EU markets
export const CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar', locale: 'en-US' },
  GBP: { symbol: '£', name: 'British Pound', locale: 'en-GB' },
  EUR: { symbol: '€', name: 'Euro', locale: 'de-DE' },
};

export type CurrencyCode = keyof typeof CURRENCIES;
