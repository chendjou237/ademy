import Link from "next/link"
import { TrainerNavClient } from "./trainer-nav-client"
import Image from "next/image"
import { TrainerBottomNav } from "@/components/pwa/bottom-nav"

export async function TrainerNav() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <nav className="relative flex items-center justify-between">
          <Link href="/trainer/dashboard" className="flex items-center gap-2">
          
           <Image
              src="/logo.png"
              alt="Ademy"
              width={160}
              height={48}
              className="h-12 w-auto"
              priority
            />
          </Link>

          <TrainerNavClient />
        </nav>
      </div>
      <TrainerBottomNav />
    </header>
  )
}
