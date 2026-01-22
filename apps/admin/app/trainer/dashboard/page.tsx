import { TrainerDashboardClient } from "@/components/trainer/trainer-dashboard-client"
import { TrainerNav } from "@/components/trainer/trainer-nav"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function TrainerDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get trainer's courses
  const { data: courses } = await supabase
    .from("courses")
    .select("*, lessons(count)")
    .eq("trainer_id", user.id)
    .order("created_at", { ascending: false })

  // Get enrollment stats
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id, courses!inner(trainer_id)")
    .eq("courses.trainer_id", user.id)

  const totalCourses = courses?.length || 0
  const publishedCourses = courses?.filter((c) => c.is_published).length || 0
  const totalStudents = enrollments?.length || 0

  return (
    <div className="min-h-screen bg-background">
      <TrainerNav />
      <TrainerDashboardClient
        courses={courses}
        totalCourses={totalCourses}
        publishedCourses={publishedCourses}
        totalStudents={totalStudents}
      />
    </div>
  )
}
