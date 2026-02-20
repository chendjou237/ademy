-- Migration: Add quiz attempts and answers

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  passed BOOLEAN NOT NULL DEFAULT FALSE,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  answer JSONB,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON public.quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_learner_id ON public.quiz_attempts(learner_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_attempt_id ON public.quiz_answers(attempt_id);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;

-- Learners can view their own attempts and answers
CREATE POLICY "Learners can view own quiz attempts"
  ON public.quiz_attempts FOR SELECT
  USING (learner_id = auth.uid());

CREATE POLICY "Learners can create own quiz attempts"
  ON public.quiz_attempts FOR INSERT
  WITH CHECK (learner_id = auth.uid());

CREATE POLICY "Learners can view own quiz answers"
  ON public.quiz_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz_attempts
      WHERE quiz_attempts.id = quiz_answers.attempt_id
      AND quiz_attempts.learner_id = auth.uid()
    )
  );

CREATE POLICY "Learners can create own quiz answers"
  ON public.quiz_answers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quiz_attempts
      WHERE quiz_attempts.id = quiz_answers.attempt_id
      AND quiz_attempts.learner_id = auth.uid()
    )
  );

-- Trainers can view attempts for their quizzes
CREATE POLICY "Trainers can view quiz attempts"
  ON public.quiz_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes
      JOIN public.courses ON courses.id = quizzes.course_id
      WHERE quizzes.id = quiz_attempts.quiz_id
      AND courses.trainer_id = auth.uid()
    )
  );

COMMENT ON TABLE public.quiz_attempts IS 'Learner attempts for quizzes';
COMMENT ON TABLE public.quiz_answers IS 'Answers for quiz attempts';
