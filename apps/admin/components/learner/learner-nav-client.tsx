"use client"

import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n/context"
import { createClient } from "@/lib/supabase/client"
import { LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LanguageSwitcher } from "../language-switcher"

export function LearnerNavClient() {
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

      <Link href="/learner/dashboard">
        <Button variant="ghost">{t("nav.myCourses")}</Button>
      </Link>
      <Link href="/courses">
        <Button variant="ghost">{t("button.browseCourses")}</Button>
      </Link>
      <Button variant="ghost" onClick={handleSignOut}>
        <LogOut className="mr-2 h-4 w-4" />
        {t("nav.logout")}
      </Button>
    </div>
  )
}
