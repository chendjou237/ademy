-- Migration: Allow learners to view published quizzes for enrolled courses

-- Quizzes: learners can view published quizzes for courses they're enrolled in
CREATE POLICY "Learners can view published quizzes"
  ON public.quizzes FOR SELECT
  USING (
    is_published = true
    AND EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.course_id = quizzes.course_id
      AND enrollments.learner_id = auth.uid()
    )
  );

-- Quiz questions: learners can view questions for published quizzes in enrolled courses
CREATE POLICY "Learners can view quiz questions"
  ON public.quiz_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes
      JOIN public.enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quizzes.id = quiz_questions.quiz_id
      AND quizzes.is_published = true
      AND enrollments.learner_id = auth.uid()
    )
  );
