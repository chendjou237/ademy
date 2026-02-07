# Payment Integration

## Architecture Overview

Payment processing is **centralized in the admin app** (Next.js). Both the mobile app and web app use the same admin API endpoints for payment processing. This provides:
- Centralized payment logic and security
- Easier credential management (server-side only)
- Consistent payment handling across platforms (web + mobile)
- Simplified client implementation
- Single source of truth for payment status

## Payment Flow

### 1. Initialization
- Mobile app checks if `course.price > 0`
- Calls `POST /api/payments/initialize` on admin API
- Admin app validates request and calls PayUnit
- Transaction stored in `payment_transactions` table with status `PENDING`
- Returns PayUnit hosted payment URL to mobile app

### 2. Payment Page
- `PaymentWebView` component displays PayUnit hosted page in modal
- Learner selects payment method (MTN MoMo, Orange Money, etc.)
- WebView monitors URL changes to detect completion

### 3. Completion
- PayUnit redirects to `return_url` after payment
- Mobile app calls `GET /api/payments/status/[transactionId]`
- Admin app verifies with PayUnit API
- If successful, mobile app calls `POST /api/payments/complete`
- Transaction status updated to `SUCCESS`, enrollment created

### 4. Post-Payment
- Enrollment created with `payment_status: 'COMPLETED'`
- Trainer dashboard shows updated revenue
- Platform fee (30%) calculated automatically

## Key Components

### Admin App (`apps/admin`)

#### lib/payunit/service.ts
Server-side PayUnit integration:
- `initializePayment()` - Start payment, get hosted URL
- `checkPaymentStatus()` - Verify payment with PayUnit
- `completeEnrollmentAfterPayment()` - Create enrollment after success
- Uses Supabase admin client for database operations

#### API Routes
- `POST /api/payments/initialize` - Initialize payment
- `GET /api/payments/status/[transactionId]` - Check payment status
- `POST /api/payments/complete` - Complete enrollment after payment
- `POST /api/payments/webhook` - Handle PayUnit webhooks

#### Web Components
- `components/courses/payment-modal.tsx` - Payment modal with iframe
- `components/courses/enroll-button.tsx` - Enrollment button with payment support
- Automatic status polling every 3 seconds
- Auto-closes modal on payment success

### Mobile App (`apps/mobile`)

#### services/payunitService.ts
Simplified service that calls admin API:
- `initializePayment()` - Calls admin API to start payment
- `checkPaymentStatus()` - Calls admin API to verify status
- `completeEnrollmentAfterPayment()` - Calls admin API to create enrollment
- Uses Supabase auth token for authentication

