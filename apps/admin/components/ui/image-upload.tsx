"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { ImagePlus, Loader2, X } from "lucide-react"
import Image from "next/image"
import { useRef, useState } from "react"

interface ImageUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
  disabled?: boolean
  bucket?: string
  folder?: string
  label?: string
  description?: string
}

export function ImageUpload({
  value,
  onChange,
  disabled = false,
  bucket = "ademy",
  folder = "thumbnails",
  label = "Thumbnail",
  description = "Upload a course thumbnail (recommended: 800x450px, max 2MB)",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be less than 2MB")
      return
    }

    setError(null)
    setUploading(true)

    try {
      const supabase = createClient()

      // Generate unique filename
      const fileExt = file.name.split(".").pop()
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(data.path)

      onChange(publicUrl)
    } catch (err: any) {
      console.error("Upload error:", err)
      setError(err.message || "Failed to upload image")
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemove = async () => {
    if (!value) return

    try {
      // Extract path from URL if it's a Supabase URL
      if (value.includes("supabase")) {
        const supabase = createClient()
        const path = value.split(`${bucket}/`)[1]
        if (path) {
          await supabase.storage.from(bucket).remove([path])
        }
      }
      onChange(null)
    } catch (err) {
      console.error("Error removing image:", err)
      // Still clear the value even if deletion fails
      onChange(null)
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}

      <div className="space-y-4">
        {value ? (
          <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border border-border bg-muted">
            <Image src={value} alt="Thumbnail preview" fill className="object-cover" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleRemove}
              disabled={disabled || uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className="flex aspect-video w-full max-w-md cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 hover:bg-muted/80 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="h-10 w-10 text-muted-foreground animate-spin mb-2" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <ImagePlus className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload image</p>
              </>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="hidden"
        />

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  )
}
