"use client"

import { useTranslation } from "@/lib/i18n/context"

export default function OfflinePage() {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 flex items-center justify-center px-6">
      <div className="max-w-lg w-full rounded-2xl border border-slate-800 bg-slate-950/80 p-8 text-center shadow-xl">
        <h1 className="text-2xl font-semibold mb-3">{t("offline.title")}</h1>
        <p className="text-sm text-slate-300 mb-6">{t("offline.description")}</p>
        <button
          className="rounded-full bg-sky-400 px-5 py-2 text-sm font-semibold text-slate-900"
          onClick={() => window.location.reload()}
        >
          {t("offline.retry")}
        </button>
      </div>
    </div>
  )
}