#### components/PaymentWebView.tsx
Modal WebView component for payment page:
- Displays PayUnit hosted payment page
- Monitors navigation for completion/cancellation
- Handles success, error, and cancel callbacks
- Automatic status polling every 3 seconds
- Auto-closes on payment success
s enrollments, set after payment)
- amount: NUMERIC (payment amount in XAF)
- currency: TEXT (default: 'XAF')
- status: TEXT (PENDING | SUCCESS | FAILED | CANCELLED)
- payment_method: TEXT (e.g., CM_MTNMOMO, CM_ORANGE)
- payunit_transaction_url: TEXT (hosted payment page URL)
- payunit_response: JSONB (full API response for debugging)
- created_at, updated_at: TIMESTAMPTZ
```

### enrollments Table Updates
```sql
- payment_transaction_id: UUID (link to payment_transactions)
- payment_status: TEXT (FREE | PENDING | COMPLETED | FAILED | CANCELLED)
```

## Environment Variables

### Admin App (`.env`)
PayUnit credentials (server-side only):
```bash
PAYUNIT_API_USERNAME=your_username
PAYUNIT_API_PASSWORD=your_password
PAYUNIT_API_KEY=your_api_key
PAYUNIT_MODE=test  # or "live" for production
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Mobile App (`.env`)
Admin API URL only:
```bash
EXPO_PUBLIC_ADMIN_API_URL=http://localhost:3000
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**Note**: PayUnit credentials are NO LONGER exposed to mobile app

## Admin API Endpoints

### POST /api/payments/initialize
Initialize a payment transaction.

**Request:**
```json
{
  "amount": 5000,
  "courseId": "uuid",
  "trainerId": "uuid",
  "returnUrl": "exp://localhost:8081/payment-result"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transaction_id": "ademy_1234567890_abc123",
    "transaction_amount": 5000,
    "transaction_url": "https://gateway.paynit.net/...",
    "transaction_status": "PENDING",
    "transaction_currency": "XAF"
  }
}
```

**Authentication:** Bearer token (Supabase auth)

**Validation:**
- Verifies course exists and price matches
- Checks trainer ID is correct
- Prevents duplicate enrollments

### GET /api/payments/status/[transactionId]
Check payment status.

**Response:**
```json
{
  "success": true,
  "data": {
    "transaction_id": "ademy_1234567890_abc123",
    "transaction_status": "SUCCESS",
    "transaction_amount": 5000,
    "transaction_gateway": "CM_MTNMOMO"
  }
}
```

**Authentication:** Bearer token (Supabase auth)

**Authorization:** User must be learner or trainer of the transaction

### POST /api/payments/complete
Complete enrollment after successful payment.

**Request:**
```json
{
  "transactionId": "ademy_1234567890_abc123",
  "courseId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "enrollment_uuid",
    "learner_id": "uuid",
    "course_id": "uuid",
    "payment_status": "COMPLETED"
  }
}
```

**Authentication:** Bearer token (Supabase auth)

**Validation:**
- Verifies payment status is SUCCESS
- Checks user is the learner
- Prevents duplicate enrollments

### POST /api/payments/webhook
Handle PayUnit webhook notifications (for future use).

**Request:** PayUnit webhook payload

**Response:**
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

**Authentication:** None (webhook endpoint)

## Revenue Distribution

- **Platform Fee**: 30%
- **Trainer Earnings**: 70%

Calculated in trainer dashboard:
```typescript
const accountBalance = Math.floor(totalRevenue * 0.7);
```

## Security & RLS Policies

### API Security
- All admin API endpoints require Supabase authentication
- Bearer token validated on each request
- User authorization checked for transaction access
- Course and trainer validation before payment initialization

### Row Level Security
- Learners can view their own transactions
- Trainers can view transactions for their courses
- Service role used for admin operations
- System can update transaction status

### Payment Verification
- Always verify payment status via PayUnit API before creating enrollment
- Check transaction status is `SUCCESS` before proceeding
- Prevent duplicate enrollments
- Store full PayUnit response for audit trail

### Credentials
- PayUnit credentials stored server-side only (admin app)
- Never exposed to mobile app or client
- Use environment variables, never commit to version control
- Supabase service role key for admin operations

## Implementation Rules

### When Adding Payment Features
1. **Always check course price** before showing payment UI
2. **Call admin API** - clients (web/mobile) never call PayUnit directly
3. **Use authentication** - include Supabase auth token in requests
4. **Handle all states**: pending, success, failed, cancelled
5. **Update both tables**: payment_transactions AND enrollments
6. **Validate on server** - admin API validates all requests
7. **Auto-poll status** - check every 3 seconds for completion
8. **Auto-close UI** - close modal/webview when payment succeeds

### Web App: Free Course Enrollment
```typescript
if (course.price === 0) {
  // Direct enrollment, no payment
  await supabase.from('enrollments').insert({
    learner_id: user.id,
    course_id: courseId,
    payment_status: 'FREE'
  });
}
```

### Web App: Paid Course Enrollment
```typescript
if (course.price > 0) {
  // Initialize payment via admin API
  const response = await fetch('/api/payments/initialize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      amount: course.price,
      courseId,
      trainerId,
      returnUrl: window.location.origin + '/courses/' + courseId,
    }),
  });

  const result = await response.json();

  // Show PaymentModal with payment URL
  setPaymentUrl(result.data.transaction_url);
  setTransactionId(result.data.transaction_id);
  setShowPayment(true);
}
```

### Web App: After Payment Completion
```typescript
// Payment modal auto-detects success via polling
const handlePaymentSuccess = async (transactionId: string) => {
  setShowPayment(false);

  // Complete enrollment via admin API
  const response = await fetch('/api/payments/complete', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      transactionId,
      courseId,
    }),
  });

  // Redirect to dashboard
  router.push('/learner/dashboard');
};
```

### Mobile App: Free Course Enrollment
```typescript
if (course.price === 0) {
  // Direct enrollment, no payment
  await supabase.from('enrollments').insert({
    learner_id: user.id,
    course_id: courseId,
    payment_status: 'FREE'
  });
}
```

### Mobile App: Paid Course Enrollment
```typescript
if (course.price > 0) {
  // Initialize payment via admin API
  const payment = await payunitService.initializePayment(
    course.price,
    courseId,
    trainerId
  );

  // Show PaymentWebView with payment URL
  setPaymentUrl(payment.data.transaction_url);
  setTransactionId(payment.data.transaction_id);
  setShowPayment(true);
}
```

### Mobile App: After Payment Completion
```typescript
// Check payment status
const status = await payunitService.checkPaymentStatus(transactionId);

