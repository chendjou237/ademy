"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from "@/lib/i18n/context"
import { BookOpen, DollarSign, Plus, TrendingUp, Users } from "lucide-react"
import Link from "next/link"

interface Course {
  id: string
  title: string
  description: string | null
  is_published: boolean
  lessons?: { count: number }[]
}

interface TrainerDashboardClientProps {
  courses: Course[] | null
  totalCourses: number
  publishedCourses: number
  totalStudents: number
}

export function TrainerDashboardClient({
  courses,
  totalCourses,
  publishedCourses,
  totalStudents,
}: TrainerDashboardClientProps) {
  const { t } = useTranslation()

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t("trainer.dashboard")}</h1>
          <p className="text-muted-foreground">{t("trainer.manageCourses")}</p>
        </div>
        <Link href="/trainer/courses/new">
          <Button size="lg">
            <Plus className="mr-2 h-5 w-5" />
            {t("trainer.createCourse")}
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("trainer.totalCourses")}
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalCourses}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {publishedCourses} {t("trainer.published_count")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("trainer.totalStudents")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">{t("trainer.acrossAllCourses")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("trainer.revenue")}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">0 XAF</div>
            <p className="text-xs text-muted-foreground mt-1">{t("trainer.comingSoon")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("trainer.growth")}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">+0%</div>
            <p className="text-xs text-muted-foreground mt-1">{t("trainer.thisMonth")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Courses List */}
      <Card>
        <CardHeader>
          <CardTitle>{t("trainer.yourCourses")}</CardTitle>
          <CardDescription>{t("trainer.manageContent")}</CardDescription>
        </CardHeader>
        <CardContent>
          {courses && courses.length > 0 ? (
            <div className="space-y-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{course.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {course.description || t("trainer.noDescription")}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>
                        {course.lessons?.[0]?.count || 0} {t("common.lessons")}
                      </span>
                      <span>•</span>
                      <span className={course.is_published ? "text-secondary" : "text-muted-foreground"}>
                        {course.is_published ? t("trainer.published") : t("trainer.draft")}
                      </span>
                    </div>
                  </div>
                  <Link href={`/trainer/courses/${course.id}`}>
                    <Button variant="outline">{t("trainer.editCourse")}</Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{t("trainer.noCoursesYet")}</h3>
              <p className="text-muted-foreground mb-4">{t("trainer.createFirstCourse")}</p>
              <Link href="/trainer/courses/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("trainer.createYourFirst")}
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
