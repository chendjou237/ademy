import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface SubmissionAnswer {
  questionId: string
  answer: any
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const quizId = typeof body?.quizId === "string" ? body.quizId : null
  const answers: SubmissionAnswer[] = Array.isArray(body?.answers) ? body.answers : []

  if (!quizId) {
    return NextResponse.json({ error: "Quiz ID is required" }, { status: 400 })
  }

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id, pass_percent")
    .eq("id", quizId)
    .eq("is_published", true)
    .single()

  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
  }

  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("id, type, correct_answer, points")
    .eq("quiz_id", quizId)

  if (!questions) {
    return NextResponse.json({ error: "No questions found" }, { status: 400 })
  }

  const answersByQuestion = new Map<string, any>()
  for (const entry of answers) {
    answersByQuestion.set(entry.questionId, entry.answer)
  }

  let score = 0
  let totalPoints = 0
  const answerRows = questions.map((question) => {
    const submitted = answersByQuestion.get(question.id)
    totalPoints += question.points || 0

    let isCorrect = false
    if (question.type === "single") {
      const expected = question.correct_answer?.value
      isCorrect = expected !== undefined && submitted === expected
    } else if (question.type === "multiple") {
      const expected = Array.isArray(question.correct_answer?.values) ? question.correct_answer.values : []
      const submittedValues = Array.isArray(submitted) ? submitted : []
      isCorrect = expected.length === submittedValues.length && expected.every((value: string) => submittedValues.includes(value))
    } else if (question.type === "true_false") {
      const expected = Boolean(question.correct_answer?.value)
      isCorrect = typeof submitted === "boolean" && submitted === expected
    }

    if (isCorrect) {
      score += question.points || 0
    }

    return {
      question_id: question.id,
      answer: submitted ?? null,
      is_correct: isCorrect,
    }
  })

  const percent = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0
  const passed = percent >= (quiz.pass_percent || 0)

  const { data: attempt, error: attemptError } = await supabase
    .from("quiz_attempts")
    .insert({
      quiz_id: quizId,
      learner_id: user.id,
      score,
      total_points: totalPoints,
      passed,
    })
    .select("id, score, total_points, passed, submitted_at")
    .single()

  if (attemptError || !attempt) {
    return NextResponse.json({ error: attemptError?.message || "Failed to save attempt" }, { status: 500 })
  }

  const { error: answersError } = await supabase
    .from("quiz_answers")
    .insert(answerRows.map((row) => ({ ...row, attempt_id: attempt.id })))

  if (answersError) {
    return NextResponse.json({ error: answersError.message }, { status: 500 })
  }

  return NextResponse.json({ data: attempt })
}
