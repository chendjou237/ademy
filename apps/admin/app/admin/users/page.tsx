import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminNav } from "@/components/admin/admin-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { search?: string }
}) {
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

  const params = await searchParams

  // Get all users
  let query = supabase.from("profiles").select("*").order("created_at", { ascending: false })

  if (params.search) {
    query = query.or(`full_name.ilike.%${params.search}%,email.ilike.%${params.search}%`)
  }

  const { data: users } = await query

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">User Management</h1>
          <p className="text-muted-foreground">View and manage all platform users</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <form action="/admin/users" method="get" className="flex gap-4">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="search"
                placeholder="Search users by name or email..."
                defaultValue={params.search}
                className="pl-10"
              />
            </div>
          </form>
        </div>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>{users?.length || 0} total users</CardDescription>
          </CardHeader>
          <CardContent>
            {users && users.length > 0 ? (
              <div className="space-y-3">
                {users.map((userProfile) => (
                  <div
                    key={userProfile.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-semibold text-primary">
                          {userProfile.full_name?.[0] || userProfile.email[0].toUpperCase()}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground">{userProfile.full_name || "No name"}</h4>
                        <p className="text-sm text-muted-foreground truncate">{userProfile.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge
                        variant={
                          userProfile.role === "admin"
                            ? "default"
                            : userProfile.role === "trainer"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {userProfile.role}
                      </Badge>

                      <span className="text-xs text-muted-foreground">
                        {new Date(userProfile.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No users found</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
