"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "@/lib/i18n/context"

export function PwaUpdateToast() {
  const { t } = useTranslation()
  const [updateReady, setUpdateReady] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [toastShown, setToastShown] = useState(false)

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return
      setRegistration(reg)

      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing
        if (!newWorker) return

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            const shown = window.sessionStorage.getItem("pwa-update-dismissed")
            if (shown === "1") return
            setUpdateReady(true)
          }
        })
      })
    })

    const controllerChange = () => window.location.reload()
    navigator.serviceWorker.addEventListener("controllerchange", controllerChange)

    return () => navigator.serviceWorker.removeEventListener("controllerchange", controllerChange)
  }, [])

  if (!updateReady || dismissed) return null

  const handleRefresh = async () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" })
    }
    window.location.reload()
  }

  useEffect(() => {
    if (!updateReady || dismissed || toastShown) return

    toast(t("pwa.updateTitle"), {
      description: t("pwa.updateDescription"),
      duration: Infinity,
      action: {
        label: t("pwa.refresh"),
        onClick: handleRefresh,
      },
      cancel: {
        label: t("pwa.dismiss"),
        onClick: () => {
          window.sessionStorage.setItem("pwa-update-dismissed", "1")
          setDismissed(true)
        },
      },
      id: "pwa-update",
    })
    setToastShown(true)
  }, [updateReady, dismissed, toastShown, handleRefresh, t])

  return null
}
