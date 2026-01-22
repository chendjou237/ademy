"use client"

import type React from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { AlertCircle, CheckCircle } from "lucide-react"
import { useState } from "react"
import { VideoUpload } from "./video-upload"

interface AddLessonDialogProps {
  courseId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  nextOrderIndex: number
  onSuccess: () => void
}

export function AddLessonDialog({ courseId, open, onOpenChange, nextOrderIndex, onSuccess }: AddLessonDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [bunnyVideoId, setBunnyVideoId] = useState("")
  const [bunnyLibraryId, setBunnyLibraryId] = useState("")
  const [duration, setDuration] = useState("")
  const [isFree, setIsFree] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [uploadMethod, setUploadMethod] = useState<"upload" | "url">("upload")

  const handleVideoUploadComplete = (videoId: string, libraryId: string) => {
    console.log("Video upload complete:", videoId, libraryId)
    setBunnyVideoId(videoId)
    setBunnyLibraryId(libraryId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const supabase = createClient()

      // Determine video URL based on upload method
      let finalVideoUrl = null
      if (uploadMethod === "upload" && bunnyVideoId && bunnyLibraryId) {
        finalVideoUrl = `bunny://${bunnyLibraryId}/${bunnyVideoId}`
      } else if (uploadMethod === "url" && videoUrl) {
        finalVideoUrl = videoUrl
      }

      const { error } = await supabase.from("lessons").insert({
        course_id: courseId,
        title,
        description: description || null,
        video_url: finalVideoUrl,
        bunny_video_id: uploadMethod === "upload" ? bunnyVideoId : null,
        bunny_library_id: uploadMethod === "upload" ? bunnyLibraryId : null,
        video_status: uploadMethod === "upload" ? "processing" : null,
        duration_minutes: duration ? Number.parseInt(duration) : null,
        order_index: nextOrderIndex,
        is_free: isFree,
      })

      if (error) throw error

      // Reset form
      setTitle("")
      setDescription("")
      setVideoUrl("")
      setBunnyVideoId("")
      setBunnyLibraryId("")
      setDuration("")
      setIsFree(false)

      onSuccess()
    } catch (err: any) {
      setError(err.message || "Failed to add lesson")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Lesson</DialogTitle>
          <DialogDescription>Create a new lesson for your course</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="lesson-title">Lesson Title *</Label>
            <Input
              id="lesson-title"
              placeholder="e.g., Introduction to Variables"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lesson-description">Description</Label>
            <Textarea
              id="lesson-description"
              placeholder="What will students learn in this lesson?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label>Video</Label>
            <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as "upload" | "url")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload Video</TabsTrigger>
                <TabsTrigger value="url">External URL</TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-4">
                <VideoUpload onUploadComplete={handleVideoUploadComplete} lessonTitle={title} />
                {bunnyVideoId && (
                  <Alert className="border-green-500 bg-green-50 mt-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Video uploaded successfully (ID: {bunnyVideoId})
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="url" className="mt-4">
                <Input
                  id="video-url"
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-2">YouTube, Vimeo, or direct video link</p>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              placeholder="e.g., 15"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="is-free">Free Preview</Label>
              <p className="text-sm text-muted-foreground">Allow non-enrolled students to watch this lesson</p>
            </div>
            <Switch id="is-free" checked={isFree} onCheckedChange={setIsFree} disabled={loading} />
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || (uploadMethod === "upload" && !bunnyVideoId)}
            >
              {loading ? "Adding..." : "Add Lesson"}
            </Button>
          </div>

          {uploadMethod === "upload" && !bunnyVideoId && (
            <p className="text-sm text-muted-foreground text-right">
              Please upload a video before adding the lesson
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
