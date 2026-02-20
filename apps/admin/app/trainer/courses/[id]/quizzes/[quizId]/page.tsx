import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TrainerNav } from "@/components/trainer/trainer-nav"
import { QuizEditor } from "@/components/trainer/quiz-editor"
import Link from "next/link"

export default async function QuizEditorPage({ params }: { params: { id: string; quizId: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { id, quizId } = await params

  const { data: course } = await supabase
    .from("courses")
    .select("id")
    .eq("id", id)
    .eq("trainer_id", user.id)
    .single()

  if (!course) {
    notFound()
  }

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id, title")
    .eq("id", quizId)
    .eq("course_id", id)
    .single()

  if (!quiz) {
    notFound()
  }

  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("id, type, prompt, points, order_index")
    .eq("quiz_id", quizId)
    .order("order_index", { ascending: true })

  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("score, total_points, passed")
    .eq("quiz_id", quizId)

  const totalAttempts = attempts?.length || 0
  const averageScore =
    totalAttempts > 0
      ? Math.round(
          (attempts || []).reduce((sum, attempt) => {
            const percent = attempt.total_points ? (attempt.score / attempt.total_points) * 100 : 0
            return sum + percent
          }, 0) / totalAttempts
        )
      : 0
  const passRate =
    totalAttempts > 0
      ? Math.round(((attempts || []).filter((attempt) => attempt.passed).length / totalAttempts) * 100)
      : 0

  return (
    <div className="min-h-screen bg-background">
      <TrainerNav />

      <main className="container mx-auto px-4 py-8 pb-20 max-w-5xl">
        <div className="mb-6">
          <Link href={`/trainer/courses/${id}`} className="text-sm text-primary hover:underline">
            ← Back to course
          </Link>
        </div>
        <QuizEditor
          quizId={quizId}
          title={quiz.title}
          questions={questions || []}
          stats={{ totalAttempts, averageScore, passRate }}
        />
      </main>
    </div>
  )
}
