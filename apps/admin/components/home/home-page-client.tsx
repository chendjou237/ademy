"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from "@/lib/i18n/context"
import { BookOpen, Clock, DollarSign } from "lucide-react"
import Link from "next/link"

export function HomePageClient() {
  const { t } = useTranslation()

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-foreground mb-6">{t("home.hero.title")}</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t("home.hero.subtitle")}
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/courses">
              <Button size="lg">{t("home.hero.cta")}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            {t("home.features.title")}
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <BookOpen className="h-12 w-12 text-primary mb-4" />
                <CardTitle>{t("home.features.quality")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t("home.features.qualityDesc")}</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="h-12 w-12 text-primary mb-4" />
                <CardTitle>{t("home.features.flexible")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t("home.features.flexibleDesc")}</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <DollarSign className="h-12 w-12 text-primary mb-4" />
                <CardTitle>{t("home.features.pricing")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t("home.features.pricingDesc")}</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  )
}
