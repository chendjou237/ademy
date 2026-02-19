"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface CashoutRow {
  id: string
  amount: number
  currency: string
  status: string
  provider: string | null
  phone_number: string | null
  note: string | null
  created_at: string
  trainer: { full_name: string | null; email: string } | null
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary",
  APPROVED: "outline",
  PAID: "default",
  REJECTED: "destructive",
  CANCELLED: "destructive",
}

export function AdminCashoutsClient({ cashouts }: { cashouts: CashoutRow[] }) {
  const router = useRouter()
  const [processingId, setProcessingId] = useState<string | null>(null)

  const updateStatus = async (id: string, status: string) => {
    setProcessingId(id)
    try {
      const response = await fetch(`/api/admin/cashouts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null)
        throw new Error(result?.error || "Failed to update cashout")
      }

      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Cashout Requests</h1>
        <p className="text-muted-foreground">Review and process trainer payout requests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
          <CardDescription>{cashouts.length} total requests</CardDescription>
        </CardHeader>
        <CardContent>
          {cashouts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No cashout requests yet.</p>
          ) : (
            <div className="space-y-4">
              {cashouts.map((cashout) => (
                <div
                  key={cashout.id}
                  className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={statusVariant[cashout.status] || "outline"}>{cashout.status}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(cashout.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-lg font-semibold text-foreground">
                      {Number(cashout.amount).toLocaleString()} {cashout.currency}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {cashout.trainer?.full_name || "Trainer"} • {cashout.trainer?.email}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {cashout.provider || "Provider not set"} • {cashout.phone_number || "Phone not set"}
                    </div>
                    {cashout.note ? <p className="text-sm text-foreground/80">{cashout.note}</p> : null}
                  </div>

                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    {cashout.status === "PENDING" ? (
                      <>
                        <Button
                          variant="outline"
                          disabled={processingId === cashout.id}
                          onClick={() => updateStatus(cashout.id, "APPROVED")}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          disabled={processingId === cashout.id}
                          onClick={() => updateStatus(cashout.id, "REJECTED")}
                        >
                          Reject
                        </Button>
                      </>
                    ) : null}
                    {cashout.status === "APPROVED" ? (
                      <Button
                        disabled={processingId === cashout.id}
                        onClick={() => updateStatus(cashout.id, "PAID")}
                      >
                        Mark Paid
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
