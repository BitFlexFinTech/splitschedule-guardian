// Mock Payment Provider integrations for sandbox/demo mode
// Replace with real integrations when ready for production

export interface PaymentMethod {
  id: string;
  provider: 'plaid' | 'paypal' | 'stripe' | 'apple_pay' | 'google_pay' | 'klarna' | 'sepa';
  method_type: 'bank' | 'card' | 'wallet' | 'bnpl';
  account_name: string;
  account_last_four: string;
  country: string;
  is_verified: boolean;
  is_primary: boolean;
}

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate mock account numbers
const generateLastFour = () => Math.floor(1000 + Math.random() * 9000).toString();

export const mockPaymentProviders = {
  // Plaid - Bank Account Connection
  connectPlaidBank: async (): Promise<PaymentMethod> => {
    await delay(2000);
    
    const banks = ['Chase', 'Bank of America', 'Wells Fargo', 'Citi', 'US Bank'];
    const bank = banks[Math.floor(Math.random() * banks.length)];
    
    return {
      id: `plaid_${Date.now()}`,
      provider: 'plaid',
      method_type: 'bank',
      account_name: `${bank} Checking`,
      account_last_four: generateLastFour(),
      country: 'US',
      is_verified: true,
      is_primary: false,
    };
  },

  // PayPal Connection
  connectPayPal: async (email: string): Promise<PaymentMethod> => {
    await delay(1500);
    
    return {
      id: `paypal_${Date.now()}`,
      provider: 'paypal',
      method_type: 'wallet',
      account_name: email,
      account_last_four: email.slice(-4),
      country: 'US',
      is_verified: true,
      is_primary: false,
    };
  },

  // Stripe Connect
  connectStripe: async (): Promise<PaymentMethod> => {
    await delay(1800);
    
    const cardTypes = ['Visa', 'Mastercard', 'Amex'];
    const cardType = cardTypes[Math.floor(Math.random() * cardTypes.length)];
    
    return {
      id: `stripe_${Date.now()}`,
      provider: 'stripe',
      method_type: 'card',
      account_name: `${cardType} Card`,
      account_last_four: generateLastFour(),
      country: 'US',
      is_verified: true,
      is_primary: false,
    };
  },

  // Apple Pay
  setupApplePay: async (): Promise<PaymentMethod> => {
    await delay(1200);
    
    return {
      id: `apple_${Date.now()}`,
      provider: 'apple_pay',
      method_type: 'wallet',
      account_name: 'Apple Pay',
      account_last_four: generateLastFour(),
      country: 'US',
      is_verified: true,
      is_primary: false,
    };
  },

  // Google Pay
  setupGooglePay: async (): Promise<PaymentMethod> => {
    await delay(1200);
    
    return {
      id: `google_${Date.now()}`,
      provider: 'google_pay',
      method_type: 'wallet',
      account_name: 'Google Pay',
      account_last_four: generateLastFour(),
      country: 'US',
      is_verified: true,
      is_primary: false,
    };
  },

  // Klarna (BNPL)
  connectKlarna: async (): Promise<PaymentMethod> => {
    await delay(1600);
    
    return {
      id: `klarna_${Date.now()}`,
      provider: 'klarna',
      method_type: 'bnpl',
      account_name: 'Klarna',
      account_last_four: '0000',
      country: 'EU',
      is_verified: true,
      is_primary: false,
    };
  },

  // SEPA Direct Debit
  connectSEPA: async (iban: string): Promise<PaymentMethod> => {
    await delay(1800);
    
    return {
      id: `sepa_${Date.now()}`,
      provider: 'sepa',
      method_type: 'bank',
      account_name: 'SEPA Direct Debit',
      account_last_four: iban.slice(-4),
      country: 'EU',
      is_verified: true,
      is_primary: false,
    };
  },

  // Remove payment method
  removePaymentMethod: async (methodId: string): Promise<boolean> => {
    await delay(500);
    return true;
  },

  // Set as primary
  setPrimary: async (methodId: string): Promise<boolean> => {
    await delay(300);
    return true;
  },
};

export default mockPaymentProviders;
