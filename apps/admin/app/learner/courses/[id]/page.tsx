import { LearnerNav } from "@/components/learner/learner-nav"
import { LessonPlayer } from "@/components/learner/lesson-player"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/server"
import { BookOpen, CheckCircle, Clock } from "lucide-react"
import { notFound, redirect } from "next/navigation"

export default async function LearnerCoursePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { id } = await params

  // Check enrollment
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq("learner_id", user.id)
    .eq("course_id", id)
    .single()

  if (!enrollment) {
    redirect(`/courses/${id}`)
  }

  // Get course details
  const { data: course, error } = await supabase
    .from("courses")
    .select(`
      *,
      profiles!courses_trainer_id_fkey(full_name),
      lessons(*)
    `)
    .eq("id", id)
    .single()

  if (error || !course) {
    notFound()
  }

  // Get lesson progress
  const { data: lessonProgress } = await supabase.from("lesson_progress").select("*").eq("enrollment_id", enrollment.id)

  const lessons = course.lessons?.sort((a: any, b: any) => a.order_index - b.order_index) || []
  const completedLessons = lessonProgress?.filter((lp) => lp.completed).length || 0
  const progressPercentage = lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0

  return (
    <div className="min-h-screen bg-background">
      <LearnerNav />

      <main className="container mx-auto px-4 py-8">
        {/* Course Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary">{course.level || "All Levels"}</Badge>
            {course.category && <Badge variant="outline">{course.category}</Badge>}
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">{course.title}</h1>
          <p className="text-muted-foreground mb-4">by {course.profiles?.full_name || "Anonymous Trainer"}</p>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Course Progress</span>
                <span className="text-sm font-medium text-foreground">
                  {completedLessons} of {lessons.length} lessons completed
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <p className="text-xs text-muted-foreground mt-2">{progressPercentage}% complete</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Lessons List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Lessons</CardTitle>
                <CardDescription>{lessons.length} total lessons</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lessons.map((lesson: any, index: number) => {
                    const isCompleted = lessonProgress?.some((lp) => lp.lesson_id === lesson.id && lp.completed)

                    return (
                      <a
                        key={lesson.id}
                        href={`#lesson-${lesson.id}`}
                        className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-secondary" />
                          ) : (
                            <span className="text-sm font-medium text-primary">{index + 1}</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-foreground line-clamp-2">{lesson.title}</h4>
                          {lesson.duration_minutes && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{lesson.duration_minutes} min</span>
                            </div>
                          )}
                        </div>
                      </a>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lesson Content */}
          <div className="lg:col-span-2 space-y-6">
            {lessons.map((lesson: any) => {
              const isCompleted = lessonProgress?.some((lp) => lp.lesson_id === lesson.id && lp.completed)
              const progressRecord = lessonProgress?.find((lp) => lp.lesson_id === lesson.id)

              return (
                <div key={lesson.id} id={`lesson-${lesson.id}`}>
                  <LessonPlayer
                    lesson={lesson}
                    enrollmentId={enrollment.id}
                    isCompleted={isCompleted || false}
                    progressId={progressRecord?.id}
                  />
                </div>
              )
            })}

            {lessons.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No lessons available</h3>
                  <p className="text-muted-foreground">The trainer hasn't added any lessons yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
