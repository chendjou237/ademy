# Mobile App Payment Workflow

## Overview
The mobile app now calls the admin API for all payment operations instead of directly integrating with PayUnit. This provides better security and centralized payment logic.

## Updated Payment Flow

### 1. Initialize Payment
```typescript
import { initializePayment } from '@/services/payunitService';

// When user clicks "Enroll" on a paid course
const paymentResponse = await initializePayment(
  course.price,      // Amount in XAF
  course.id,         // Course ID
  course.trainer_id  // Trainer ID
);

// Get payment URL and transaction ID
const transactionId = paymentResponse.data.transaction_id;
const paymentUrl = paymentResponse.data.transaction_url;

// Show PaymentWebView modal
setPaymentUrl(paymentUrl);
setTransactionId(transactionId);
setShowPayment(true);
```

**Note:** No longer need to pass `learnerId` - the admin API gets it from the auth token.

### 2. Display Payment Page
```typescript
<PaymentWebView
  visible={showPayment}
  paymentUrl={paymentUrl}
  transactionId={transactionId}
  onSuccess={handlePaymentSuccess}
  onCancel={handlePaymentCancel}
  onError={handlePaymentError}
/>
```

The `PaymentWebView` component remains unchanged - it still displays the PayUnit hosted page and monitors for completion.

### 3. Handle Payment Success
```typescript
import { completeEnrollmentAfterPayment } from '@/services/payunitService';

const handlePaymentSuccess = async (transactionId: string) => {
  try {
    // Complete enrollment via admin API
    const enrollment = await completeEnrollmentAfterPayment(
      transactionId,
      course.id
    );

    // Update UI
    setEnrollment(enrollment);
    Alert.alert('Success', 'Enrollment completed!');
  } catch (error) {
    Alert.alert('Error', 'Payment succeeded but enrollment failed. Contact support.');
  }
};
```

**Note:** No longer need to pass `learnerId` - the admin API gets it from the auth token.

### 4. Check Payment Status (Optional)
```typescript
import { checkPaymentStatus } from '@/services/payunitService';

// Check payment status at any time
const statusResponse = await checkPaymentStatus(transactionId);

if (statusResponse.data.transaction_status === 'SUCCESS') {
  // Payment successful
} else if (statusResponse.data.transaction_status === 'FAILED') {
  // Payment failed
} else {
  // Payment pending
}
```

## Key Changes from Previous Implementation

### Before (Direct PayUnit Integration)
```typescript
// ❌ Old way - exposed PayUnit credentials
const payment = await initializePayment(
  amount,
  courseId,
  learnerId,    // Had to pass learner ID
  trainerId,
  returnUrl
);
```

### After (Admin API)
```typescript
// ✅ New way - calls admin API
const payment = await initializePayment(
  amount,
  courseId,
  trainerId,
  returnUrl     // Optional
);
// Learner ID automatically extracted from auth token
```

## Environment Variables

### Required in `.env`
```bash
# Admin API URL (where payment endpoints are hosted)
EXPO_PUBLIC_ADMIN_API_URL=http://localhost:3000

# Supabase (for authentication)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Removed from `.env`
```bash
# ❌ No longer needed - PayUnit credentials are server-side only
# EXPO_PUBLIC_PAYUNIT_API_USERNAME
# EXPO_PUBLIC_PAYUNIT_API_PASSWORD
# EXPO_PUBLIC_PAYUNIT_API_KEY
# EXPO_PUBLIC_PAYUNIT_MODE
```

## Authentication

All payment API calls require Supabase authentication. The service automatically includes the auth token:

```typescript
// Automatically handled by getAuthHeaders()
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${session?.access_token}`,
};
```

Make sure the user is logged in before calling payment functions.

## Error Handling

### API Errors
```typescript
try {
  const payment = await initializePayment(amount, courseId, trainerId);
} catch (error) {
  if (error.message.includes('Unauthorized')) {
    // User not logged in
    Alert.alert('Error', 'Please log in to continue');
  } else if (error.message.includes('Course not found')) {
    // Invalid course
    Alert.alert('Error', 'Course not found');
  } else {
    // Generic error
    Alert.alert('Error', 'Payment initialization failed');
  }
}
```

### Network Errors
```typescript
try {
  const payment = await initializePayment(amount, courseId, trainerId);
} catch (error) {
  if (error.message.includes('Network request failed')) {
    Alert.alert('Error', 'No internet connection');
  }
}
```

## Testing

### Local Development
1. Start admin app: `cd apps/admin && pnpm dev`
2. Start mobile app: `cd apps/mobile && pnpm dev`
3. Ensure `EXPO_PUBLIC_ADMIN_API_URL=http://localhost:3000` in `.env`
4. Test payment flow end-to-end

### Production
1. Update `EXPO_PUBLIC_ADMIN_API_URL` to production admin URL
2. Ensure admin app has production PayUnit credentials
3. Test with real payment methods

## Complete Example

```typescript
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { PaymentWebView } from '@/components/PaymentWebView';
import {
  initializePayment,
  completeEnrollmentAfterPayment
} from '@/services/payunitService';

export default function CourseEnrollment({ course }) {
  const [showPayment, setShowPayment] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  const handleEnroll = async () => {
    if (course.price === 0) {
      // Free course - direct enrollment
      await enrollDirectly();
    } else {
      // Paid course - initialize payment
      await initializePaymentFlow();
    }
  };

  const initializePaymentFlow = async () => {
    setEnrolling(true);
    try {
      const payment = await initializePayment(
        course.price,
        course.id,
        course.trainer_id
      );

      setTransactionId(payment.data.transaction_id);
      setPaymentUrl(payment.data.transaction_url);
      setShowPayment(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to initialize payment');
    } finally {
      setEnrolling(false);
    }
  };

  const handlePaymentSuccess = async (txId: string) => {
    setShowPayment(false);
    setEnrolling(true);

    try {
      const enrollment = await completeEnrollmentAfterPayment(
        txId,
        course.id
      );
 error);
  };

  return (
    <>
      <Button
        onPress={handleEnroll}
        loading={enrolling}
      >
        {course.price === 0 ? 'Enroll Free' : `Enroll for ${course.price} XAF`}
      </Button>

      <PaymentWebView
        visible={showPayment}
        paymentUrl={paymentUrl}
        transactionId={transactionId}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
        onError={handlePaymentError}
      />
    </>
  );
}
```

## Troubleshooting

### "Unauthorized" Error
- Check user is logged in
- Verify Supabase auth token is valid
- Check `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### "Network request failed"
- Check admin app is running
- Verify `EXPO_PUBLIC_ADMIN_API_URL` is correct
- Check network connectivity

### Payment succeeds but enrollment fails
- Check admin API logs for errors
- Verify RLS policies allow enrollment creation
- Check transaction status in database

### Payment modal doesn't open
- Verify `paymentUrl` is not empty
- Check PayUnit returned valid transaction URL
- Verify react-native-webview is installed

## Migration Checklist

If updating from the old implementation:

- [ ] Update `.env` - remove PayUnit credentials, add `EXPO_PUBLIC_ADMIN_API_URL`
- [ ] Update payment initialization calls - remove `learnerId` parameter
- [ ] Update enrollment completion calls - remove `learnerId` parameter
- [ ] Test free course enrollment
- [ ] Test paid course enrollment
- [ ] Test payment cancellation
- [ ] Test payment errors
- [ ] Verify authentication works
- [ ] Check error handling

## Support

For issues:
1. Check admin API logs
2. Check mobile app console logs
3. Verify environment variables
4. Test with demo/test mode first
5. Contact backend team if admin API issues
