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

  const courseIds = courses?.map((course) => course.id) || []

  const { data: enrollments } = courseIds.length
    ? await supabase
        .from("enrollments")
        .select("learner_id, course_id")
        .in("course_id", courseIds)
    : { data: [] }

  const uniqueLearners = new Set(enrollments?.map((enrollment) => enrollment.learner_id))

  const totalCourses = courses?.length || 0
  const publishedCourses = courses?.filter((c) => c.is_published).length || 0
  const totalStudents = uniqueLearners.size || 0

  const { data: transactions } = await supabase
    .from("payment_transactions")
    .select("amount")
    .eq("trainer_id", user.id)
    .eq("status", "SUCCESS")

  const totalRevenue = transactions?.reduce((sum, tx) => sum + Number(tx.amount || 0), 0) || 0
  const accountBalance = Math.floor(totalRevenue * 0.7)

  const now = new Date()
  const startOfCurrentMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0))
  const startOfNextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0))
  const startOfPreviousMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1, 0, 0, 0))

  const { data: currentMonthEnrollments } = courseIds.length
    ? await supabase
        .from("enrollments")
        .select("id")
        .in("course_id", courseIds)
        .gte("enrolled_at", startOfCurrentMonth.toISOString())
        .lt("enrolled_at", startOfNextMonth.toISOString())
    : { data: [] }

  const { data: previousMonthEnrollments } = courseIds.length
    ? await supabase
        .from("enrollments")
        .select("id")
        .in("course_id", courseIds)
        .gte("enrolled_at", startOfPreviousMonth.toISOString())
        .lt("enrolled_at", startOfCurrentMonth.toISOString())
    : { data: [] }

  const currentCount = currentMonthEnrollments?.length || 0
  const previousCount = previousMonthEnrollments?.length || 0
  const growthPercent =
    previousCount === 0 ? (currentCount === 0 ? 0 : 100) : Math.round(((currentCount - previousCount) / previousCount) * 100)

  return (
    <div className="min-h-screen bg-background">
      <TrainerNav />
      <TrainerDashboardClient
        courses={courses}
        totalCourses={totalCourses}
        publishedCourses={publishedCourses}
        totalStudents={totalStudents}
        totalRevenue={totalRevenue}
        accountBalance={accountBalance}
        growthPercent={growthPercent}
      />
    </div>
  )
}
