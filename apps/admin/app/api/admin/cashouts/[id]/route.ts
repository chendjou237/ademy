import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const allowedStatuses = new Set(["APPROVED", "PAID", "REJECTED", "CANCELLED"])

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const status = typeof body?.status === "string" ? body.status : null

  if (!status || !allowedStatuses.has(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const params = await context.params

  const { data: updated, error } = await supabase
    .from("cashout_requests")
    .update({
      status,
      processed_at: new Date().toISOString(),
      processed_by: user.id,
    })
    .eq("id", params.id)
    .select("*")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: updated })
}
