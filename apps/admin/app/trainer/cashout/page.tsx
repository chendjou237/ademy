import { TrainerNav } from "@/components/trainer/trainer-nav"
import { TrainerCashoutClient } from "@/components/trainer/trainer-cashout-client"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function TrainerCashoutPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "trainer") {
    redirect("/dashboard")
  }

  const { data: transactions } = await supabase
    .from("payment_transactions")
    .select("amount")
    .eq("trainer_id", user.id)
    .eq("status", "SUCCESS")

  const { data: cashouts } = await supabase
    .from("cashout_requests")
    .select("id, amount, currency, status, provider, phone_number, note, created_at")
    .eq("trainer_id", user.id)
    .order("created_at", { ascending: false })

  const totalRevenue = transactions?.reduce((sum, tx) => sum + Number(tx.amount || 0), 0) || 0
  const trainerEarnings = Math.floor(totalRevenue * 0.7)
  const totalPaidOut = (cashouts || [])
    .filter((cashout) => cashout.status === "PAID")
    .reduce((sum, cashout) => sum + Number(cashout.amount || 0), 0)
  const pendingAmount = (cashouts || [])
    .filter((cashout) => cashout.status === "PENDING" || cashout.status === "APPROVED")
    .reduce((sum, cashout) => sum + Number(cashout.amount || 0), 0)
  const reserved = totalPaidOut + pendingAmount
  const availableBalance = Math.max(0, trainerEarnings - reserved)

  return (
    <div className="min-h-screen bg-background">
      <TrainerNav />
      <TrainerCashoutClient
        profile={{
          phone_number: null,
          mobile_money_provider: null,
        }}
        summary={{
          totalRevenue,
          trainerEarnings,
          totalPaidOut,
          pendingAmount,
          availableBalance,
        }}
        cashouts={cashouts || []}
      />
    </div>
  )
}
