# Web Payment Implementation - Admin App

## Overview
The admin web app now supports payment processing for paid courses, allowing learners to enroll directly from their browser. The implementation mirrors the mobile app's payment flow with automatic status detection.

## Architecture

### Payment Flow
```
User clicks "Enroll" → Check course price
     ↓
If FREE → Direct enrollment
     ↓
If PAID → Initialize payment via API
     ↓
Show PaymentModal with PayUnit iframe
     ↓
Auto-poll status every 3 seconds
     ↓
On SUCCESS → Complete enrollment → Redirect to dashboard
```

## Components

### 1. PaymentModal Component
**Location**: `apps/admin/components/courses/payment-modal.tsx`

**Features**:
- Displays PayUnit hosted payment page in an iframe
- Automatic status polling every 3 seconds
- Auto-closes on payment SUCCESS
- Handles FAILED, CANCELLED, PENDING states
- Visual status indicator
- Proper cleanup and memory management

**Props**:
```typescript
interface PaymentModalProps {
  open: boolean                              // Modal visibility
  onOpenChange: (open: boolean) => void      // Modal state handler
  paymentUrl: string                         // PayUnit hosted page URL
  transactionId: string                      // Transaction ID for polling
  onSuccess: (transactionId: string) => void // Success callback
  onCancel: () => void                       // Cancel callback
  onError: (error: string) => void           // Error callback
}
```

**Key Features**:
- **Iframe Integration**: Embeds PayUnit payment page
- **Auto-polling**: Checks status every 3 seconds
- **Loading State**: Shows spinner while iframe loads
- **Status Indicator**: Bottom-right indicator shows "Checking payment status..."
- **Cleanup**: Stops polling on modal close or final status

### 2. EnrollButton Component (Updated)
**Location**: `apps/admin/components/courses/enroll-button.tsx`

**Features**:
- Handles both free and paid course enrollment
- Initializes payment for paid courses
- Shows PaymentModal for payment
- Completes enrollment after successful payment
- Error and success message display

**Props**:
```typescript
interface EnrollButtonProps {
  courseId: string    // Course ID
  userId: string      // Current user ID
  coursePrice: number // Course price (0 for free)
  trainerId: string   // Trainer user ID
}
```

**Flow**:
1. **Free Course** (price = 0):
   - Direct enrollment via Supabase
   - Set `payment_status: 'FREE'`
   - Redirect to learner dashboard

2. **Paid Course** (price > 0):
   - Call `/api/payments/initialize`
   - Store transaction ID and payment URL
   - Show PaymentModal
   - Wait for payment completion
   - Call `/api/payments/complete`
   - Redirect to learner dashboard

### 3. Course Page (Updated)
**Location**: `apps/admin/app/courses/[id]/page.tsx`

**Changes**:
- Pass `coursePrice` and `trainerId` to EnrollButton
- Button text shows price for paid courses
- Maintains existing free course flow

## Payment Flow Details

### Step 1: User Clicks Enroll
```typescript
const handleEnroll = async () => {
  if (coursePrice === 0) {
    // Free course - direct enrollment
    await supabase.from("enrollments").insert({
      learner_id: userId,
      course_id: courseId,
      payment_s
   setTransactionId(result.data.transaction_id)
    setShowPayment(true)
  }
}
```

### Step 2: Payment Modal Opens
- Displays PayUnit hosted payment page in iframe
- User selects payment method (MTN MoMo, Orange Money, etc.)
- User completes payment on PayUnit

### Step 3: Automatic Status Detection
```typescript
useEffect(() => {
  const checkStatus = async () => {
    const response = await fetch(`/api/payments/status/${transactionId}`)
    const result = await response.json()
    const status = result.data.transaction_status

    if (status === 'SUCCESS') {
      clearInterval(pollingIntervalRef.current)
      onSuccess(transactionId)
    }
  }

  // Poll every 3 seconds
  pollingIntervalRef.current = setInterval(checkStatus, 3000)
}, [open, transactionId])
```

### Step 4: Enrollment Completion
```typescript
const handlePaymentSuccess = async (transactionId: string) => {
  setShowPayment(false)

  // Complete enrollment via API
  const response = await fetch('/api/payments/complete', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      transactionId,
      courseId,
    }),
  })

  // Redirect to dashboard
  router.push("/learner/dashboard")
  router.refresh()
}
```

## API Endpoints Used

