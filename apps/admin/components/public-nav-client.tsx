"use client"

import { LanguageSwitcher } from "@/components/language-switcher"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n/context"
import { LogOut } from "lucide-react"
import Link from "next/link"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface PublicNavClientProps {
  hasUser: boolean
}

export function PublicNavClient({ hasUser }: PublicNavClientProps) {
  const { t } = useTranslation()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <LanguageSwitcher />

      <Link href="/courses">
        <Button variant="ghost">{t("nav.courses")}</Button>
      </Link>

      {hasUser ? (
        <>
          <Link href="/dashboard">
            <Button variant="ghost">{t("nav.dashboard")}</Button>
          </Link>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            {t("nav.logout")}
          </Button>
        </>
      ) : (
        <>
          <Link href="/auth/login">
            <Button variant="ghost">{t("nav.login")}</Button>
          </Link>
          <Link href="/auth/signup">
            <Button>{t("nav.signup")}</Button>
          </Link>
        </>
      )}
    </div>
  )
}
