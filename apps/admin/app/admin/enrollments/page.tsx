import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminNav } from "@/components/admin/admin-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default async function AdminEnrollmentsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  // Get all enrollments
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      *,
      profiles!enrollments_learner_id_fkey(full_name, email),
      courses(title, profiles!courses_trainer_id_fkey(full_name))
    `)
    .order("enrolled_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Enrollment Management</h1>
          <p className="text-muted-foreground">Track all course enrollments and progress</p>
        </div>

        {/* Enrollments List */}
        <Card>
          <CardHeader>
            <CardTitle>All Enrollments</CardTitle>
            <CardDescription>{enrollments?.length || 0} total enrollments</CardDescription>
          </CardHeader>
          <CardContent>
            {enrollments && enrollments.length > 0 ? (
              <div className="space-y-4">
                {enrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">
                          {enrollment.courses?.title || "Unknown Course"}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Student: {enrollment.profiles?.full_name || "Unknown"}</span>
                          <span>•</span>
                          <span>Trainer: {enrollment.courses?.profiles?.full_name || "Unknown"}</span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium text-foreground">{enrollment.progress}%</span>
                      </div>
                      <Progress value={enrollment.progress} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No enrollments found</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
