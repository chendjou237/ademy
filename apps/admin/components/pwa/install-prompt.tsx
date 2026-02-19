"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "@/lib/i18n/context"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallPrompt() {
  const { t } = useTranslation()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [toastShown, setToastShown] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem("pwa-install-dismissed")
    if (stored === "1") {
      setDismissed(true)
    }

    const handler = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  useEffect(() => {
    if (!deferredPrompt || dismissed || toastShown) return

    toast(t("pwa.installTitle"), {
      description: t("pwa.installDescription"),
      duration: Infinity,
      action: {
        label: t("pwa.install"),
        onClick: async () => {
          await deferredPrompt.prompt()
          const choice = await deferredPrompt.userChoice
          if (choice.outcome === "accepted") {
            setDeferredPrompt(null)
          }
        },
      },
      cancel: {
        label: t("pwa.notNow"),
        onClick: () => {
          window.localStorage.setItem("pwa-install-dismissed", "1")
          setDismissed(true)
        },
      },
      id: "pwa-install",
    })
    setToastShown(true)
  }, [deferredPrompt, dismissed, toastShown, t])

  if (!deferredPrompt || dismissed) return null

  return null
}
