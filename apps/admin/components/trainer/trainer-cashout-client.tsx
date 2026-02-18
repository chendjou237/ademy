"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useTranslation } from "@/lib/i18n/context"

interface CashoutRecord {
  id: string
  amount: number
  currency: string
  status: string
  provider: string | null
  phone_number: string | null
  note: string | null
  created_at: string
}

interface TrainerCashoutClientProps {
  profile: {
    phone_number: string | null
    mobile_money_provider: string | null
  }
  summary: {
    totalRevenue: number
    trainerEarnings: number
    totalPaidOut: number
    pendingAmount: number
    availableBalance: number
  }
  cashouts: CashoutRecord[]
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary",
  APPROVED: "outline",
  PAID: "default",
  REJECTED: "destructive",
  CANCELLED: "destructive",
}

export function TrainerCashoutClient({ profile, summary, cashouts }: TrainerCashoutClientProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [provider, setProvider] = useState(profile.mobile_money_provider || "")
  const [phoneNumber, setPhoneNumber] = useState(profile.phone_number || "")
  const [note, setNote] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const availableDisplay = useMemo(
    () => `${summary.availableBalance.toLocaleString()} XAF`,
    [summary.availableBalance]
  )

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError(t("cashout.invalidAmount"))
      return
    }

    if (numericAmount > summary.availableBalance) {
      setError(t("cashout.amountExceedsBalance"))
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/cashouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numericAmount,
          provider: provider || null,
          phoneNumber: phoneNumber || null,
          note: note || null,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result?.error || t("error.generic"))
      }

      setAmount("")
      setNote("")
      setSuccess(t("cashout.requestSubmitted"))
      router.refresh()
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : t("error.generic")
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t("cashout.title")}</h1>
        <p className="text-muted-foreground">{t("cashout.subtitle")}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("cashout.totalRevenue")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {summary.totalRevenue.toLocaleString()} XAF
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("cashout.trainerEarnings")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {summary.trainerEarnings.toLocaleString()} XAF
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("cashout.pending")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {summary.pendingAmount.toLocaleString()} XAF
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("cashout.available")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{availableDisplay}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t("cashout.requestTitle")}</CardTitle>
            <CardDescription>{t("cashout.requestDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error ? (
                <Alert variant="destructive">
                  <AlertTitle>{t("cashout.requestFailed")}</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
              {success ? (
                <Alert>
                  <AlertTitle>{t("cashout.requestSuccess")}</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="amount">{t("cashout.amount")}</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="1"
                  placeholder={t("cashout.amountPlaceholder")}
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {t("cashout.availableBalance")}: {availableDisplay}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider">{t("cashout.provider")}</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger id="provider">
                    <SelectValue placeholder={t("cashout.selectProvider")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MTN MoMo">MTN MoMo</SelectItem>
                    <SelectItem value="Orange Money">Orange Money</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t("cashout.phoneNumber")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={t("cashout.phonePlaceholder")}
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">{t("cashout.note")}</Label>
                <Textarea
                  id="note"
                  placeholder={t("cashout.notePlaceholder")}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </div>

              <Button type="submit" disabled={loading || summary.availableBalance <= 0}>
                {loading ? t("cashout.submitting") : t("cashout.submit")}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("cashout.historyTitle")}</CardTitle>
            <CardDescription>{t("cashout.historyDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            {cashouts.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("cashout.noHistory")}</p>
            ) : (
              <div className="space-y-4">
                {cashouts.map((cashout) => (
                  <div
                    key={cashout.id}
                    className="flex flex-col gap-2 rounded-lg border border-border p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-base font-semibold text-foreground">
                        {Number(cashout.amount).toLocaleString()} {cashout.currency}
                      </div>
                      <Badge variant={statusVariant[cashout.status] || "outline"}>
                        {cashout.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(cashout.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {cashout.provider || t("cashout.noProvider")} • {cashout.phone_number || t("cashout.noPhone")}
                    </div>
                    {cashout.note ? (
                      <p className="text-sm text-foreground/80">{cashout.note}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
