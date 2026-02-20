"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"

interface LessonOption {
  id: string
  title: string
}

interface AddQuizDialogProps {
  courseId: string
  lessons: LessonOption[]
  onCreated: (quiz: {
    id: string
    title: string
    lesson_id: string | null
    is_published: boolean
    pass_percent: number
    time_limit_minutes: number | null
  }) => void
}

export function AddQuizDialog({ courseId, lessons, onCreated }: AddQuizDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [instructions, setInstructions] = useState("")
  const [scope, setScope] = useState<"course" | "lesson">("course")
  const [lessonId, setLessonId] = useState<string | null>(null)
  const [passPercent, setPassPercent] = useState("70")
  const [timeLimit, setTimeLimit] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const getUserId = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user?.id || null
  }

  const resetForm = () => {
    setTitle("")
    setInstructions("")
    setScope("course")
    setLessonId(null)
    setPassPercent("70")
    setTimeLimit("")
    setError("")
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Title is required")
      return
    }

    const passValue = Number(passPercent)
    if (!Number.isFinite(passValue) || passValue < 0 || passValue > 100) {
      setError("Pass percent must be between 0 and 100")
      return
    }

    const timeValue = timeLimit.trim() ? Number(timeLimit) : null
    if (timeValue !== null && (!Number.isFinite(timeValue) || timeValue <= 0)) {
      setError("Time limit must be a positive number")
      return
    }

    if (scope === "lesson" && !lessonId) {
      setError("Please select a lesson")
      return
    }

    setLoading(true)
    setError("")

    try {
      const supabase = createClient()
      const userId = await getUserId()
      if (!userId) throw new Error("User not found")

      const { data, error } = await supabase
        .from("quizzes")
        .insert({
          course_id: courseId,
          lesson_id: scope === "lesson" ? lessonId : null,
          title: title.trim(),
          instructions: instructions.trim() || null,
          pass_percent: passValue,
          time_limit_minutes: timeValue,
          is_published: false,
          created_by: userId,
        })
        .select("id, title, lesson_id, is_published, pass_percent, time_limit_minutes")
        .single()

      if (error) throw error

      setOpen(false)
      resetForm()
      if (data) onCreated(data)
    } catch (err: any) {
      setError(err.message || "Failed to create quiz")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => {
      setOpen(next)
      if (!next) resetForm()
    }}>
      <DialogTrigger asChild>
        <Button>Create Quiz</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a Quiz</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="space-y-2">
            <Label htmlFor="quiz-title">Title</Label>
            <Input id="quiz-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quiz-instructions">Instructions</Label>
            <Textarea
              id="quiz-instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Optional instructions for learners"
            />
          </div>

          <div className="space-y-2">
            <Label>Scope</Label>
            <Select value={scope} onValueChange={(value) => setScope(value as "course" | "lesson")}> 
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="course">Course-level</SelectItem>
                <SelectItem value="lesson">Lesson-level</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {scope === "lesson" ? (
            <div className="space-y-2">
              <Label>Lesson</Label>
              <Select value={lessonId || ""} onValueChange={setLessonId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select lesson" />
                </SelectTrigger>
                <SelectContent>
                  {lessons.map((lesson) => (
                    <SelectItem key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quiz-pass">Pass %</Label>
              <Input
                id="quiz-pass"
                type="number"
                value={passPercent}
                min={0}
                max={100}
                onChange={(e) => setPassPercent(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quiz-time">Time limit (min)</Label>
              <Input
                id="quiz-time"
                type="number"
                value={timeLimit}
                min={1}
                onChange={(e) => setTimeLimit(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Creating..." : "Create Quiz"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
