import { CoursesPageClient } from "@/components/courses/courses-page-client"
import { CoursesPageHeader } from "@/components/courses/courses-page-header"
import { PublicNav } from "@/components/public-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/server"
import { Search } from "lucide-react"

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string }
}) {
  const supabase = await createClient()
  const params = await searchParams

  let query = supabase
    .from("courses")
    .select(`
      *,
      profiles!courses_trainer_id_fkey(full_name, avatar_url),
      lessons(count),
      enrollments(count)
    `)
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  if (params.search) {
    query = query.ilike("title", `%${params.search}%`)
  }

  if (params.category) {
    query = query.eq("category", params.category)
  }

  const { data: courses } = await query

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <main className="container mx-auto px-4 py-8">
        <CoursesPageHeader />

        {/* Search Bar */}
        <div className="mb-8">
          <form action="/courses" method="get" className="flex gap-4">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input name="search" placeholder="Search courses..." defaultValue={params.search} className="pl-10" />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>

        {/* Courses Grid */}
        <CoursesPageClient courses={courses} />
      </main>
    </div>
  )
}
