import { payunitService } from '@/lib/payunit/service';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/payments/status/[transactionId]
 * Check payment status with PayUnit
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const { transactionId } = await params;

    // Try to get auth from cookie first (web app), then from header (mobile app)
    let supabase;

    // Check if we have Authorization header (mobile app)
    const authHeader = request.headers.get('authorization');

    if (authHeader) {
      // Mobile app - use Bearer token
      const token = authHeader.replace('Bearer ', '');

      if (!token) {
        return NextResponse.json(
          { error: 'Unauthorized - No token provided' },
          { status: 401 }
        );
      }

      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        }
      );
    } else {
      // Web app - use cookie-based auth
      const { createClient: createServerClient } = await import('@/lib/supabase/server');
      supabase = await createServerClient();
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Verify transaction belongs to user
    const { data: transaction, error: txError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('transaction_id', transactionId)
      .single();

    if (txError || !transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Verify user is the learner or trainer
    if (transaction.learner_id !== user.id && transaction.trainer_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to view this transaction' },
        { status: 403 }
      );
    }

    // Check payment status with PayUnit
    const statusResponse = await payunitService.checkPaymentStatus(transactionId);

    return NextResponse.json({
      success: true,
      data: statusResponse.data,
    });

  } catch (error) {
    console.error('Error checking payment status:', error);
    return NextResponse.json(
      { error: 'Failed to check payment status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
