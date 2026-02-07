import { payunitService } from '@/lib/payunit/service';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/payments/complete
 * Complete enrollment after successful payment
 */
export async function POST(request: NextRequest) {
  try {
    // Get auth token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Create Supabase client with the provided token
    const supabase = createClient(
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

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { transactionId, courseId } = body;

    // Validate required fields
    if (!transactionId || !courseId) {
      return NextResponse.json(
        { error: 'Missing required fields: transactionId, courseId' },
        { status: 400 }
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

    // Verify user is the learner
    if (transaction.learner_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to complete this enrollment' },
        { status: 403 }
      );
    }

    // Verify course ID matches
    if (transaction.course_id !== courseId) {
      return NextResponse.json(
        { error: 'Course ID does not match transaction' },
        { status: 400 }
      );
    }

    // Complete enrollment
    const enrollment = await payunitService.completeEnrollmentAfterPayment(
      transactionId,
      user.id,
      courseId
    );

    return NextResponse.json({
      success: true,
      data: enrollment,
    });

  } catch (error) {
    console.error('Error completing enrollment:', error);
    return NextResponse.json(
      {
        error: 'Failed to complete enrollment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
