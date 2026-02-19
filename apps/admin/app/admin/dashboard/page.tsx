import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminNav } from "@/components/admin/admin-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, GraduationCap, TrendingUp, Wallet } from "lucide-react"

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  // Get platform statistics
  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  const { count: totalCourses } = await supabase.from("courses").select("*", { count: "exact", head: true })

  const { count: publishedCourses } = await supabase
    .from("courses")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true)

  const { count: totalEnrollments } = await supabase.from("enrollments").select("*", { count: "exact", head: true })

  const { count: trainers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "trainer")

  const { count: learners } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "learner")

  const { count: pendingCashouts } = await supabase
    .from("cashout_requests")
    .select("*", { count: "exact", head: true })
    .in("status", ["PENDING", "APPROVED"])

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage the Ademy platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">{totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {trainers || 0} trainers, {learners || 0} learners
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">{totalCourses || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">{publishedCourses || 0} published</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Enrollments</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">{totalEnrollments || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Active learners</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Platform Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">+0%</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Cashouts</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">{pendingCashouts || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Needs review</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Overview</CardTitle>
              <CardDescription>Key metrics at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-foreground">Active Trainers</p>
                    <p className="text-xs text-muted-foreground">Creating content</p>
                  </div>
                  <div className="text-2xl font-bold text-primary">{trainers || 0}</div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-foreground">Active Learners</p>
                    <p className="text-xs text-muted-foreground">Taking courses</p>
                  </div>
                  <div className="text-2xl font-bold text-secondary">{learners || 0}</div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-foreground">Published Courses</p>
                    <p className="text-xs text-muted-foreground">Available to learners</p>
                  </div>
                  <div className="text-2xl font-bold text-primary">{publishedCourses || 0}</div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-foreground">Total Enrollments</p>
                    <p className="text-xs text-muted-foreground">Course registrations</p>
                  </div>
                  <div className="text-2xl font-bold text-secondary">{totalEnrollments || 0}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage platform resources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <a
                  href="/admin/users"
                  className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Manage Users</p>
                      <p className="text-xs text-muted-foreground">View and edit user accounts</p>
                    </div>
                  </div>
                </a>

                <a
                  href="/admin/courses"
                  className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                      <BookOpen className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Manage Courses</p>
                      <p className="text-xs text-muted-foreground">Review and moderate courses</p>
                    </div>
                  </div>
                </a>

                <a
                  href="/admin/enrollments"
                  className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">View Enrollments</p>
                      <p className="text-xs text-muted-foreground">Track student progress</p>
                    </div>
                  </div>
                </a>

                <a
                  href="/admin/cashouts"
                  className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                      <Wallet className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Review Cashouts</p>
                      <p className="text-xs text-muted-foreground">Approve trainer payouts</p>
                    </div>
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
