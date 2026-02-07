import { payunitService } from '@/lib/payunit/service';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/payments/webhook
 * Handle PayUnit webhook notifications
 */
export async function POST(request: NextRequest) {
  try {
    // Parse webhook payload
    const body = await request.json();

    console.log('PayUnit webhook received:', body);

    // Extract transaction ID from webhook
    const transactionId = body.transaction_id || body.data?.transaction_id;

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Missing transaction_id in webhook payload' },
        { status: 400 }
      );
    }

    // Update payment status
    await payunitService.checkPaymentStatus(transactionId);

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payments/webhook
 * Handle PayUnit webhook verification (if needed)
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'PayUnit webhook endpoint',
    status: 'active',
  });
}
