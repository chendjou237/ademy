/**
 * PayUnit Payment Types
 * Shared type definitions for payment operations
 */

export interface PaymentInitRequest {
  amount: number;
  courseId: string;
  learnerId: string;
  trainerId: string;
  returnUrl?: string;
}

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

export interface CompleteEnrollmentRequest {
  transactionId: string;
  learnerId: string;
  courseId: string;
}
