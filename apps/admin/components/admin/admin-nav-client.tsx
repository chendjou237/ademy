"use client"

import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n/context"
import { createClient } from "@/lib/supabase/client"
import { LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LanguageSwitcher } from "../language-switcher"

export function AdminNavClient() {
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

      <Link href="/admin/dashboard">
        <Button variant="ghost">{t("nav.dashboard")}</Button>
      </Link>
      <Link href="/admin/users">
        <Button variant="ghost">{t("admin.users")}</Button>
      </Link>
      <Link href="/admin/courses">
        <Button variant="ghost">{t("nav.courses")}</Button>
      </Link>
      <Link href="/admin/enrollments">
        <Button variant="ghost">{t("admin.enrollments")}</Button>
      </Link>
      <Button variant="ghost" onClick={handleSignOut}>
        <LogOut className="mr-2 h-4 w-4" />
        {t("nav.logout")}
      </Button>
    </div>
  )
}
