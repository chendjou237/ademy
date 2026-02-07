"use client"

import type React from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageUpload } from "@/components/ui/image-upload"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { AlertCircle, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface Course {
  id: string
  title: string
  description: string | null
  category: string | null
  level: string | null
  price: number
  thumbnail_url: string | null
  is_published: boolean
}

interface EditCourseFormProps {
  course: Course
}

export function EditCourseForm({ course }: EditCourseFormProps) {
  const router = useRouter()

  const [title, setTitle] = useState(course.title)
  const [description, setDescription] = useState(course.description || "")
  const [category, setCategory] = useState(course.category || "")
  const [level, setLevel] = useState(course.level || "beginner")
  const [price, setPrice] = useState(course.price.toString())
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(course.thumbnail_url)
  const [isPublished, setIsPublished] = useState(course.is_published)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("courses")
        .update({
          title,
          description,
          category,
          level,
          price: Number.parseFloat(price),
          thumbnail_url: thumbnailUrl,
          is_published: isPublished,
        })
        .eq("id", course.id)

      if (error) throw error

      setSuccess(true)
      router.refresh()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || "Failed to update course")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Information</CardTitle>
        <CardDescription>Update your course details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-secondary bg-secondary/10">
              <CheckCircle className="h-4 w-4 text-secondary" />
              <AlertDescription className="text-secondary-foreground">Course updated successfully!</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Course Title *</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={loading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              disabled={loading}
            />
          </div>

          <ImageUpload
            value={thumbnailUrl}
            onChange={setThumbnailUrl}
            disabled={loading}
            label="Course Thumbnail"
            description="Upload a course thumbnail (recommended: 800x450px, max 2MB)"
          />

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Level *</Label>
              <Select value={level} onValueChange={setLevel} disabled={loading}>
                <SelectTrigger id="level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (XAF) *</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="published">Publish Course</Label>
              <p className="text-sm text-muted-foreground">Make this course visible to students</p>
            </div>
            <Switch id="published" checked={isPublished} onCheckedChange={setIsPublished} disabled={loading} />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
