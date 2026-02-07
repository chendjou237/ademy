import { payunitService } from '@/lib/payunit/service';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/payments/initialize
 * Initialize a payment with PayUnit
 */
export async function POST(request: NextRequest) {
  try {
    // Get auth token from Authorization header (for mobile app)
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
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { amount, courseId, trainerId, returnUrl } = body;

    // Validate required fields
    if (!amount || !courseId || !trainerId) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, courseId, trainerId' },
        { status: 400 }
      );
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Verify course exists and get price
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, price, trainer_id')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Verify amount matches course price
    if (course.price !== amount) {
      return NextResponse.json(
        { error: 'Amount does not match course price' },
        { status: 400 }
      );
    }

    // Verify trainer ID matches
    if (course.trainer_id !== trainerId) {
      return NextResponse.json(
        { error: 'Invalid trainer ID' },
        { status: 400 }
      );
    }

    // Check if user already enrolled
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id, payment_status')
      .eq('learner_id', user.id)
      .eq('course_id', courseId)
      .maybeSingle();

    if (existingEnrollment && existingEnrollment.payment_status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 400 }
      );
    }

    // Initialize payment with PayUnit
    const paymentResponse = await payunitService.initializePayment(
      amount,
      courseId,
      user.id,
      trainerId,
      returnUrl
    );

    return NextResponse.json({
      success: true,
      data: paymentResponse.data,
    });

  } catch (error) {
    console.error('Error initializing payment:', error);
    return NextResponse.json(
      { error: 'Failed to initialize payment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
