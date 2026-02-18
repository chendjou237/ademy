# PayUnit Payment Integration

This document describes the PayUnit payment gateway integration for course payments in the Ademy mobile learning platform.

## Overview

PayUnit is integrated to enable trainers to sell courses and accept payments via Mobile Money (MTN MoMo, Orange Money) and other payment methods popular in Cameroon.

## Features

- **Paid Course Enrollment**: Learners can purchase courses by completing payment via PayUnit
- **Multiple Payment Methods**: Support for MTN Mobile Money, Orange Money, and other PayUnit-supported gateways
- **Transaction Tracking**: All payment transactions are stored in Supabase for audit and reporting
- **Payment Status Verification**: Real-time verification of payment status via PayUnit API
- **WebView Payment Flow**: Seamless in-app payment experience using PayUnit hosted payment page
- **Revenue Tracking**: Trainer dashboard shows accurate revenue based on successful payments
- **Platform Fee**: Automatic calculation of platform fee (30%) and trainer earnings (70%)

## Architecture

### Database Schema

#### payment_transactions Table
Stores all payment operations:
- `id`: Unique identifier
- `transaction_id`: PayUnit transaction ID (unique)
- `course_id`: Reference to courses table
- `learner_id`: Reference to profiles table (buyer)
- `trainer_id`: Reference to profiles table (seller)
- `enrollment_id`: Reference to enrollments table (created after successful payment)
- `amount`: Payment amount in XAF
- `currency`: Currency code (default: XAF)
- `status`: Transaction status (PENDING, SUCCESS, FAILED, CANCELLED)
- `payment_method`: Payment gateway used (e.g., CM_MTNMOMO, CM_ORANGE)
- `payunit_transaction_url`: Hosted payment page URL
- `payunit_response`: Full JSON response from PayUnit API
- `created_at`, `updated_at`: Timestamps

#### enrollments Table Updates
Added payment-related columns:
- `payment_transaction_id`: Link to payment_transactions table
- `payment_status`: Enrollment payment status (FREE, PENDING, COMPLETED, FAILED, CANCELLED)

### Services

#### payunitService.ts
Main service for PayUnit API integration:

**Key Functions:**
- `initializePayment(amount, courseId, learnerId, trainerId, returnUrl)`: Initialize a payment and get hosted payment URL
- `checkPaymentStatus(transactionId)`: Verify payment status with PayUnit API
- `getPaymentGateways(amount, returnUrl, transactionId)`: Fetch available payment methods
- `completeEnrollmentAfterPayment(transactionId, learnerId, courseId)`: Create enrollment after successful payment

**API Configuration:**
- Base URL: `https://gateway.paynit.net/api`
- Authentication: Basic Auth (base64 encoded username:password)
- Headers: `x-api-key`, `mode` (test/live), `Authorization`, `Content-Type`

### Components

#### PaymentWebView.tsx
Modal component that displays PayUnit hosted payment page:
- Opens payment URL in WebView
- Monitors navigation to detect payment completion
- Handles payment success, cancellation, and errors
- Provides back navigation and close options

### Payment Flow

1. **Initialization**:
   - Learner clicks "S'inscrire" on a paid course
   - System checks if course.price > 0
   - `initializePayment()` is called to create a transaction
   - Transaction is stored in database with PENDING status

2. **Payment Page**:
   - PaymentWebView modal opens with PayUnit hosted page
   - Learner selects payment method (MTN MoMo, Orange Money, etc.)
   - Learner completes payment with their mobile money account

3. **Completion**:
   - PayUnit redirects to return_url after payment
   - WebView detects URL change and triggers success callback
   - `checkPaymentStatus()` verifies payment with PayUnit API
   - `completeEnrollmentAfterPayment()` creates the enrollment
   - Learner can now access all course lessons

4. **Post-Payment**:
   - Transaction status is updated to SUCCESS
   - Enrollment is linked to transaction
   - Trainer dashboard shows updated revenue
   - Platform fee (30%) is calculated for reporting

## Configuration

### Environment Variables

Required environment variables in `.env`:

```bash
# PayUnit API Credentials
EXPO_PUBLIC_PAYUNIT_API_USERNAME=your_username
EXPO_PUBLIC_PAYUNIT_API_PASSWORD=your_password
EXPO_PUBLIC_PAYUNIT_API_KEY=your_api_key
EXPO_PUBLIC_PAYUNIT_MODE=test  # or "live" for production
```

### PayUnit Account Setup

1. Create a PayUnit account at https://payunit.net
2. Navigate to Dashboard > Credentials
3. Copy your API username, password, and API key
4. For testing, use sandbox mode (`EXPO_PUBLIC_PAYUNIT_MODE=test`)
5. For production, switch to live mode and use live credentials

## Database Migration

Run the SQL migration to add payment tables and columns:

```bash
# Connect to your Supabase database
psql your_database_url

# Run the migration
\i apps/mobile/migrations/payment_transactions.sql
```

## Type Definitions

Updated type definitions in `packages/types/src/database.ts`:

