import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TrainerNav } from "@/components/trainer/trainer-nav"
import { CreateCourseForm } from "@/components/trainer/create-course-form"

export default async function NewCoursePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <TrainerNav />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create New Course</h1>
          <p className="text-muted-foreground">Fill in the details to create your course</p>
        </div>

        <CreateCourseForm userId={user.id} />
      </main>
    </div>
  )
}
