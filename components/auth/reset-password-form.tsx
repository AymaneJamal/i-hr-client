"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock, CheckCircle, ArrowLeft } from "lucide-react"
import Image from "next/image"

interface ResetPasswordFormProps {
  email: string
  onBackToLogin: () => void
  onSuccess: () => void
}

export function ResetPasswordForm({ email, onBackToLogin, onSuccess }: ResetPasswordFormProps) {
  const { setNewPassword: setAuthNewPassword } = useAuth()
  const [code, setCode] = useState("")
  const [newPassword, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Password validation
  const validatePassword = (password: string) => {
    const minLength = password.length >= 10
    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    return {
      minLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar,
      isValid: minLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar,
    }
  }

  const passwordValidation = validatePassword(newPassword)
  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== ""

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!passwordValidation.isValid) {
      setError("Le mot de passe ne respecte pas les critères de sécurité")
      return
    }

    if (!passwordsMatch) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    if (code !== "123456") {
      setError("Code de vérification invalide")
      return
    }

    setIsLoading(true)

    try {
      await setAuthNewPassword(code, newPassword)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
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
              <h1 className="text-3xl font-bold text-gray-900">Nouveau mot de passe</h1>
              <p className="text-gray-600">
                Saisissez le code reçu par e-mail à <strong>{email}</strong> et créez votre nouveau mot de passe.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Code de vérification */}
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
                <p className="text-xs text-gray-500">Code de démonstration : 123456</p>
              </div>

              {/* Nouveau mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                  Nouveau mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 text-gray-400 -translate-y-1/2" />
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    value={newPassword}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11 h-12 border-gray-200 focus:border-[#2d5a5a] focus:ring-[#2d5a5a] rounded-lg"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 hover:bg-gray-100"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Confirmation mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirmer le mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 text-gray-400 -translate-y-1/2" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-11 pr-11 h-12 border-gray-200 focus:border-[#2d5a5a] focus:ring-[#2d5a5a] rounded-lg"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 hover:bg-gray-100"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Password validation indicators */}
            {newPassword && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">Critères du mot de passe :</p>
                <div className="space-y-1">
                  <div
                    className={`flex items-center gap-2 text-xs ${passwordValidation.minLength ? "text-green-600" : "text-gray-500"}`}
                  >
                    <CheckCircle
                      className={`h-3 w-3 ${passwordValidation.minLength ? "text-green-600" : "text-gray-400"}`}
                    />
                    Au moins 10 caractères
                  </div>
                  <div
                    className={`flex items-center gap-2 text-xs ${passwordValidation.hasUppercase ? "text-green-600" : "text-gray-500"}`}
                  >
                    <CheckCircle
                      className={`h-3 w-3 ${passwordValidation.hasUppercase ? "text-green-600" : "text-gray-400"}`}
                    />
                    Une lettre majuscule
                  </div>
                  <div
                    className={`flex items-center gap-2 text-xs ${passwordValidation.hasLowercase ? "text-green-600" : "text-gray-500"}`}
                  >
                    <CheckCircle
                      className={`h-3 w-3 ${passwordValidation.hasLowercase ? "text-green-600" : "text-gray-400"}`}
                    />
                    Une lettre minuscule
                  </div>
                  <div
                    className={`flex items-center gap-2 text-xs ${passwordValidation.hasNumber ? "text-green-600" : "text-gray-500"}`}
                  >
                    <CheckCircle
                      className={`h-3 w-3 ${passwordValidation.hasNumber ? "text-green-600" : "text-gray-400"}`}
                    />
                    Un chiffre
                  </div>
                  <div
                    className={`flex items-center gap-2 text-xs ${passwordValidation.hasSpecialChar ? "text-green-600" : "text-gray-500"}`}
                  >
                    <CheckCircle
                      className={`h-3 w-3 ${passwordValidation.hasSpecialChar ? "text-green-600" : "text-gray-400"}`}
                    />
                    Un caractère spécial
                  </div>
                  {confirmPassword && (
                    <div
                      className={`flex items-center gap-2 text-xs ${passwordsMatch ? "text-green-600" : "text-red-500"}`}
                    >
                      <CheckCircle className={`h-3 w-3 ${passwordsMatch ? "text-green-600" : "text-red-400"}`} />
                      Les mots de passe correspondent
                    </div>
                  )}
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <Button
                type="submit"
                className="w-full h-12 bg-[#2d5a5a] hover:bg-[#2d5a5a]/90 text-white font-medium rounded-lg transition-all duration-200"
                disabled={isLoading || !passwordValidation.isValid || !passwordsMatch}
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  "Réinitialiser le mot de passe"
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
                <h2 className="text-2xl font-semibold text-white/90">Sécurité Maximale</h2>
                <p className="text-lg text-white/80 leading-relaxed max-w-md">
                  Votre nouveau mot de passe sera chiffré avec les dernières technologies de sécurité pour protéger
                  votre compte.
                </p>
              </div>
            </div>

            {/* Security Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#f4a261] rounded-full flex items-center justify-center text-white font-bold text-sm">
                  ✓
                </div>
                <span className="text-white/90">Chiffrement AES-256</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#e76f51] rounded-full flex items-center justify-center text-white font-bold text-sm">
                  ✓
                </div>
                <span className="text-white/90">Validation en temps réel</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#2a9d8f] rounded-full flex items-center justify-center text-white font-bold text-sm">
                  ✓
                </div>
                <span className="text-white/90">Protection contre les attaques</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
