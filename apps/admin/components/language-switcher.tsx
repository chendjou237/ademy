"use client"

import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n/context"
import { useEffect, useState } from "react"

export function LanguageSwitcher() {
  const [mounted, setMounted] = useState(false)
  const { language, setLanguage } = useTranslation()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="text-sm" disabled>
        🇫🇷 FR
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === "fr" ? "en" : "fr")}
      className="text-sm"
    >
      {language === "fr" ? "🇫🇷 FR" : "🇬🇧 EN"}
    </Button>
  )
}