```typescript
// Payment status types
export type PaymentStatus = 'FREE' | 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

// Payment transaction interface
export interface PaymentTransaction {
  id: string;
  enrollment_id?: string;
  course_id: string;
  learner_id: string;
  trainer_id: string;
  transaction_id: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  payment_method?: string;
  payunit_transaction_url?: string;
  payunit_response?: any;
  created_at: string;
  updated_at: string;
  // Relations
  course?: Course;
  learner?: Profile;
  trainer?: Profile;
  enrollment?: Enrollment;
}

// Updated Enrollment interface
export interface Enrollment {
  // ... existing fields
  payment_transaction_id?: string;
  payment_status: PaymentStatus;
  payment_transaction?: PaymentTransaction;
}
```

## Security

### Row Level Security (RLS)

Policies are implemented to ensure data security:

1. **Learners** can only view their own payment transactions
2. **Trainers** can view transactions for their courses
3. **Authenticated users** can create payment transactions
4. **System** can update transaction status after payment verification

### Payment Verification

- All payments are verified via PayUnit API before creating enrollments
- Transaction status is checked to ensure payment was successful
- Duplicate enrollments are prevented

### Environment Variables

- PayUnit credentials are stored as environment variables
- EXPO_PUBLIC_ prefix makes them accessible in React Native
- Never commit credentials to version control

## Testing

### Test Mode

Use PayUnit sandbox mode for testing:

```bash
EXPO_PUBLIC_PAYUNIT_MODE=test
EXPO_PUBLIC_PAYUNIT_API_KEY=sand_Ouv72G8wqlYPBzdgWp2g2V8QglqRs4
```

### Test Flow

1. Create a course with a price (e.g., 1000 XAF)
2. Try to enroll as a learner
3. Payment modal should open with PayUnit page
4. Use PayUnit test credentials to complete payment
5. Verify enrollment is created successfully
6. Check transaction in database

### Test Cases

- ✅ Free course enrollment (no payment)
- ✅ Paid course enrollment with successful payment
- ✅ Payment cancellation
- ✅ Payment failure
- ✅ Network error during payment
- ✅ Duplicate transaction prevention
- ✅ Revenue calculation in trainer dashboard

## Production Deployment

### Pre-Launch Checklist

- [ ] Update environment variables with live PayUnit credentials
- [ ] Set `EXPO_PUBLIC_PAYUNIT_MODE=live`
- [ ] Run database migration on production database
- [ ] Test payment flow with small real transaction
- [ ] Configure return_url for production domain
- [ ] Set up webhook endpoint for payment notifications (optional)
- [ ] Verify RLS policies are enabled
- [ ] Test trainer payout process

### Monitoring

Monitor the following in production:

- Payment success rate
- Failed transactions and reasons
- Payment gateway performance
- Revenue tracking accuracy
- User feedback on payment flow

## Revenue Distribution

Current platform fee structure:
- **Platform Fee**: 30%
- **Trainer Earnings**: 70%

This is calculated in the trainer dashboard:
```typescript
const accountBalance = Math.floor(totalRevenue * 0.7);
```

## Future Enhancements

Potential improvements for future versions:

1. **Payment History Screen**: Dedicated view for learners to see their payment history
2. **Earnings Dashboard**: Detailed earnings view for trainers with charts and filters
3. **Refund Support**: Ability to refund payments through PayUnit API
4. **Webhook Integration**: Real-time payment status updates via PayUnit webhooks
5. **Multiple Currency Support**: Support for other currencies beyond XAF
6. **Payment Plans**: Subscription-based or installment payment options
7. **Discount Codes**: Promotional codes for reduced pricing
8. **Payment Analytics**: Detailed analytics on payment patterns and revenue trends

## Troubleshooting

### Common Issues

**Payment modal doesn't open:**
- Check that environment variables are set correctly
- Verify course has a price > 0
- Check network connectivity

**Payment successful but enrollment not created:**
- Check console logs for errors
- Verify payment_transactions table has the transaction
- Ensure RLS policies allow enrollment creation
- Run `checkPaymentStatus()` manually with transaction ID

**Revenue not showing in dashboard:**
- Ensure payment transaction status is 'SUCCESS'
- Check that trainer_id matches in transactions
- Verify Supabase query is fetching transactions correctly

**WebView not loading:**
- Check that react-native-webview is installed
- Verify PayUnit URL is accessible
- Check device internet connection

## Support

For issues related to:
- **PayUnit API**: Contact PayUnit support at https://payunit.net
- **Integration Code**: Check implementation plan and this README
- **Database Issues**: Review migration script and RLS policies

## API Reference

### PayUnit REST API

**Initialize Payment**
```
POST https://gateway.paynit.net/api/gateway/initialize
Headers:
  - Authorization: Basic base64(username:password)
  - x-api-key: your_api_key
  - mode: test|live
  - Content-Type: application/json
Body:
  {
    "total_amount": "1000",
    "currency": "XAF",
    "transaction_id": "unique_id",
    "return_url": "https://your-app.com/return",
    "description": "Payment description",
    "notify_url": "https://your-app.com/webhook"
  }
```

**Check Payment Status**
```
GET https://gateway.paynit.net/api/gateway/paymentstatus?transaction_id={id}
Headers:
  - Authorization: Basic base64(username:password)
  - x-api-key: your_api_key
  - mode: test|live
```

**Get Payment Gateways**
```
GET https://gateway.paynit.net/api/gateway/gateways?t_url={url}&t_id={id}&t_sum={amount}
Headers:
  - Authorization: Basic base64(username:password)
  - x-api-key: your_api_key
  - mode: test|live
```

## License

This payment integration is part of the Ademy platform. All rights reserved.
