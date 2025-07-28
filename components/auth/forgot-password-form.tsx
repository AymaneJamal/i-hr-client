"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, ArrowLeft, CheckCircle, Shield } from "lucide-react"
import Image from "next/image"

interface ForgotPasswordFormProps {
  onBackToLogin: () => void
  onResetPassword: (email: string) => void
}

export function ForgotPasswordForm({ onBackToLogin, onResetPassword }: ForgotPasswordFormProps) {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await resetPassword(email)
      // Passer à la page de réinitialisation au lieu du succès
      onResetPassword(email)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex">
        {/* Left Panel - Success Message */}
        <div className="flex-1 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md space-y-8 text-center">
            <div className="flex justify-center">
              <Image src="/rivolio-text.png" alt="Rivolio" width={300} height={80} className="h-16 w-auto" priority />
            </div>

            <div className="space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">E-mail envoyé !</h1>
                <p className="text-gray-600">
                  Nous avons envoyé un lien de réinitialisation à <strong>{email}</strong>
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-900">Instructions</span>
                </div>
                <div className="text-sm text-blue-700 text-left space-y-1">
                  <p>• Vérifiez votre boîte de réception</p>
                  <p>• Cliquez sur le lien dans l'e-mail</p>
                  <p>• Créez votre nouveau mot de passe</p>
                  <p>• Le lien expire dans 24 heures</p>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={onBackToLogin}
                  className="w-full h-12 bg-[#2d5a5a] hover:bg-[#2d5a5a]/90 text-white font-medium rounded-lg"
                >
                  Retour à la connexion
                </Button>

                <Button
                  variant="ghost"
                  className="w-full text-[#2d5a5a] hover:text-[#2d5a5a]/80 hover:bg-[#2d5a5a]/5"
                  onClick={() => setIsSuccess(false)}
                >
                  Renvoyer l'e-mail
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Same as login */}
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
                  <h2 className="text-2xl font-semibold text-white/90">Récupération Sécurisée</h2>
                  <p className="text-lg text-white/80 leading-relaxed max-w-md">
                    Notre processus de récupération de mot de passe est sécurisé et simple. Vous retrouverez l'accès à
                    votre compte en quelques minutes.
                  </p>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#f4a261] rounded-full flex items-center justify-center text-white font-bold text-sm">
                    1
                  </div>
                  <span className="text-white/90">Saisissez votre adresse e-mail</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#e76f51] rounded-full flex items-center justify-center text-white font-bold text-sm">
                    2
                  </div>
                  <span className="text-white/90">Vérifiez votre boîte de réception</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#2a9d8f] rounded-full flex items-center justify-center text-white font-bold text-sm">
                    3
                  </div>
                  <span className="text-white/90">Créez votre nouveau mot de passe</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Reset Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <Image src="/rivolio-text.png" alt="Rivolio" width={300} height={80} className="h-16 w-auto" priority />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">Mot de passe oublié ?</h1>
              <p className="text-gray-600">
                Pas de problème ! Saisissez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre
                mot de passe.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Adresse e-mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 text-gray-400 -translate-y-1/2" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 border-gray-200 focus:border-[#2d5a5a] focus:ring-[#2d5a5a] rounded-lg"
                  required
                />
              </div>
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
                  "Envoyer le lien de réinitialisation"
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-[#2d5a5a] hover:text-[#2d5a5a]/80 hover:bg-[#2d5a5a]/5 flex items-center justify-center gap-2"
                onClick={onBackToLogin}
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à la connexion
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
                <h2 className="text-2xl font-semibold text-white/90">Récupération Sécurisée</h2>
                <p className="text-lg text-white/80 leading-relaxed max-w-md">
                  Notre processus de récupération de mot de passe est sécurisé et simple. Vous retrouverez l'accès à
                  votre compte en quelques minutes.
                </p>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#f4a261] rounded-full flex items-center justify-center text-white font-bold text-sm">
                  1
                </div>
                <span className="text-white/90">Saisissez votre adresse e-mail</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#e76f51] rounded-full flex items-center justify-center text-white font-bold text-sm">
                  2
                </div>
                <span className="text-white/90">Vérifiez votre boîte de réception</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#2a9d8f] rounded-full flex items-center justify-center text-white font-bold text-sm">
                  3
                </div>
                <span className="text-white/90">Créez votre nouveau mot de passe</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
