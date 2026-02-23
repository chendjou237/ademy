-- Add certificate support
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS certificate_enabled BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(enrollment_id)
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Learners can view own certificates"
  ON public.certificates FOR SELECT
  USING (learner_id = auth.uid());

CREATE POLICY "Trainers can view certificates for their courses"
  ON public.certificates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = certificates.course_id
      AND courses.trainer_id = auth.uid()
    )
  );

CREATE POLICY "Learners can request certificate for completed course"
  ON public.certificates FOR INSERT
  WITH CHECK (
    learner_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.enrollments
      JOIN public.courses ON courses.id = enrollments.course_id
      WHERE enrollments.id = certificates.enrollment_id
      AND enrollments.learner_id = auth.uid()
      AND courses.certificate_enabled = true
    )
  );
