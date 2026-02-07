import { supabase } from '../lib/supabase';

// Admin API Configuration
const ADMIN_API_URL = process.env.EXPO_PUBLIC_ADMIN_API_URL || 'http://localhost:3000';

// Log the API URL on initialization (helps with debugging)
console.log('💳 Payment Service initialized with Admin API URL:', ADMIN_API_URL);

// Get auth headers for API requests
const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    console.warn('⚠️ No auth token found. User may not be logged in.');
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token}`,
  };
};

export interface PaymentInitResponse {
  status: string;
  statusCode: number;
  message: string;
  data: {
    transaction_id: string;
    transaction_amount: number;
    transaction_url: string;
    transaction_status: string;
    transaction_currency: string;
    return_url?: string;
    transaction_notify_url?: string;
  };
}

export interface PaymentStatusResponse {
  status: string;
  statusCode: number;
  message: string;
  data: {
    transaction_id: string;
    transaction_amount: number;
    transaction_real_amount?: number;
    transaction_status: string;
    transaction_currency: string;
    transaction_gateway?: string;
    notify_url?: string;
    redirect_url?: string;
  };
}

export interface PaymentGateway {
  id: number;
  shortcode: string;
  name: string;
  logo: string;
  status: string;
  country: {
    country_name: string;
    country_code: string;
  };
}

/**
 * Initialize a payment via Admin API
 * @param amount - Payment amount in XAF
 * @param courseId - Course ID for tracking
 * @param trainerId - Trainer user ID
 * @param returnUrl - URL to redirect after payment
 * @returns Payment initialization response with transaction URL
 */
export const initializePayment = async (
  amount: number,
  courseId: string,
  trainerId: string,
  returnUrl?: string
): Promise<PaymentInitResponse> => {
  try {
    const headers = await getAuthHeaders();

    // Use a default return URL if not provided (will be app deep link in production)
    const finalReturnUrl = returnUrl || `exp://localhost:8081/payment-result`;

    const response = await fetch(`${ADMIN_API_URL}/api/payments/initialize`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        amount,
        courseId,
        trainerId,
        returnUrl: finalReturnUrl,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const result = await response.json();
    return {
      status: 'success',
      statusCode: 200,
      message: 'Payment initialized',
      data: result.data,
    };
  } catch (error) {
    console.error('❌ Error initializing payment:', error);

    // Provide more helpful error messages
    if (error instanceof TypeError && error.message === 'Network request failed') {
      console.error('💡 Network error - Check:');
      console.error('   1. Admin app is running (pnpm dev in apps/admin)');
      console.error('   2. EXPO_PUBLIC_ADMIN_API_URL is set correctly in .env');
      console.error('   3. Use your computer\'s IP address, not localhost');
      console.error('   4. Both devices are on the same network');
      console.error('   Current API URL:', ADMIN_API_URL);
    }

    throw error;
  }
};

/**
 * Check payment status via Admin API
 * @param transactionId - PayUnit transaction ID
 * @returns Payment status response
 */
export const checkPaymentStatus = async (
  transactionId: string
): Promise<PaymentStatusResponse> => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${ADMIN_API_URL}/api/payments/status/${transactionId}`,
      {
        method: 'GET',
        headers,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const result = await response.json();
    return {
      status: 'success',
      statusCode: 200,
      message: 'Payment status retrieved',
      data: result.data,
    };
  } catch (error) {
    console.error('Error checking payment status:', error);
    throw error;
  }
};

/**
 * Get available payment gateways (not implemented via API yet)
 * This function is kept for backward compatibility but may not be needed
 * @returns Empty array for now
 */
export const getPaymentGateways = async (
  amount: number,
  returnUrl: string,
  transactionId: string
): Promise<PaymentGateway[]> => {
  // This functionality is handled by PayUnit's hosted payment page
  // No need to fetch gateways separately in the mobile app
  console.warn('getPaymentGateways is deprecated - payment methods are shown on PayUnit hosted page');
  return [];
};

/**
 * Complete enrollment after successful payment via Admin API
 * @param transactionId - PayUnit transaction ID
 * @param courseId - Course ID
 */
export const completeEnrollmentAfterPayment = async (
  transactionId: string,
  courseId: string
) => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${ADMIN_API_URL}/api/payments/complete`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        transactionId,
        courseId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error completing enrollment after payment:', error);
    throw error;
  }
};

export const payunitService = {
  initializePayment,
  checkPaymentStatus,
  getPaymentGateways,
  completeEnrollmentAfterPayment,
};
