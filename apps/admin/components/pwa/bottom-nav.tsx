"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { BookOpen, Home, Wallet } from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"

interface BottomNavItem {
  href: string
  label: string
  icon: React.ReactNode
}

interface BottomNavProps {
  items: BottomNavItem[]
}

export function BottomNav({ items }: BottomNavProps) {
  const pathname = usePathname()
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true
    setIsStandalone(standalone)
  }, [])

  if (!isStandalone) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around px-4 py-2">
        {items.map((item) => {
          const active = pathname?.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 text-xs">
              <span className={active ? "text-primary" : "text-muted-foreground"}>{item.icon}</span>
              <span className={active ? "text-primary" : "text-muted-foreground"}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export function TrainerBottomNav() {
  const { t } = useTranslation()
  return (
    <BottomNav
      items={[
        { href: "/trainer/dashboard", label: t("nav.dashboard"), icon: <Home className="h-5 w-5" /> },
        { href: "/courses", label: t("nav.courses"), icon: <BookOpen className="h-5 w-5" /> },
        { href: "/trainer/cashout", label: t("nav.cashout"), icon: <Wallet className="h-5 w-5" /> },
      ]}
    />
  )
}

export function LearnerBottomNav() {
  const { t } = useTranslation()
  return (
    <BottomNav
      items={[
        { href: "/learner/dashboard", label: t("nav.myCourses"), icon: <Home className="h-5 w-5" /> },
        { href: "/courses", label: t("nav.courses"), icon: <BookOpen className="h-5 w-5" /> },
      ]}
    />
  )
}
