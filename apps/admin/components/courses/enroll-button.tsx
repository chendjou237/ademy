"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface EnrollButtonProps {
  courseId: string
  userId: string
}

export function EnrollButton({ courseId, userId }: EnrollButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleEnroll = async () => {
    setError("")
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from("enrollments").insert({
        learner_id: userId,
        course_id: courseId,
      })

      if (error) throw error

      router.push("/learner/dashboard")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Failed to enroll in course")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button className="w-full" onClick={handleEnroll} disabled={loading}>
        {loading ? "Enrolling..." : "Enroll Now"}
      </Button>
    </div>
  )
}