### POST /api/payments/initialize
Initialize a payment transaction.

**Request**:
```json
{
  "amount": 5000,
  "courseId": "uuid",
  "trainerId": "uuid",
  "returnUrl": "https://yourdomain.com/courses/uuid"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "transaction_id": "ademy_1234567890_abc123",
    "transaction_url": "https://gateway.payunit.net/...",
    "transaction_status": "PENDING",
    "transaction_amount": 5000,
    "transaction_currency": "XAF"
  }
}
```

### GET /api/payments/status/[transactionId]
Check payment status.

**Response**:
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

### POST /api/payments/complete
Complete enrollment after successful payment.

**Request**:
```json
{
  "transactionId": "ademy_1234567890_abc123",
  "courseId": "uuid"
}
```

**Response**:
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

## User Experience

### Before (Free Courses Only)
1. User clicks "Enroll Now"
2. Enrollment created immediately
3. Redirect to dashboard

### After (Free + Paid Courses)
1. User clicks "Enroll for 5,000 XAF" (or "Enroll Now" for free)
2. **If free**: Same as before
3. **If paid**:
   - Payment modal opens
   - User completes payment on PayUnit
   - ✨ Modal auto-closes on success (within 3 seconds)
   - ✨ Enrollment created automatically
   - Success message shown
   - Redirect to dashboard

## Visual Feedback

### Enroll Button States
- **Default**: "Enroll Now" (free) or "Enroll for X XAF" (paid)
- **Loading**: "Processing..."
- **Success**: Green alert with checkmark
- **Error**: Red alert with error icon

### Payment Modal States
- **Loading**: Spinner overlay while iframe loads
- **Checking**: Bottom-right indicator "Checking payment status..."
- **Success**: "Payment successful!" message
- **Failed**: "Payment failed" message
- **Cancelled**: "Payment cancelled" message

## Error Handling

### Network Errors
```typescript
try {
  const response = await fetch('/api/payments/initialize')
  if (!response.ok) {
    throw new Error('Failed to initialize payment')
  }
} catch (err) {
  setError(err.message || "Failed to enroll in course")
}
```

### Payment Errors
- **Failed Payment**: Shows error alert, allows retry
- **Cancelled Payment**: Shows info alert, allows retry
- **Network Error**: Logs error, continues polling
- **Enrollment Error**: Shows error with support message

## Security

### Authentication
- All API calls include Bearer token
- Token extracted from Supabase session
- Server validates token on each request

### Validation
- Course price verified on server
- Trainer ID validated
- Duplicate enrollment prevented
- Payment status verified before enrollment

## Testing

### Test Scenarios

1. **Free Course Enrollment**
   ```
   1. Navigate to free course page
   2. Click "Enroll Now"
   3. ✅ Enrollment created immediately
   4. ✅ Redirected to dashboard
   ```

2. **Paid Course Enrollment - Success**
   ```
   1. Navigate to paid course page
   2. Click "Enroll for X XAF"
   3. ✅ Payment modal opens
   4. Complete payment on PayUnit
   5. ✅ Modal auto-closes within 3 seconds
   6. ✅ Success message shown
   7. ✅ Enrollment created
   8. ✅ Redirected to dashboard
   ```

3. **Paid Course Enrollment - Cancel**
   ```
   1. Navigate to paid course page
   2. Click "Enroll for X XAF"
   3. ✅ Payment modal opens
   4. Click "Cancel" button
   5. ✅ Modal closes
   6. ✅ Info message shown
   7. ✅ Can retry enrollment
   ```

4. **Paid Course Enrollment - Failed**
   ```
   1. Navigate to paid course page
   2. Click "Enroll for X XAF"
   3. ✅ Payment modal opens
   4. Payment fails on PayUnit
   5. ✅ Modal auto-closes
   6. ✅ Error message shown
   7. ✅ Can retry enrollment
   ```

5. **Already Enrolled**
   ```
   1. Navigate to enrolled course page
   2. ✅ Shows "Go to My Courses" button
   3. ✅ No enroll button visible
   ```

### Test Commands

```bash
# Start admin app
cd apps/admin
pnpm dev

# Open in browser
open http://localhost:3000

# Test flow
1. Sign up/login as learner
2. Browse courses
3. Try enrolling in free course
4. Try enrolling in paid course
5. Complete payment on PayUnit test page
6. Verify enrollment in dashboard
```

## Console Logs

