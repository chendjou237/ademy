/**
 * PayUnit Payment Service
 * Centralized payment gateway integration for course monetization
 */

import { createClient } from '@supabase/supabase-js';

// PayUnit API Configuration
const PAYUNIT_BASE_URL = 'https://gateway.payunit.net/api';
const PAYUNIT_API_USERNAME = process.env.PAYUNIT_API_USERNAME || '';
const PAYUNIT_API_PASSWORD = process.env.PAYUNIT_API_PASSWORD || '';
const PAYUNIT_API_KEY = process.env.PAYUNIT_SANDBOX_API_KEY || '';
const PAYUNIT_MODE = process.env.PAYUNIT_MODE || 'test';


// Supabase admin client for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Base64 encode username:password for Basic Auth
const getAuthToken = (): string => {
  const credentials = `${PAYUNIT_API_USERNAME}:${PAYUNIT_API_PASSWORD}`;
  return Buffer.from(credentials).toString('base64');
};

// Common headers for PayUnit API requests
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Basic ${getAuthToken()}`,
  'x-api-key': PAYUNIT_API_KEY,
  'mode': 'test',
});

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
 * Initialize a payment with PayUnit
 */
export async function initializePayment(
  amount: number,
  courseId: string,
  learnerId: string,
  trainerId: string,
  returnUrl?: string
): Promise<PaymentInitResponse> {
   console.log('💳 PayUnit Service Configuration:');
console.log('   Base URL:', PAYUNIT_BASE_URL);
console.log('   Mode:', PAYUNIT_MODE);
console.log('   Username:', PAYUNIT_API_USERNAME ? '✓ Set' : '✗ Missing');
console.log('   Password:', PAYUNIT_API_PASSWORD ? '✓ Set' : '✗ Missing');
console.log('   API Key:', PAYUNIT_API_KEY ? '✓ Set' : '✗ Missing');

  try {
    // Generate a unique transaction ID
    const transactionId = `ademy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Use provided return URL or default
    const finalReturnUrl = 'https://v0-ademy-course-platform.vercel.app/';

    const requestBody = {
      total_amount: amount,
      currency: 'XAF',
      transaction_id: transactionId ,
      return_url: finalReturnUrl,
    };

    const response = await fetch(`${PAYUNIT_BASE_URL}/gateway/initialize`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PayUnit API error: ${response.status} - ${errorText}`);
    }

    const data: PaymentInitResponse = await response.json();

    // Store transaction in Supabase
    const { error: insertError } = await supabaseAdmin
      .from('payment_transactions')
      .insert({
        transaction_id: data.data.transaction_id || transactionId,
        course_id: courseId,
        learner_id: learnerId,
        trainer_id: trainerId,
        amount,
        currency: 'XAF',
        status: 'PENDING',
        payunit_transaction_url: data.data.transaction_url,
        payunit_response: data,
      });

    if (insertError) {
      console.error('Error storing transaction:', insertError);
      throw insertError;
    }

    return data;
  } catch (error) {
    console.error('Error initializing payment:', error);
    throw error;
  }
}

/**
 * Check payment status with PayUnit
 */
export async function checkPaymentStatus(
  transactionId: string
): Promise<PaymentStatusResponse> {
  try {
    const response = await fetch(
      `${PAYUNIT_BASE_URL}/gateway/paymentstatus?transaction_id=${transactionId}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PayUnit API error: ${response.status} - ${errorText}`);
    }

    const data: PaymentStatusResponse = await response.json();

    // Map PayUnit status to our status
    const status = data.data.transaction_status === 'SUCCESS' ? 'SUCCESS' :
                   data.data.transaction_status === 'FAILED' ? 'FAILED' :
                   data.data.transaction_status === 'CANCELLED' ? 'CANCELLED' :
                   'PENDING';

    // Update transaction status in Supabase
    const { error: updateError } = await supabaseAdmin
      .from('payment_transactions')
      .update({
        status,
        payment_method: data.data.transaction_gateway,
        payunit_response: data,
        updated_at: new Date().toISOString(),
      })
      .eq('transaction_id', transactionId);

    if (updateError) {
      console.error('Error updating transaction status:', updateError);
    }

    return data;
  } catch (error) {
    console.error('Error checking payment status:', error);
    throw error;
  }
}

/**
 * Get available payment gateways from PayUnit
 */
export async function getPaymentGateways(
  amount: number,
  returnUrl: string,
  transactionId: string
): Promise<PaymentGateway[]> {
  try {
    const response = await fetch(
      `${PAYUNIT_BASE_URL}/gateway/gateways?t_url=${encodeURIComponent(returnUrl)}&t_id=${transactionId}&t_sum=${amount}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`PayUnit API error: ${response.status}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching payment gateways:', error);
    return [];
  }
}

/**
 * Complete enrollment after successful payment
 */
export async function completeEnrollmentAfterPayment(
  transactionId: string,
  learnerId: string,
  courseId: string
) {
  try {
    // Verify payment status first
    const paymentStatus = await checkPaymentStatus(transactionId);

    if (paymentStatus.data.transaction_status !== 'SUCCESS') {
      throw new Error('Payment not successful');
    }

    // Get the payment transaction record
    const { data: transaction, error: txError } = await supabaseAdmin
      .from('payment_transactions')
      .select('*')
      .eq('transaction_id', transactionId)
      .single();

    if (txError || !transaction) {
      throw new Error('Transaction not found');
    }

    // Check if enrollment already exists
    const { data: existingEnrollment } = await supabaseAdmin
      .from('enrollments')
      .select('id')
      .eq('learner_id', learnerId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (existingEnrollment) {
      // Update existing enrollment with payment info
      const { error: updateError } = await supabaseAdmin
        .from('enrollments')
        .update({
          payment_transaction_id: transaction.id,
          payment_status: 'COMPLETED',
        })
        .eq('id', existingEnrollment.id);

      if (updateError) throw updateError;

      return existingEnrollment;
    }

    // Create new enrollment
    const { data: enrollment, error: enrollError } = await supabaseAdmin
      .from('enrollments')
      .insert({
        learner_id: learnerId,
        course_id: courseId,
        progress: 0,
        payment_transaction_id: transaction.id,
        payment_status: 'COMPLETED',
      })
      .select()
      .single();

    if (enrollError) {
      throw enrollError;
    }

    // Update transaction with enrollment_id
    await supabaseAdmin
      .from('payment_transactions')
      .update({ enrollment_id: enrollment.id })
      .eq('id', transaction.id);

    return enrollment;
  } catch (error) {
    console.error('Error completing enrollment after payment:', error);
    throw error;
  }
}

export const payunitService = {
  initializePayment,
  checkPaymentStatus,
  getPaymentGateways,
  completeEnrollmentAfterPayment,
};
