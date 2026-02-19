import { EnrollButton } from "@/components/courses/enroll-button"
import { ShareCourseButton } from "@/components/courses/share-course-button"
import { PublicNav } from "@/components/public-nav"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { BookOpen, Clock, Lock, PlayCircle, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function CoursePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { id } = await params
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get course details
  const { data: course, error } = await supabase
    .from("courses")
    .select(`
      *,
      profiles!courses_trainer_id_fkey(full_name, bio, avatar_url),
      lessons(*)
    `)
    .eq("id", id)
    .eq("is_published", true)
    .single()

  if (error || !course) {
    notFound()
  }

  // Check if user is enrolled
  let isEnrolled = false
  let isTrainer = false

  if (user) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("learner_id", user.id)
      .eq("course_id", id)
      .single()

    isEnrolled = !!enrollment
    isTrainer = course.trainer_id === user.id
  }

  // Get enrollment count
  const { count: enrollmentCount } = await supabase
    .from("enrollments")
    .select("*", { count: "exact", head: true })
    .eq("course_id", id)

  // Sort lessons by order
  const lessons = course.lessons?.sort((a, b) => a.order_index - b.order_index) || []
  const totalDuration = lessons.reduce((sum, lesson) => sum + (lesson.duration_minutes || 0), 0)

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Header */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">{course.level || "All Levels"}</Badge>
                {course.category && <Badge variant="outline">{course.category}</Badge>}
              </div>

              <h1 className="text-4xl font-bold text-foreground mb-4">{course.title}</h1>

              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                {course.description || "No description available"}
              </p>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{totalDuration} minutes total</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{enrollmentCount || 0} students enrolled</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{lessons.length} lessons</span>
                </div>
              </div>
            </div>

            {/* Course Content */}
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
                <CardDescription>
                  {lessons.length} lessons • {totalDuration} minutes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {lessons.length > 0 ? (
                  <div className="space-y-2">
                    {lessons.map((lesson, index) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            {lesson.is_free || isEnrolled || isTrainer ? (
                              <PlayCircle className="h-5 w-5 text-primary" />
                            ) : (
                              <Lock className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-foreground">
                                {index + 1}. {lesson.title}
                              </h4>
                              {lesson.is_free && (
                                <Badge variant="secondary" className="text-xs">
                                  Free
                                </Badge>
                              )}
                            </div>
                            {lesson.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{lesson.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {lesson.duration_minutes && (
                            <span className="text-sm text-muted-foreground">{lesson.duration_minutes} min</span>
                          )}

                          {(lesson.is_free || isEnrolled || isTrainer) && lesson.video_url && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={lesson.video_url} target="_blank" rel="noopener noreferrer">
                                Watch
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No lessons available yet</p>
                )}
              </CardContent>
            </Card>

            {/* Trainer Info */}
            <Card>
              <CardHeader>
                <CardTitle>About the Trainer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-semibold text-primary">
                      {course.profiles?.full_name?.[0] || "T"}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg mb-1">
                      {course.profiles?.full_name || "Anonymous Trainer"}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {course.profiles?.bio || "No bio available"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <div className="aspect-video rounded-t-lg overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                {course.thumbnail_url ? (
                  <Image
                    src={course.thumbnail_url}
                    alt={course.title}
                    width={800}
                    height={450}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <BookOpen className="h-20 w-20 text-primary/40" />
                )}
              </div>

              <CardContent className="p-6">
                <div className="mb-6">
                  {course.price === 0 ? (
                    <div className="text-3xl font-bold text-secondary">Free</div>
                  ) : (
                    <div className="text-3xl font-bold text-foreground">{course.price.toLocaleString()} XAF</div>
                  )}
                </div>

                {isTrainer ? (
                  <Button className="w-full" asChild>
                    <Link href={`/trainer/courses/${course.id}`}>Edit Course</Link>
                  </Button>
                ) : isEnrolled ? (
                  <Button className="w-full" asChild>
                    <Link href="/learner/dashboard">Go to My Courses</Link>
                  </Button>
                ) : user ? (
                  <EnrollButton
                    courseId={course.id}
                    userId={user.id}
                    coursePrice={course.price}
                    trainerId={course.trainer_id}
                  />
                ) : (
                  <Button className="w-full" asChild>
                    <Link href={`/auth/login?redirect=/courses/${course.id}`}>Sign In to Enroll</Link>
                  </Button>
                )}

                <div className="mt-3">
                  <ShareCourseButton title={course.title} courseId={course.id} className="w-full" />
                </div>

                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Level</span>
                    <span className="font-medium text-foreground">{course.level || "All Levels"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Lessons</span>
                    <span className="font-medium text-foreground">{lessons.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium text-foreground">{totalDuration} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Students</span>
                    <span className="font-medium text-foreground">{enrollmentCount || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
