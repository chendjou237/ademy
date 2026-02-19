import { I18nProvider } from "@/lib/i18n/context"
import { Analytics } from "@vercel/analytics/next"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import type React from "react"
import { InstallPrompt } from "@/components/pwa/install-prompt"
import { PwaUpdateToast } from "@/components/pwa/update-toast"
import "./globals.css"
import { Toaster } from "sonner"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Ademy - African Course Platform",
  description: "Create and sell online courses in Africa",
  generator: "v0.app",
  manifest: "/manifest.json",
  themeColor: "#0f172a",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`font-sans antialiased`}>
        <I18nProvider>
          {children}
          <InstallPrompt />
          <PwaUpdateToast />
        </I18nProvider>
        <Toaster position="bottom-right" richColors />
        <Analytics />
      </body>
    </html>
  )
}
