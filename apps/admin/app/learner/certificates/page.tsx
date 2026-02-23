import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function LearnerCertificatesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      id,
      course_id,
      progress,
      courses(
        id,
        title,
        certificate_enabled,
        profiles!courses_trainer_id_fkey(full_name)
      )
    `)
    .eq("learner_id", user.id)

  const eligible = (enrollments || []).filter(
    (enrollment) => enrollment.progress === 100 && enrollment.courses?.certificate_enabled
  )

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Certificates</h1>
            <p className="text-sm text-muted-foreground">Download your course completion certificates.</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/learner/dashboard">Back to dashboard</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Certificates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {eligible.length > 0 ? (
              eligible.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex flex-col gap-2 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-foreground">{enrollment.courses?.title || "Untitled course"}</p>
                    <p className="text-sm text-muted-foreground">
                      {enrollment.courses?.profiles?.full_name || "Trainer"}
                    </p>
                  </div>
                  <Button asChild>
                    <Link href={`/learner/courses/${enrollment.course_id}/certificate`}>Download PDF</Link>
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No certificates available yet.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
