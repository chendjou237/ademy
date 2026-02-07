# Payment Status Polling Implementation

## Overview
The PaymentWebView component now automatically polls the PayUnit API to check payment status and closes automatically when the payment is successful.

## How It Works

### 1. Automatic Status Polling
When the payment modal opens, it starts polling the payment status every 3 seconds:

```typescript
// Polls every 3 seconds
pollingIntervalRef.current = setInterval(checkStatus, 3000);
```

### 2. Status Detection
The component checks for these payment statuses:

- **SUCCESS**: Payment completed successfully
  - Stops polling
  - Closes the WebView
  - Triggers `onSuccess()` callback
  - Enrollment is created

- **FAILED**: Payment failed
  - Stops polling
  - Closes the WebView
  - Triggers `onError()` callback
  - Shows error message

- **CANCELLED**: Payment cancelled by user
  - Stops polling
  - Closes the WebView
  - Triggers `onCancel()` callback

- **PENDING**: Payment still processing
  - Continues polling
  - Shows "Checking payment status..." indicator

### 3. Automatic Cleanup
Polling is automatically stopped when:
- Payment status becomes SUCCESS, FAILED, or CANCELLED
- User manually closes the modal
- Component unmounts

## User Experience

### Before (Manual)
1. User completes payment on PayUnit page
2. User must manually close the WebView
3. User must manually trigger enrollment completion

### After (Automatic)
1. User completes payment on PayUnit page
2. ✨ WebView automatically detects success (within 3 seconds)
3. ✨ WebView closes automatically
4. ✨ Enrollment is created automatically
5. ✨ User sees success message

## Visual Feedback

A small status indicator appears at the bottom-right of the WebView showing:
```
🔄 Checking payment status...
```

This lets users know the app is monitoring their payment.

## Technical Details

### Polling Interval
- **Frequency**: Every 3 seconds
- **Start**: Immediately when modal opens
- **Stop**: When status is final (SUCCESS/FAILED/CANCELLED) or modal closes

### API Calls
```typescript
// Calls admin API which calls PayUnit
const statusResponse = await checkPaymentStatus(transactionId);
const status = statusResponse.data.transaction_status;
```

### Status Response Format
```json
{
  "status": "SUCCESS",
  "statusCode": 200,
  "message": "Payment status retrieved",
  "data": {
    "transaction_id": "ademy_1234567890_abc123",
    "transaction_status": "SUCCESS",
    "transaction_amount": 5000,
    "transaction_currency": "XAF",
    "transaction_gateway": "CM_MTNMOMO"
  }
}
```

## Error Handling

### Network Errors
If status check fails:
- Error is logged to console
- Polling continues (doesn't stop on temporary errors)
- User can still manually close if needed

### Concurrent Checks Prevention
```typescript
if (checkingStatus) return; // Prevent concurrent checks
```

Ensures only one status check runs at a time.

## Performance Considerations

### Efficient Polling
- Only polls when modal is visible
- Stops immediately on final status
- Prevents concurrent requests
- Cleans up on unmount

### Battery Impact
- 3-second interval is reasonable
- Stops quickly (average payment takes 10-30 seconds)
- No polling when modal is closed

## Testing

### Test Scenarios

1. **Successful Payment**
   ```
   1. Open payment modal
   2. Complete payment on PayU
``

4. **Manual Close**
   ```
   1. Open payment modal
   2. User clicks "Close" button
   3. ✅ Polling stops
   4. ✅ Modal closes
   5. ✅ No memory leaks
   ```

5. **Network Error During Polling**
   ```
   1. Open payment modal
   2. Disconnect internet
   3. ✅ Error logged
   4. ✅ Polling continues
   5. ✅ User can still close manually
   ```

## Console Logs

The component provides detailed logging:

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

## Configuration

### Polling Interval
To change the polling frequency, update this line:

```typescript
// Current: 3 seconds
pollingIntervalRef.current = setInterval(checkStatus, 3000);

// Faster: 2 seconds
pollingIntervalRef.current = setInterval(checkStatus, 2000);

// Slower: 5 seconds
pollingIntervalRef.current = setInterval(checkStatus, 5000);
```

### Timeout
To add a maximum polling duration:

```typescript
const MAX_POLLING_TIME = 5 * 60 * 1000; // 5 minutes
const startTime = Date.now();

const checkStatus = async () => {
  if (Date.now() - startTime > MAX_POLLING_TIME) {
    clearInterval(pollingIntervalRef.current);
    onError('Payment verification timeout. Please check your payment status.');
    return;
  }
  // ... rest of the code
};
```

## Benefits

### User Experience
✅ No manual intervention needed
✅ Faster enrollment completion
✅ Clear visual feedback
✅ Automatic error handling

### Developer Experience
✅ Automatic status detection
✅ Clean code with proper cleanup
✅ Detailed logging for debugging
✅ No memory leaks

### Reliability
✅ Handles network errors gracefully
✅ Prevents concurrent requests
✅ Stops polling on final status
✅ Works with PayUnit's async payment flow

## Future Enhancements

1. **Exponential Backoff**
   - Start with 2 seconds
   - Increase to 3, 5, 10 seconds
   - Reduces API calls for long payments

2. **WebSocket Support**
   - Real-time status updates
   - No polling needed
   - Instant notification

3. **Offline Queue**
   - Queue status checks when offline
   - Retry when connection restored

4. **Analytics**
   - Track average payment time
   - Monitor polling efficiency
   - Identify slow payment methods

## Troubleshooting

### Modal doesn't close automatically
- Check console logs for status checks
- Verify admin API is running
- Check network connectivity
- Verify PayUnit API is reachable

### Polling continues after payment
- Check if status is actually SUCCESS
- Verify cleanup code is running
- Check for JavaScript errors in console

### Too many API calls
- Verify polling interval is 3 seconds
- Check that polling stops on final status
- Ensure no duplicate intervals are created

## Related Files

- `apps/mobile/components/PaymentWebView.tsx` - Main component
- `apps/mobile/services/payunitService.ts` - API service
- `apps/admin/app/api/payments/status/[transactionId]/route.ts` - Status endpoint
- `apps/admin/lib/payunit/service.ts` - PayUnit integration

## References

- [PayUnit API Documentation](https://developer.payunit.net/rest-api/get-payment-status)
- [React useEffect Hook](https://react.dev/reference/react/useEffect)
- [React Native WebView](https://github.com/react-native-webview/react-native-webview)
