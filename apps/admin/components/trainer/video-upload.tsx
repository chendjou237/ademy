"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import type { VideoUploadProgress } from "@/lib/bunny/types"
import { AlertCircle, CheckCircle, Upload } from "lucide-react"
import { useRef, useState } from "react"
import * as tus from "tus-js-client"

interface VideoUploadProps {
  onUploadComplete: (videoId: string, libraryId: string) => void
  lessonTitle: string
}

export function VideoUpload({ onUploadComplete, lessonTitle }: VideoUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<VideoUploadProgress>({ loaded: 0, total: 0, percentage: 0 })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadRef = useRef<tus.Upload | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith("video/")) {
        setError("Please select a valid video file")
        return
      }

      // Validate file size (max 5GB)
      const maxSize = 5 * 1024 * 1024 * 1024 // 5GB
      if (selectedFile.size > maxSize) {
        setError("File size must be less than 5GB")
        return
      }

      setFile(selectedFile)
      setError("")
      setSuccess(false)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first")
      return
    }

    setUploading(true)
    setError("")
    setProgress({ loaded: 0, total: file.size, percentage: 0 })

    try {
      // Get upload credentials
      const uploadUrlResponse = await fetch("/api/videos/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!uploadUrlResponse.ok) {
        throw new Error("Failed to get upload credentials")
      }

      const { uploadUrl, apiKey, libraryId } = await uploadUrlResponse.json()

      // Upload file using TUS protocol - this will create the video automatically
      const upload = new tus.Upload(file, {
        endpoint: uploadUrl,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        metadata: {
          filetype: file.type,
          title: lessonTitle || file.name,
        },
        headers: {
          AccessKey: apiKey,
          LibraryId: libraryId,
        },
        onAfterResponse: (req, res) => {
          // Log all response headers to find video ID
          console.log("TUS Response status:", res.getStatus())
          console.log("TUS Response Location:", res.getHeader("Location"))
          console.log("TUS Response VideoId:", res.getHeader("VideoId"))
          console.log("TUS Response video-id:", res.getHeader("video-id"))
          console.log("TUS Response X-Video-Id:", res.getHeader("X-Video-Id"))

          // Try to extract video ID from Location header
          const location = res.getHeader("Location")
          if (location) {
            console.log("Full Location header:", location)
          }
        },
        onError: (error) => {
          console.error("[v0] Upload error:", error)
          setError(`Upload failed: ${error.message}`)
          setUploading(false)
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = Math.round((bytesUploaded / bytesTotal) * 100)
          setProgress({
            loaded: bytesUploaded,
            total: bytesTotal,
            percentage,
          })
        },
        onSuccess: async () => {
          console.log("Upload complete! Fetching actual video ID from Bunny...")

          // Query Bunny API to find the actual video ID
          try {
            const findResponse = await fetch("/api/videos/find-recent", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title: lessonTitle || file.name }),
            })

            if (findResponse.ok) {
              const videoData = await findResponse.json()
              console.log("✓ Found video in Bunny:", videoData)

              setSuccess(true)
              setUploading(false)
              onUploadComplete(videoData.videoId, videoData.libraryId)
            } else {
              throw new Error("Failed to find video in Bunny library")
            }
          } catch (err: any) {
            console.error("Error finding video:", err)
            setError("Upload completed but failed to retrieve video ID. Please check Bunny dashboard.")
            setUploading(false)
          }
        },
      })

      uploadRef.current = upload
      upload.start()
    } catch (err: any) {
      setError(err.message || "Upload failed")
      setUploading(false)
    }
  }

  const handleCancel = () => {
    if (uploadRef.current) {
      uploadRef.current.abort()
      uploadRef.current = null
    }
    setUploading(false)
    setProgress({ loaded: 0, total: 0, percentage: 0 })
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-secondary bg-secondary/10">
          <CheckCircle className="h-4 w-4 text-secondary" />
          <AlertDescription className="text-secondary-foreground">
            Video uploaded successfully! Processing may take a few minutes.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="video-file">Video File</Label>
        <Input
          ref={fileInputRef}
          id="video-file"
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          disabled={uploading}
        />
        {file && (
          <p className="text-sm text-muted-foreground">
            Selected: {file.name} ({formatBytes(file.size)})
          </p>
        )}
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Uploading...</span>
            <span className="font-medium text-foreground">{progress.percentage}%</span>
          </div>
          <Progress value={progress.percentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {formatBytes(progress.loaded)} / {formatBytes(progress.total)}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        {!uploading ? (
          <Button type="button" onClick={handleUpload} disabled={!file || success}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Video
          </Button>
        ) : (
          <Button type="button" onClick={handleCancel} variant="destructive">
            Cancel Upload
          </Button>
        )}
      </div>

      {success && (
        <p className="text-sm text-muted-foreground">
          Your video is being processed by Bunny Stream. It will be available for playback shortly.
        </p>
      )}
    </div>
  )
}
