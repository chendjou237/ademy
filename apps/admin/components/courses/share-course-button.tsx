"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"
import { toast } from "sonner"

interface ShareCourseButtonProps {
  title: string
  courseId: string
  className?: string
}

export function ShareCourseButton({ title, courseId, className }: ShareCourseButtonProps) {
  const { t } = useTranslation()
  const [toastShown, setToastShown] = useState(false)
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/courses/${courseId}` : ""

  const showToast = (message: string) => {
    if (toastShown) return
    toast(message, { duration: 2200 })
    setToastShown(true)
    window.setTimeout(() => setToastShown(false), 2300)
  }

  const handleShare = async () => {
    if (!shareUrl) return

    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl })
        showToast(t("share.shared"))
        return
      } catch {
        // fall back to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl)
      showToast(t("share.copied"))
    } catch {
      showToast(t("share.failed"))
    }
  }

  return (
    <Button variant="outline" className={className} onClick={handleShare}>
      <Share2 className="mr-2 h-4 w-4" />
      {t("share.button")}
    </Button>
  )
}
