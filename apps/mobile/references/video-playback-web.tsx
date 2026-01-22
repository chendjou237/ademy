"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { useTranslation } from "@/lib/i18n/context"
import { AlertCircle, Loader2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface BunnyVideoPlayerProps {
  libraryId: string
  videoId: string
  title?: string
  lessonId?: string
}

export function BunnyVideoPlayer({ libraryId, videoId, title, lessonId }: BunnyVideoPlayerProps) {
  const { t } = useTranslation()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [videoStatus, setVideoStatus] = useState<string | null>(null)

  const embedUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?autoplay=false&preload=true`

  // Check video status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/videos/status/${videoId}`)
        if (response.ok) {
          const data = await response.json()
          setVideoStatus(data.status)

          // If video is finished and we have a lessonId, update the lesson status
          if (data.status === "finished" && lessonId) {
            await fetch(`/api/lessons/${lessonId}/update-status`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "finished" }),
            })
          }
        } else if (response.status === 404) {
          const data = await response.json()
          setError(data.error || "Video not found in Bunny library")
          setLoading(false)
        }
      } catch (err) {
        console.error("Failed to check video status:", err)
      }
    }

    checkStatus()
  }, [videoId, lessonId])

  const handleLoad = () => {
    // Give a small delay to ensure iframe content is ready
    setTimeout(() => setLoading(false), 500)
  }

  const handleError = () => {
    setLoading(false)
    setError("Failed to load video. Please try again later.")
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    {videoStatus === "processing" || videoStatus === "encoding"
                      ? t("lesson.processing")
                      : t("lesson.loadingVideo")}
                  </p>
                </div>
              </div>
            )}

            <iframe
              ref={iframeRef}
              src={embedUrl}
              title={title || "Video player"}
              className="w-full h-full"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              onLoad={handleLoad}
              onError={handleError}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
