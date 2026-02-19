import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminNav } from "@/components/admin/admin-nav"
import { AdminCashoutsClient } from "@/components/admin/admin-cashouts-client"

export default async function AdminCashoutsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  const { data: cashouts } = await supabase
    .from("cashout_requests")
    .select(
      `id, amount, currency, status, provider, phone_number, note, created_at,
       trainer:profiles!cashout_requests_trainer_id_fkey(full_name, email)`
    )
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <AdminCashoutsClient cashouts={cashouts || []} />
    </div>
  )
}
