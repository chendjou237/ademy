import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile to determine role
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  // Redirect based on role
  if (profile?.role === "trainer") {
    redirect("/trainer/dashboard")
  } else if (profile?.role === "learner") {
    redirect("/learner/dashboard")
  } else if (profile?.role === "admin") {
    redirect("/admin/dashboard")
  }

  // Default fallback
  redirect("/learner/dashboard")
}
