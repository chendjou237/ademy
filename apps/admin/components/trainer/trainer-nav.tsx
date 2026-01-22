import { BookOpen } from "lucide-react"
import Link from "next/link"
import { TrainerNavClient } from "./trainer-nav-client"

export async function TrainerNav() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/trainer/dashboard" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Ademy</span>
          </Link>

          <TrainerNavClient />
        </nav>
      </div>
    </header>
  )
}
