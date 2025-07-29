"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { resetPassword, clearError } from "@/lib/store/auth-slice"
import { Eye, EyeOff, Lock, ArrowRight, ArrowLeft, Shield, CheckCircle, Users, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const dispatch = useAppDispatch()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { authState, loading, error } = useAppSelector((state) => state.auth)

  const token = searchParams.get("token")

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  // Redirect if authenticated
  useEffect(() => {
    if (authState === "AUTHENTICATED") {
      router.push("/dashboard")
    } else if (authState === "SEMI_AUTH") {
      router.push("/verify")
    }
  }, [authState, router])

  // Check if token is present
  useEffect(() => {
    if (!token) {
      router.push("/forgot-password")
    }
  }, [token, router])

  const validatePassword = (password: string) => {
    const checks = [
      { label: "Au moins 10 caractères", valid: password.length >= 10 },
      { label: "Au moins 1 majuscule", valid: /[A-Z]/.test(password) },
      { label: "Au moins 1 minuscule", valid: /[a-z]/.test(password) },
      { label: "Au moins 1 chiffre", valid: /\d/.test(password) },
      { label: "Au moins 1 caractère spécial", valid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) }
    ]
    return checks
  }

  const passwordChecks = validatePassword(newPassword)
  const isPasswordValid = passwordChecks.every(check => check.valid)
  const doPasswordsMatch = newPassword === confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearError())
    setIsLoading(true)

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setIsLoading(false)
      return
    }

    if (!isPasswordValid) {
      setIsLoading(false)
      return
    }

    if (!doPasswordsMatch) {
      setIsLoading(false)
      return
    }

    if (!token) {
      setIsLoading(false)
      router.push("/forgot-password")
      return
    }

    try {
      await dispatch(resetPassword({ token, newPassword })).unwrap()
      setSuccess(true)
    } catch (err: any) {
      console.error("Reset password error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex">
        {/* Left Panel - Success Message */}
        <div className="flex-1 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md space-y-8 text-center">
            {/* Logo */}
            <div className="w-16 h-16 bg-[#2d5a5a] rounded-xl flex items-center justify-center mx-auto mb-4">
              <div className="text-white font-bold text-xl">i-RH</div>
            </div>

            {/* Success Icon */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-gray-900">Mot de passe réinitialisé !</h1>
              <p className="text-gray-600">
                Votre mot de passe a été mis à jour avec succès.
              </p>
              <p className="text-sm text-gray-500">
                Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
              </p>
            </div>

            <Link href="/login">
              <Button className="w-full h-12 bg-[#2d5a5a] hover:bg-[#2d5a5a]/90 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2">
                Se connecter
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            {/* Footer */}
            <div className="text-center text-sm text-gray-500">
              <p>© 2024 Rivolio - Tous droits réservés</p>
            </div>
          </div>
        </div>

        {/* Right Panel - Features */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#2d5a5a] to-[#1a4040] text-white">
          <div className="flex flex-col justify-center p-12 max-w-lg mx-auto">
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold mb-4">Sécurité renforcée</h2>
                <p className="text-lg text-white/80">
                  Votre nouveau mot de passe est maintenant actif et sécurisé.
                </p>
              </div>

              {/* Features Section */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#f4a261] rounded-lg flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Protection maximale</h3>
                    <p className="text-white/70">Mot de passe chiffré selon les standards les plus élevés</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#e76f51] rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Compte sécurisé</h3>
                    <p className="text-white/70">Accès à toutes vos données RH en toute sécurité</p>
                  </div>
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
      {/* Left Panel - Reset Password Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <div className="w-16 h-16 bg-[#2d5a5a] rounded-xl flex items-center justify-center mx-auto mb-4">
              <div className="text-white font-bold text-xl">i-RH</div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Nouveau mot de passe</h1>
            <p className="text-gray-600">Choisissez un mot de passe sécurisé pour votre compte</p>
          </div>

          {/* Reset Password Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                  Nouveau mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pl-10 pr-10 h-12 rounded-lg border-gray-300 focus:border-[#2d5a5a] focus:ring-[#2d5a5a]"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirmer le mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pl-10 pr-10 h-12 rounded-lg border-gray-300 focus:border-[#2d5a5a] focus:ring-[#2d5a5a]"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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

            {/* Password Requirements */}
            {newPassword && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Exigences du mot de passe</Label>
                <div className="space-y-1">
                  {passwordChecks.map((check, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle 
                        className={`h-4 w-4 ${check.valid ? 'text-green-500' : 'text-gray-300'}`} 
                      />
                      <span className={check.valid ? 'text-green-700' : 'text-gray-500'}>
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Password Match Check */}
            {confirmPassword && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle 
                  className={`h-4 w-4 ${doPasswordsMatch ? 'text-green-500' : 'text-red-500'}`} 
                />
                <span className={doPasswordsMatch ? 'text-green-700' : 'text-red-700'}>
                  {doPasswordsMatch ? 'Les mots de passe correspondent' : 'Les mots de passe ne correspondent pas'}
                </span>
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
                className="w-full h-12 bg-[#2d5a5a] hover:bg-[#2d5a5a]/90 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                disabled={isLoading || loading || !isPasswordValid || !doPasswordsMatch}
              >
                {isLoading || loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    Réinitialiser le mot de passe
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <Link href="/login">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-[#2d5a5a] hover:text-[#2d5a5a]/80 hover:bg-[#2d5a5a]/5 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          </form>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500">
            <p>© 2024 Rivolio - Tous droits réservés</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Features */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#2d5a5a] to-[#1a4040] text-white">
        <div className="flex flex-col justify-center p-12 max-w-lg mx-auto">
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold mb-4">Sécurité avant tout</h2>
              <p className="text-lg text-white/80">
                Créez un mot de passe robuste pour protéger vos données RH.
              </p>
            </div>

            {/* Features Section */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#f4a261] rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Chiffrement avancé</h3>
                  <p className="text-white/70">Vos mots de passe sont chiffrés avec les meilleurs algorithmes</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#e76f51] rounded-lg flex items-center justify-center">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Standards élevés</h3>
                  <p className="text-white/70">Conformité aux normes de sécurité internationales</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#2a9d8f] rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Données protégées</h3>
                  <p className="text-white/70">Toutes vos informations RH restent confidentielles</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}