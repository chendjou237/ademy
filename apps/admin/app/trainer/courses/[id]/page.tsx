import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TrainerNav } from "@/components/trainer/trainer-nav"
import { EditCourseForm } from "@/components/trainer/edit-course-form"
import { LessonsList } from "@/components/trainer/lessons-list"
import { QuizzesList } from "@/components/trainer/quizzes-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShareCourseButton } from "@/components/courses/share-course-button"

export default async function EditCoursePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { id } = await params

  // Get course details
  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .eq("trainer_id", user.id)
    .single()

  if (error || !course) {
    notFound()
  }

  // Get lessons
  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", id)
    .order("order_index", { ascending: true })

  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("*, lessons(title), quiz_questions(count), quiz_attempts(count)")
    .eq("course_id", id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <TrainerNav />

      <main className="container mx-auto px-4 py-8 pb-20 max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{course.title}</h1>
            <p className="text-muted-foreground">Edit your course details and manage lessons</p>
          </div>
          <ShareCourseButton title={course.title} courseId={course.id} className="w-full sm:w-auto" />
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-xl">
            <TabsTrigger value="details">Course Details</TabsTrigger>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
            <EditCourseForm course={course} />
          </TabsContent>

          <TabsContent value="lessons" className="mt-6">
            <LessonsList courseId={id} lessons={lessons || []} />
          </TabsContent>

          <TabsContent value="quizzes" className="mt-6">
            <QuizzesList
              courseId={id}
              lessons={(lessons || []).map((lesson) => ({ id: lesson.id, title: lesson.title }))}
              quizzes={quizzes || []}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
