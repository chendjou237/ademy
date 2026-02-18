import Link from "next/link"
import { AdminNavClient } from "./admin-nav-client"
import Image from "next/image"

export async function AdminNav() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <Image
             src="/logo.png"
             alt="Ademy"
             width={160}
             height={48}
             className="h-12 w-auto"
             priority
           />
          </Link>

          <AdminNavClient />
        </nav>
      </div>
    </header>
  )
}
