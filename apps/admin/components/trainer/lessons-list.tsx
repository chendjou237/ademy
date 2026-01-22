"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, GripVertical, Pencil, Trash2 } from "lucide-react"
import { AddLessonDialog } from "./add-lesson-dialog"
import { createClient } from "@/lib/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface Lesson {
  id: string
  title: string
  description: string | null
  video_url: string | null
  duration_minutes: number | null
  order_index: number
  is_free: boolean
}

interface LessonsListProps {
  courseId: string
  lessons: Lesson[]
}

export function LessonsList({ courseId, lessons: initialLessons }: LessonsListProps) {
  const router = useRouter()
  const [lessons, setLessons] = useState(initialLessons)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [error, setError] = useState("")

  const handleDelete = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return

    setError("")
    try {
      const supabase = createClient()
      const { error } = await supabase.from("lessons").delete().eq("id", lessonId)

      if (error) throw error

      setLessons(lessons.filter((l) => l.id !== lessonId))
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Failed to delete lesson")
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Course Lessons</CardTitle>
            <CardDescription>Manage your course content</CardDescription>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Lesson
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {lessons.length > 0 ? (
          <div className="space-y-3">
            {lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className="flex items-center gap-3 border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">
                      {index + 1}. {lesson.title}
                    </h4>
                    {lesson.is_free && (
                      <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded">Free Preview</span>
                    )}
                  </div>
                  {lesson.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{lesson.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {lesson.duration_minutes && <span>{lesson.duration_minutes} min</span>}
                    {lesson.video_url && (
                      <>
                        <span>•</span>
                        <span>Video added</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(lesson.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No lessons yet</p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Lesson
            </Button>
          </div>
        )}
      </CardContent>

      <AddLessonDialog
        courseId={courseId}
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        nextOrderIndex={lessons.length}
        onSuccess={() => {
          router.refresh()
          setShowAddDialog(false)
        }}
      />
    </Card>
  )
}
