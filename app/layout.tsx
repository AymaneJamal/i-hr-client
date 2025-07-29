import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { AuthInitializer } from "@/components/auth/auth-initializer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Rivolio HR SaaS",
  description: "Advanced client platform with multi-tier authentication",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Providers>
          <AuthInitializer>
            {children}
          </AuthInitializer>
        </Providers>
      </body>
    </html>
  )
}