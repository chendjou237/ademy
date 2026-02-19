import { createClient } from "@/lib/supabase/server"
import { BookOpen } from "lucide-react"
import Link from "next/link"
import { PublicNavClient } from "./public-nav-client"

export async function PublicNav() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    profile = data
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <nav className="relative flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Ademy</span>
          </Link>

          <PublicNavClient hasUser={!!user} />
        </nav>
      </div>
    </header>
  )
}
