"use client"

import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n/context"
import { createClient } from "@/lib/supabase/client"
import { LogOut, Menu, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LanguageSwitcher } from "../language-switcher"
import { useState } from "react"

export function TrainerNavClient() {
  const { t } = useTranslation()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <div className="hidden md:flex items-center gap-2">
        <LanguageSwitcher />

        <Link href="/trainer/dashboard">
          <Button variant="ghost">{t("nav.dashboard")}</Button>
        </Link>
        <Link href="/trainer/cashout">
          <Button variant="ghost">{t("nav.cashout")}</Button>
        </Link>
        <Link href="/courses">
          <Button variant="ghost">{t("nav.courses")}</Button>
        </Link>
        <Button variant="ghost" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          {t("nav.logout")}
        </Button>
      </div>

      <div className="flex items-center gap-2 md:hidden">
        <LanguageSwitcher />
        <Button variant="ghost" size="icon" onClick={() => setOpen((prev) => !prev)} aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {open ? (
        <div className="absolute left-0 top-full z-50 w-full border-b border-border bg-card md:hidden">
          <div className="container mx-auto flex flex-col gap-2 px-4 py-3">
            <Link href="/trainer/dashboard" onClick={() => setOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                {t("nav.dashboard")}
              </Button>
            </Link>
            <Link href="/trainer/cashout" onClick={() => setOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                {t("nav.cashout")}
              </Button>
            </Link>
            <Link href="/courses" onClick={() => setOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                {t("nav.courses")}
              </Button>
            </Link>
            <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              {t("nav.logout")}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
