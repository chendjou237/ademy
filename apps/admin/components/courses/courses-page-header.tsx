"use client"

import { useTranslation } from "@/lib/i18n/context"

export function CoursesPageHeader() {
  const { t } = useTranslation()

  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-foreground mb-2">{t("page.browseCourses")}</h1>
      <p className="text-lg text-muted-foreground">{t("page.discoverCourses")}</p>
    </div>
  )
}
