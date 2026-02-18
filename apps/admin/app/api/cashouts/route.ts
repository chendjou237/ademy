import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const amount = Number(body?.amount)
  const provider = typeof body?.provider === "string" ? body.provider : null
  const phoneNumber = typeof body?.phoneNumber === "string" ? body.phoneNumber : null
  const note = typeof body?.note === "string" ? body.note : null

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, phone_number, mobile_money_provider")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  }

  if (profile.role !== "trainer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { data: transactions, error: transactionsError } = await supabase
    .from("payment_transactions")
    .select("amount")
    .eq("trainer_id", user.id)
    .eq("status", "SUCCESS")

  if (transactionsError) {
    return NextResponse.json({ error: "Unable to load revenue" }, { status: 500 })
  }

  const totalRevenue = transactions?.reduce((sum, tx) => sum + Number(tx.amount || 0), 0) || 0
  const trainerEarnings = Math.floor(totalRevenue * 0.7)

  const { data: cashouts, error: cashoutsError } = await supabase
    .from("cashout_requests")
    .select("amount, status")
    .eq("trainer_id", user.id)
    .in("status", ["PENDING", "APPROVED", "PAID"])

  if (cashoutsError) {
    return NextResponse.json({ error: "Unable to load cashouts" }, { status: 500 })
  }

  const reserved = cashouts?.reduce((sum, cashout) => sum + Number(cashout.amount || 0), 0) || 0
  const available = Math.max(0, trainerEarnings - reserved)

  if (amount > available) {
    return NextResponse.json({ error: "Amount exceeds available balance" }, { status: 400 })
  }

  const { data: created, error: createError } = await supabase
    .from("cashout_requests")
    .insert({
      trainer_id: user.id,
      amount,
      currency: "XAF",
      status: "PENDING",
      provider: provider || profile.mobile_money_provider || null,
      phone_number: phoneNumber || profile.phone_number || null,
      note,
    })
    .select("*")
    .single()

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 500 })
  }

  return NextResponse.json({ data: created })
}
