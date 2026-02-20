"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { AddQuizQuestionDialog } from "./add-quiz-question-dialog"
import { GripVertical } from "lucide-react"

interface QuizQuestion {
  id: string
  type: string
  prompt: string
  points: number
  order_index: number
}

interface QuizEditorProps {
  quizId: string
  title: string
  questions: QuizQuestion[]
  stats: {
    totalAttempts: number
    averageScore: number
    passRate: number
  }
}

export function QuizEditor({ quizId, title, questions: initialQuestions, stats }: QuizEditorProps) {
  const router = useRouter()
  const [questions, setQuestions] = useState(initialQuestions)
  const [error, setError] = useState("")
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const handleDelete = async (questionId: string) => {
    if (!confirm("Delete this question?") ) return

    setError("")
    try {
      const supabase = createClient()
      const { error } = await supabase.from("quiz_questions").delete().eq("id", questionId)
      if (error) throw error

      setQuestions(questions.filter((q) => q.id !== questionId))
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Failed to delete question")
    }
  }

  const reorderQuestions = async (nextQuestions: QuizQuestion[]) => {
    setQuestions(nextQuestions)

    try {
      const supabase = createClient()
      const updates = nextQuestions.map((question, index) => ({
        id: question.id,
        order_index: index,
      }))
      const { error } = await supabase.from("quiz_questions").upsert(updates, { onConflict: "id" })
      if (error) throw error
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Failed to reorder questions")
    }
  }

  const handleDragStart = (questionId: string) => {
    setDraggingId(questionId)
  }

  const handleDrop = async (targetId: string) => {
    if (!draggingId || draggingId === targetId) return

    const current = questions.slice().sort((a, b) => a.order_index - b.order_index)
    const fromIndex = current.findIndex((q) => q.id === draggingId)
    const toIndex = current.findIndex((q) => q.id === targetId)
    if (fromIndex === -1 || toIndex === -1) return

    const next = current.slice()
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    await reorderQuestions(next)
    setDraggingId(null)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>Build and review quiz questions</CardDescription>
          </div>
          <AddQuizQuestionDialog
            quizId={quizId}
            nextOrderIndex={questions.length}
            onCreated={(question) => {
              setQuestions((prev) => [...prev, question])
              router.refresh()
            }}
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Attempts</p>
            <p className="text-lg font-semibold text-foreground">{stats.totalAttempts}</p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Average Score</p>
            <p className="text-lg font-semibold text-foreground">{stats.averageScore}%</p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Pass Rate</p>
            <p className="text-lg font-semibold text-foreground">{stats.passRate}%</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error ? <p className="text-sm text-destructive mb-4">{error}</p> : null}
        {questions.length > 0 ? (
          <div className="space-y-3">
            {questions
              .slice()
              .sort((a, b) => a.order_index - b.order_index)
              .map((question, index) => (
                <div
                  key={question.id}
                  draggable
                  onDragStart={() => handleDragStart(question.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => handleDrop(question.id)}
                  className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="outline">{question.type}</Badge>
                      <span className="text-xs text-muted-foreground">{question.points} pts</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{index + 1}. {question.prompt}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(question.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No questions yet</p>
            <AddQuizQuestionDialog
              quizId={quizId}
              nextOrderIndex={0}
              onCreated={(question) => {
                setQuestions([question])
                router.refresh()
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
