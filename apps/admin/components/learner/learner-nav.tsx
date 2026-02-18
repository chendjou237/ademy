import { BookOpen } from "lucide-react"
import Link from "next/link"
import { LearnerNavClient } from "./learner-nav-client"
import Image from 'next/image'

export async function LearnerNav() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/learner/dashboard" className="flex items-center gap-2">
              <Image
                         src="/logo.png"
                         alt="Ademy"
                         width={160}
                         height={48}
                         className="h-12 w-auto"
                         priority
                       />
          </Link>

          <LearnerNavClient />
        </nav>
      </div>
    </header>
  )
}
