import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { AuthInitializer } from "@/components/auth/auth-initializer"
import { SecurityProvider } from "@/components/auth/security-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Rivolio",
  description: "Advanced client platform with secure authentication",
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
            <SecurityProvider validationInterval={60}>
              {children}
            </SecurityProvider>
          </AuthInitializer>
        </Providers>
      </body>
    </html>
  )
}