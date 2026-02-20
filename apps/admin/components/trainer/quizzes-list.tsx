"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Pencil } from "lucide-react"
import { AddQuizDialog } from "./add-quiz-dialog"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface LessonOption {
  id: string
  title: string
}

interface Quiz {
  id: string
  title: string
  lesson_id: string | null
  is_published: boolean
  pass_percent: number
  time_limit_minutes: number | null
  quiz_questions?: { count: number }[]
  lessons?: { title: string } | null
  quiz_attempts?: { count: number }[]
}

interface QuizzesListProps {
  courseId: string
  lessons: LessonOption[]
  quizzes: Quiz[]
}

export function QuizzesList({ courseId, lessons, quizzes: initialQuizzes }: QuizzesListProps) {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState(initialQuizzes)
  const [error, setError] = useState("")

  const handleDelete = async (quizId: string) => {
    if (!confirm("Delete this quiz and all its questions?") ) return

    setError("")
    try {
      const supabase = createClient()
      const { error } = await supabase.from("quizzes").delete().eq("id", quizId)
      if (error) throw error

      setQuizzes(quizzes.filter((quiz) => quiz.id !== quizId))
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Failed to delete quiz")
    }
  }

  const handleTogglePublish = async (quizId: string, nextValue: boolean) => {
    setError("")
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("quizzes")
        .update({ is_published: nextValue })
        .eq("id", quizId)

      if (error) throw error

      setQuizzes(quizzes.map((quiz) => (quiz.id === quizId ? { ...quiz, is_published: nextValue } : quiz)))
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Failed to update quiz")
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Course Quizzes</CardTitle>
            <CardDescription>Build evaluations for your course or lessons</CardDescription>
          </div>
          <AddQuizDialog
            courseId={courseId}
            lessons={lessons}
            onCreated={(quiz) => {
              const lessonTitle = lessons.find((lesson) => lesson.id === quiz.lesson_id)?.title || null
              setQuizzes((prev) => [
                {
                  ...quiz,
                  lessons: lessonTitle ? { title: lessonTitle } : null,
                  quiz_questions: [{ count: 0 }],
                  quiz_attempts: [{ count: 0 }],
                },
                ...prev,
              ])
              router.refresh()
            }}
          />
        </div>
      </CardHeader>
      <CardContent>
        {error ? <p className="text-sm text-destructive mb-4">{error}</p> : null}
        {quizzes.length > 0 ? (
          <div className="space-y-3">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold text-foreground">{quiz.title}</h4>
                    <Badge variant={quiz.is_published ? "secondary" : "outline"}>
                      {quiz.is_published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {quiz.lesson_id ? `Lesson: ${quiz.lessons?.title || "Lesson quiz"}` : "Course-level quiz"} •
                    {" "}{quiz.quiz_questions?.[0]?.count || 0} questions • Pass {quiz.pass_percent}%
                    {quiz.time_limit_minutes ? ` • ${quiz.time_limit_minutes} min` : ""} •
                    {" "}{quiz.quiz_attempts?.[0]?.count || 0} attempts
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTogglePublish(quiz.id, !quiz.is_published)}
                  >
                    {quiz.is_published ? "Unpublish" : "Publish"}
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/trainer/courses/${courseId}/quizzes/${quiz.id}`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(quiz.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No quizzes yet</p>
            <AddQuizDialog
              courseId={courseId}
              lessons={lessons}
              onCreated={(quiz) => {
                const lessonTitle = lessons.find((lesson) => lesson.id === quiz.lesson_id)?.title || null
                setQuizzes((prev) => [
                  {
                    ...quiz,
                    lessons: lessonTitle ? { title: lessonTitle } : null,
                    quiz_questions: [{ count: 0 }],
                    quiz_attempts: [{ count: 0 }],
                  },
                  ...prev,
                ])
                router.refresh()
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