### Browser Console
```
🔄 Starting payment status polling for transaction: ademy_1234567890_abc123
📡 Checking payment status...
📊 Payment status: PENDING
📡 Checking payment status...
📊 Payment status: PENDING
📡 Checking payment status...
📊 Payment status: SUCCESS
✅ Payment successful!
```

### Server Logs
```
POST /api/payments/initialize 200 in 1.2s
GET /api/payments/status/ademy_1234567890_abc123 200 in 450ms
GET /api/payments/status/ademy_1234567890_abc123 200 in 420ms
GET /api/payments/status/ademy_1234567890_abc123 200 in 380ms
POST /api/payments/complete 200 in 890ms
```

## Differences from Mobile App

### Similarities
- ✅ Same payment flow
- ✅ Same API endpoints
- ✅ Same auto-polling mechanism
- ✅ Same status detection
- ✅ Same enrollment completion

### Differences
- **UI**: Dialog modal instead of full-screen WebView
- **Iframe**: Uses iframe instead of WebView component
- **Navigation**: Uses Next.js router instead of Expo router
- **Styling**: Tailwind CSS instead of React Native styles
- **Alerts**: Shadcn alerts instead of React Native Alert

## Performance

### Polling Efficiency
- **Frequency**: 3 seconds (same as mobile)
- **Duration**: Average 10-30 seconds per payment
- **API Calls**: ~3-10 calls per payment
- **Browser Impact**: Minimal (stops quickly)

### Optimization Opportunities
1. **WebSocket**: Real-time updates instead of polling
2. **Exponential Backoff**: Increase interval over time
3. **Timeout**: Maximum 5 minutes, then show error
4. **Caching**: Cache payment status for 1 second

## Troubleshooting

### Issue: Payment modal doesn't open
**Solution**: Check browser console for errors
- Verify API endpoint is reachable
- Check authentication token is valid
- Verify course price is correct

### Issue: Iframe doesn't load
**Solution**: Check PayUnit URL
- Verify PayUnit API is reachable
- Check CORS settings
- Try opening URL directly in new tab

### Issue: Modal doesn't close automatically
**Solution**: Check console logs
- Verify status polling is running
- Check API responses
- Verify PayUnit status is SUCCESS

### Issue: Enrollment not created
**Solution**: Check database
- Verify payment_transactions table has record
- Check transaction status is SUCCESS
- Manually call /api/payments/complete

## Browser Compatibility

### Supported Browsers
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Known Issues
- **Safari**: May block iframe if third-party cookies disabled
- **Firefox**: May show security warning for iframe
- **Mobile browsers**: Works but mobile app recommended

## Next Steps

### Immediate
- [x] Create PaymentModal component
- [x] Update EnrollButton for paid courses
- [x] Update course page with new props
- [x] Test payment flow end-to-end

### Short-term
- [ ] Add payment history page for learners
- [ ] Add loading skeleton for payment modal
- [ ] Add payment method icons
- [ ] Improve error messages

### Long-term
- [ ] Add payment analytics dashboard
- [ ] Support multiple currencies
- [ ] Add discount codes
- [ ] Implement refund system
- [ ] Add payment receipts

## Files Created/Modified

### Created
1. `apps/admin/components/courses/payment-modal.tsx` - Payment modal component
2. `WEB_PAYMENT_IMPLEMENTATION.md` - This documentation

### Modified
1. `apps/admin/components/courses/enroll-button.tsx` - Added payment support
2. `apps/admin/app/courses/[id]/page.tsx` - Pass price and trainer ID

## Success Criteria ✅

- [x] Payment modal component created
- [x] Enroll button handles paid courses
- [x] Automatic status polling implemented
- [x] Auto-close on payment success
- [x] Enrollment created after payment
- [x] Error handling implemented
- [x] Success/error messages shown
- [x] Proper cleanup and memory management
- [x] TypeScript types correct
- [x] No console errors

## Conclusion

The admin web app now supports full payment processing for paid courses. The implementation:

1. **Mirrors mobile app**: Same flow, same APIs, same experience
2. **User-friendly**: Automatic detection, clear feedback, no manual steps
3. **Secure**: Server-side validation, token authentication
4. **Reliable**: Proper error handling, cleanup, and retry support
5. **Maintainable**: Clean code, TypeScript types, comprehensive docs

Learners can now enroll in paid courses directly from the web! 🎉
