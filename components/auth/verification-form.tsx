"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Mail, RefreshCw } from "lucide-react"
import Image from "next/image"

export function VerificationForm() {
  const { verifyEmail } = useAuth()
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await verifyEmail(code)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Verification Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <Image src="/rivolio-text.png" alt="Rivolio" width={300} height={80} className="h-16 w-auto" priority />
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 bg-[#2d5a5a]/10 rounded-full flex items-center justify-center mx-auto">
                <Mail className="h-8 w-8 text-[#2d5a5a]" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Vérifiez votre e-mail</h1>
              <p className="text-gray-600">
                Nous avons envoyé un code de vérification à votre adresse e-mail. Saisissez-le ci-dessous pour
                continuer.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-medium text-gray-700">
                Code de vérification
              </Label>
              <Input
                id="code"
                type="text"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="h-12 text-center text-lg tracking-widest border-gray-200 focus:border-[#2d5a5a] focus:ring-[#2d5a5a] rounded-lg"
                maxLength={6}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <Button
                type="submit"
                className="w-full h-12 bg-[#2d5a5a] hover:bg-[#2d5a5a]/90 text-white font-medium rounded-lg transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  "Vérifier le code"
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-[#2d5a5a] hover:text-[#2d5a5a]/80 hover:bg-[#2d5a5a]/5 flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Renvoyer le code
              </Button>
            </div>
          </form>

          <div className="text-center text-sm text-gray-500">
            <p>© 2024 Rivolio. Tous droits réservés.</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Brand */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#2d5a5a] via-[#2d5a5a]/90 to-[#1a4040] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-[#f4a261] rounded-full blur-3xl" />
          <div className="absolute top-40 right-32 w-24 h-24 bg-[#e76f51] rounded-full blur-2xl" />
          <div className="absolute bottom-32 left-32 w-40 h-40 bg-[#2a9d8f] rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-28 h-28 bg-[#f4a261] rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <div className="space-y-12">
            {/* Brand Section */}
            <div className="space-y-6">
              <div className="flex justify-center lg:justify-start">
                <Image
                  src="/logo-original.png"
                  alt="Rivolio Logo"
                  width={120}
                  height={120}
                  className="h-24 w-24"
                  priority
                />
              </div>
              <div className="space-y-4">
                <h1 className="text-6xl font-bold leading-tight tracking-tight">RIVOLIO</h1>
                <h2 className="text-2xl font-semibold text-white/90">Sécurité Renforcée</h2>
                <p className="text-lg text-white/80 leading-relaxed max-w-md">
                  La vérification par e-mail garantit que seuls les utilisateurs autorisés accèdent à votre espace
                  Rivolio.
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#f4a261] rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Protection des données</h3>
                  <p className="text-white/70">Vos informations sont chiffrées et sécurisées</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#e76f51] rounded-lg flex items-center justify-center">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Vérification rapide</h3>
                  <p className="text-white/70">Processus simple et sécurisé en quelques secondes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