if (status.data.transaction_status === 'SUCCESS') {
  // Complete enrollment
  const enrollment = await payunitService.completeEnrollmentAfterPayment(
    transactionId,
    courseId
  );

  // Navigate to course
  router.push(`/course/${courseId}`);
}
```

### Admin API: Transaction ID Format
Generate unique IDs: `ademy_${Date.now()}_${randomString}`

### Error Handling
- Catch and log all PayUnit API errors
- Show user-friendly error messages
- Store failed transactions for debugging
- Allow retry on failure

## Testing

### Test Mode
Admin app environment variables:
```bash
PAYUNIT_MODE=test
PAYUNIT_API_KEY=sand_Ouv72G8wqlYPBzdgWp2g2V8QglqRs4
```

Mobile app environment variable:
```bash
EXPO_PUBLIC_ADMIN_API_URL=http://localhost:3000
```

### Test Cases
- Free course enrollment (no payment)
- Paid course with successful payment
- Payment cancellation by user
- Payment failure (insufficient funds, etc.)
- Network error during payment
- Duplicate transaction prevention
- Revenue calculation accuracy
- API authentication and authorization
- Invalid course/trainer validation

### Testing Flow
1. Start admin app: `cd apps/admin && pnpm dev`
2. Start mobile app: `cd apps/mobile && pnpm dev`
3. Create test course with price > 0
4. Attempt enrollment from mobile app
5. Complete payment on PayUnit hosted page
6. Verify enrollment created successfully

## Common Issues

### Payment modal doesn't open
- Verify `EXPO_PUBLIC_ADMIN_API_URL` is set correctly
- Check admin app is running
- Verify course.price > 0
- Check network connectivity
- Verify Supabase auth token is valid

### Payment successful but no enrollment
- Check payment_transactions table for transaction
- Verify RLS policies allow enrollment creation
- Check admin API logs for errors
- Manually call `/api/payments/status/[transactionId]`
- Verify transaction status is 'SUCCESS'

### API returns 401 Unauthorized
- Check Supabase auth token is included in request
- Verify user is logged in
- Check token hasn't expired

### API returns 403 Forbidden
- Verify user owns the transaction (learner or trainer)
- Check course and trainer IDs match

### Revenue not showing
- Ensure transaction status is 'SUCCESS'
- Verify trainer_id matches in transactions
- Check Supabase query includes payment_transactions join

### WebView not loading
- Verify react-native-webview is installed
- Check PayUnit URL is accessible
- Test device internet connection
- Check admin API returned valid transaction_url

## Migration

Run SQL migration before using payments:
```bash
psql your_database_url < apps/mobile/migrations/payment_transactions.sql
```

## Type Definitions

Import from `@repo/types`:
```typescript
import {
  PaymentStatus,
  TransactionStatus,
  PaymentTransaction
} from '@repo/types';
```

## Future Enhancements
- Payment history screen for learners
- Detailed earnings dashboard for trainers
- Refund support via PayUnit API
- Webhook integration for real-time updates
- Multiple currency support
- Subscription/installment payment plans
- Discount codes and promotions
- Payment analytics and reporting
