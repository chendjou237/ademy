"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from "@/lib/i18n/context"
import { BookOpen, Users } from "lucide-react"
import Link from "next/link"

interface Course {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  price: number
  category: string | null
  level: string | null
  profiles: { full_name: string | null } | null
  lessons: { count: number }[]
  enrollments: { count: number }[]
}

interface CoursesPageClientProps {
  courses: Course[] | null
}

export function CoursesPageClient({ courses }: CoursesPageClientProps) {
  const { t } = useTranslation()

  return (
    <>
      {courses && courses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>
                        {course.lessons?.[0]?.count || 0} {t("common.lessons")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>
                        {course.enrollments?.[0]?.count || 0} {t("common.students")}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {t("course.by")} {course.profiles?.full_name || "Anonymous"}
                  </p>
                </CardContent>

                <CardFooter>
                  <div className="flex items-center justify-between w-full">
                    <Badge variant="outline" className="text-xs">
                      {course.level ? t(`level.${course.level}` as any) : t("level.allLevels")}
                    </Badge>
                    {course.price === 0 ? (
                      <Badge className="text-xs bg-secondary text-secondary-foreground">
                        {t("common.free")}
                      </Badge>
                    ) : (
                      <span className="text-lg font-bold text-primary">
                        {course.price.toLocaleString()} XAF
    </span>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">{t("course.noCourses")}</h3>
            <p className="text-muted-foreground">{t("course.noCoursesDesc")}</p>
          </CardContent>
        </Card>
      )}
    </>
  )
}
