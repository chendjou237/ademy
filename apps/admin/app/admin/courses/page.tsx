import { AdminNav } from "@/components/admin/admin-nav"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function AdminCoursesPage() {
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

  // Get all courses
  const { data: courses } = await supabase
    .from("courses")
    .select(`
      *,
      profiles!courses_trainer_id_fkey(full_name),
      lessons(count),
      enrollments(count)
    `)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Course Management</h1>
          <p className="text-muted-foreground">Review and moderate all courses</p>
        </div>

        {/* Courses List */}
        <Card>
          <CardHeader>
            <CardTitle>All Courses</CardTitle>
            <CardDescription>{courses?.length || 0} total courses</CardDescription>
          </CardHeader>
          <CardContent>
            {courses && courses.length > 0 ? (
              <div className="space-y-4">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-start gap-4 border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">{course.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {course.description || "No description"}
                          </p>
                        </div>
                        <Badge variant={course.is_published ? "default" : "secondary"}>
                          {course.is_published ? "Published" : "Draft"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                        <span>By {course.profiles?.full_name || "Anonymous"}</span>
                        <span>•</span>
                        <span>{course.lessons?.[0]?.count || 0} lessons</span>
                        <span>•</span>
                        <span>{course.enrollments?.[0]?.count || 0} students</span>
                        <span>•</span>
                        <span>{course.price.toLocaleString()} XAF</span>
                      </div>
                    </div>

                    <Link href={`/courses/${course.id}`}>
                      <Button variant="outline" size="sm">
                        View Course
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No courses found</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
