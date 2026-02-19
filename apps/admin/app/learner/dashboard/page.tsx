import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LearnerNav } from "@/components/learner/learner-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { BookOpen, Clock, Award, TrendingUp } from "lucide-react"

export default async function LearnerDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get learner's enrollments with course details
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      id,
      learner_id,
      course_id,
      progress,
      enrolled_at,
      courses(
        *,
        lessons(count),
        profiles!courses_trainer_id_fkey(full_name)
      )
    `)
    .eq("learner_id", user.id)
    .order("enrolled_at", { ascending: false })

  const enrollmentIds = enrollments?.map((enrollment) => enrollment.id) || []
  const { data: progressRows } = enrollmentIds.length
    ? await supabase
        .from("lesson_progress")
        .select("enrollment_id, completed, completed_at")
        .in("enrollment_id", enrollmentIds)
    : { data: [] }

  const completedByEnrollment = new Map<string, number>()
  for (const row of progressRows || []) {
    if (!row.completed) continue
    completedByEnrollment.set(row.enrollment_id, (completedByEnrollment.get(row.enrollment_id) || 0) + 1)
  }

  const completionDays = new Set<string>()
  for (const row of progressRows || []) {
    if (!row.completed || !row.completed_at) continue
    const day = new Date(row.completed_at)
    const key = `${day.getUTCFullYear()}-${day.getUTCMonth() + 1}-${day.getUTCDate()}`
    completionDays.add(key)
  }

  let learningStreak = 0
  if (completionDays.size > 0) {
    let cursor = new Date()
    for (;;) {
      const key = `${cursor.getUTCFullYear()}-${cursor.getUTCMonth() + 1}-${cursor.getUTCDate()}`
      if (!completionDays.has(key)) break
      learningStreak += 1
      cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), cursor.getUTCDate() - 1))
    }
  }

  const enrollmentsWithProgress = (enrollments || []).map((enrollment) => {
    const lessonCount = enrollment.courses?.lessons?.[0]?.count || 0
    const completedCount = completedByEnrollment.get(enrollment.id) || 0
    const computedProgress = lessonCount > 0 ? Math.round((completedCount / lessonCount) * 100) : 0
    const storedProgress = typeof enrollment.progress === "number" ? enrollment.progress : 0
    const progress = storedProgress > 0 ? storedProgress : computedProgress

    return {
      ...enrollment,
      progress,
    }
  })

  const totalCourses = enrollmentsWithProgress.length || 0
  const completedCourses = enrollmentsWithProgress.filter((e) => e.progress === 100).length || 0
  const inProgressCourses = enrollmentsWithProgress.filter((e) => e.progress > 0 && e.progress < 100).length || 0

  return (
    <div className="min-h-screen bg-background">
      <LearnerNav />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">My Learning</h1>
          <p className="text-muted-foreground">Track your progress and continue learning</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Enrolled Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">{totalCourses}</div>
              <p className="text-xs text-muted-foreground mt-1">Total enrollments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">{inProgressCourses}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently learning</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">{completedCourses}</div>
              <p className="text-xs text-muted-foreground mt-1">Courses finished</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Learning Streak</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">{learningStreak}</div>
              <p className="text-xs text-muted-foreground mt-1">Days in a row</p>
            </CardContent>
          </Card>
        </div>

        {/* Enrolled Courses */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>My Courses</CardTitle>
                <CardDescription>Continue where you left off</CardDescription>
              </div>
              <Link href="/courses">
                <Button variant="outline" className="w-full sm:w-auto">
                  Browse More Courses
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {enrollmentsWithProgress && enrollmentsWithProgress.length > 0 ? (
              <div className="space-y-4">
                {enrollmentsWithProgress.map((enrollment) => {
                  const course = enrollment.courses
                  if (!course) return null

                  return (
                    <Link key={enrollment.id} href={`/learner/courses/${course.id}`}>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="aspect-video w-full sm:w-48 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen className="h-12 w-12 text-primary/40" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground mb-1 line-clamp-1">{course.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {course.description || "No description"}
                          </p>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-3">
                            <span>{course.profiles?.full_name || "Anonymous"}</span>
                            <span>•</span>
                            <span>{course.lessons?.[0]?.count || 0} lessons</span>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium text-foreground">{enrollment.progress}%</span>
                            </div>
                            <Progress value={enrollment.progress} className="h-2" />
                          </div>
                        </div>

                        <Button variant="outline" className="w-full sm:w-auto">
                          {enrollment.progress === 0 ? "Start Course" : "Continue"}
                        </Button>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No courses yet</h3>
                <p className="text-muted-foreground mb-4">Start learning by enrolling in a course</p>
                <Link href="/courses">
                  <Button>Browse Courses</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
