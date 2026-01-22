"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useTranslation } from "@/lib/i18n/context"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle, Clock, PlayCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { BunnyVideoPlayer } from "./bunny-video-player"

interface Lesson {
  id: string
  title: string
  description: string | null
  video_url: string | null
  duration_minutes: number | null
  order_index: number
}

interface LessonPlayerProps {
  lesson: Lesson
  enrollmentId: string
  isCompleted: boolean
  progressId?: string
}

export function LessonPlayer({ lesson, enrollmentId, isCompleted, progressId }: LessonPlayerProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const [completed, setCompleted] = useState(isCompleted)
  const [loading, setLoading] = useState(false)

  const handleToggleComplete = async (checked: boolean) => {
    setLoading(true)
    try {
      const supabase = createClient()

      if (checked && !progressId) {
        // Create new progress record
        await supabase.from("lesson_progress").insert({
          enrollment_id: enrollmentId,
          lesson_id: lesson.id,
          completed: true,
          completed_at: new Date().toISOString(),
        })
      } else if (progressId) {
        // Update existing progress record
        await supabase
          .from("lesson_progress")
          .update({
            completed: checked,
            completed_at: checked ? new Date().toISOString() : null,
          })
          .eq("id", progressId)
      }

      setCompleted(checked)
      router.refresh()
    } catch (error) {
      console.error("[v0] Error updating lesson progress:", error)
    } finally {
      setLoading(false)
    }
  }

  // Parse Bunny video URL
  const parseBunnyUrl = (url: string | null): { libraryId: string; videoId: string } | null => {
    if (!url) return null

    // Format: bunny://LIBRARY_ID/VIDEO_ID
    const bunnyMatch = url.match(/^bunny:\/\/([^/]+)\/(.+)$/)
    if (bunnyMatch) {
      return { libraryId: bunnyMatch[1], videoId: bunnyMatch[2] }
    }

    return null
  }

  const bunnyVideo = parseBunnyUrl(lesson.video_url)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle>{lesson.title}</CardTitle>
              {completed && (
                <Badge className="bg-secondary text-secondary-foreground">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {t("lesson.completed")}
                </Badge>
              )}
            </div>
            {lesson.description && <CardDescription>{lesson.description}</CardDescription>}
            {lesson.duration_minutes && (
              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{lesson.duration_minutes} {t("lesson.minutes")}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {bunnyVideo ? (
          <div className="space-y-4">
            <BunnyVideoPlayer
              libraryId={bunnyVideo.libraryId}
              videoId={bunnyVideo.videoId}
              title={lesson.title}
              lessonId={lesson.id}
            />

            <div className="flex items-center gap-2 p-4 border border-border rounded-lg">
              <Checkbox
                id={`complete-${lesson.id}`}
                checked={completed}
                onCheckedChange={handleToggleComplete}
                disabled={loading}
              />
              <label htmlFor={`complete-${lesson.id}`} className="text-sm font-medium text-foreground cursor-pointer">
                {t("lesson.markComplete")}
              </label>
            </div>
          </div>
        ) : lesson.video_url ? (
          <div className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <PlayCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-4">{t("lesson.externalVideo")}</p>
                <Button asChild>
                  <a href={lesson.video_url} target="_blank" rel="noopener noreferrer">
                    {t("lesson.watchExternal")}
                  </a>
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 p-4 border border-border rounded-lg">
              <Checkbox
                id={`complete-${lesson.id}`}
                checked={completed}
                onCheckedChange={handleToggleComplete}
                disabled={loading}
              />
              <label htmlFor={`complete-${lesson.id}`} className="text-sm font-medium text-foreground cursor-pointer">
                {t("lesson.markComplete")}
              </label>
            </div>
          </div>
        ) : (
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <PlayCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t("lesson.noVideo")}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
