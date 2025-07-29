"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { resetPassword, clearError } from "@/lib/store/auth-slice"
import { Lock, Eye, EyeOff, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [validationError, setValidationError] = useState("")

  const dispatch = useAppDispatch()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { authState, loading, error } = useAppSelector((state) => state.auth)

  const token = searchParams.get("token")

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  // Redirect if already authenticated
  useEffect(() => {
    if (authState === "AUTHENTICATED") {
      router.push("/dashboard")
    } else if (authState === "SEMI_AUTH") {
      router.push("/verify")
    }
  }, [authState, router])

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      router.push("/forgot-password")
    }
  }, [token, router])

  const validatePassword = (pwd: string): string => {
    if (pwd.length < 8) {
      return "Le mot de passe doit contenir au moins 8 caractères"
    }
    if (!/(?=.*[a-z])/.test(pwd)) {
      return "Le mot de passe doit contenir au moins une lettre minuscule"
    }
    if (!/(?=.*[A-Z])/.test(pwd)) {
      return "Le mot de passe doit contenir au moins une lettre majuscule"
    }
    if (!/(?=.*\d)/.test(pwd)) {
      return "Le mot de passe doit contenir au moins un chiffre"
    }
    if (!/(?=.*[@$!%*?&])/.test(pwd)) {
      return "Le mot de passe doit contenir au moins un caractère spécial (@$!%*?&)"
    }
    return ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearError())
    setValidationError("")

    if (!password.trim() || !confirmPassword.trim()) {
      setValidationError("Veuillez remplir tous les champs")
      return
    }

    const passwordValidation = validatePassword(password)
    if (passwordValidation) {
      setValidationError(passwordValidation)
      return
    }

    if (password !== confirmPassword) {
      setValidationError("Les mots de passe ne correspondent pas")
      return
    }

    if (!token) {
      setValidationError("Token de réinitialisation manquant")
      return
    }

    try {
      await dispatch(resetPassword({ token, newPassword: password })).unwrap()
      setIsSubmitted(true)
    } catch (err) {
      // Error is handled by Redux slice
      console.error("Reset password error:", err)
    }
  }

  const handleBackToLogin = () => {
    router.push("/login")
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-600 text-white p-3 rounded-lg">
                <AlertCircle className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-red-600">
              Lien invalide
            </CardTitle>
            <CardDescription className="text-center">
              Le lien de réinitialisation est invalide ou a expiré
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleBackToLogin} className="w-full">
              Retour à la connexion
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-600 text-white p-3 rounded-lg">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-green-600">
              Mot de passe réinitialisé !
            </CardTitle>
            <CardDescription className="text-center">
              Votre mot de passe a été réinitialisé avec succès
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-700 text-center">
                  Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                </p>
              </div>

              <Button onClick={handleBackToLogin} className="w-full">
                Se connecter
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-teal-600 text-white p-3 rounded-lg">
              <Lock className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Nouveau mot de passe
          </CardTitle>
          <CardDescription className="text-center">
            Choisissez un nouveau mot de passe sécurisé
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {(error || validationError) && (
              <Alert variant="destructive">
                <AlertDescription>{error || validationError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
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
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
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

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">Le mot de passe doit contenir :</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Au moins 8 caractères</li>
                <li>• Une lettre minuscule (a-z)</li>
                <li>• Une lettre majuscule (A-Z)</li>
                <li>• Un chiffre (0-9)</li>
                <li>• Un caractère spécial (@$!%*?&)</li>
              </ul>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !password.trim() || !confirmPassword.trim()}
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Réinitialisation...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Réinitialiser le mot de passe
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Vous vous souvenez de votre mot de passe ?{" "}
              <Link 
                href="/login" 
                className="text-teal-600 hover:text-teal-500 font-medium"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}