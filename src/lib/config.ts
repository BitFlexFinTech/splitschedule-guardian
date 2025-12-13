// App configuration - Set MOCK_MODE to false when ready for production
export const APP_CONFIG = {
  MOCK_MODE: true,
  STRIPE_TEST_MODE: true,
  VERSION: '1.0.0',
};

// Mock Stripe configuration
export const MOCK_STRIPE = {
  PUBLISHABLE_KEY: 'pk_test_mock_key',
  PRICES: {
    PRO_MONTHLY: 'price_mock_pro_monthly',
    PRO_YEARLY: 'price_mock_pro_yearly',
  },
};
