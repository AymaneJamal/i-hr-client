"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { forgotPassword, clearError } from "@/lib/store/auth-slice"
import { Mail, ArrowRight, ArrowLeft, Shield, Users, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const dispatch = useAppDispatch()
  const router = useRouter()
  const { authState, loading, error } = useAppSelector((state) => state.auth)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearError())
    setIsLoading(true)

    if (!email.trim()) {
      setIsLoading(false)
      return
    }

    try {
      await dispatch(forgotPassword(email)).unwrap()
      setSuccess(true)
    } catch (err: any) {
      console.error("Forgot password error:", err)
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
              <Mail className="h-8 w-8 text-green-600" />
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-gray-900">Email envoyé !</h1>
              <p className="text-gray-600">
                Nous avons envoyé un lien de réinitialisation à <strong>{email}</strong>
              </p>
              <p className="text-sm text-gray-500">
                Vérifiez votre boîte email et suivez les instructions pour réinitialiser votre mot de passe.
              </p>
            </div>

            <div className="space-y-4">
              <Link href="/login">
                <Button className="w-full h-12 bg-[#2d5a5a] hover:bg-[#2d5a5a]/90 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Retour à la connexion
                </Button>
              </Link>

              <Button
                variant="ghost"
                className="w-full text-[#2d5a5a] hover:text-[#2d5a5a]/80 hover:bg-[#2d5a5a]/5"
                onClick={() => {
                  setSuccess(false)
                  setEmail("")
                }}
              >
                Réessayer avec un autre email
              </Button>
            </div>

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
                <h2 className="text-4xl font-bold mb-4">Récupération sécurisée</h2>
                <p className="text-lg text-white/80">
                  Notre processus de récupération garantit la sécurité de votre compte.
                </p>
              </div>

              {/* Features Section */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#f4a261] rounded-lg flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Sécurité maximale</h3>
                    <p className="text-white/70">Processus de récupération chiffré et sécurisé</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#e76f51] rounded-lg flex items-center justify-center">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Email instantané</h3>
                    <p className="text-white/70">Recevez votre lien de récupération immédiatement</p>
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
      {/* Left Panel - Forgot Password Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <div className="w-16 h-16 bg-[#2d5a5a] rounded-xl flex items-center justify-center mx-auto mb-4">
              <div className="text-white font-bold text-xl">i-RH</div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mot de passe oublié ?</h1>
            <p className="text-gray-600">Entrez votre email pour recevoir un lien de réinitialisation</p>
          </div>

          {/* Forgot Password Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Adresse email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  autoComplete="email"
                  className="pl-10 h-12 rounded-lg border-gray-300 focus:border-[#2d5a5a] focus:ring-[#2d5a5a]"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                className="w-full h-12 bg-[#2d5a5a] hover:bg-[#2d5a5a]/90 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                disabled={isLoading || loading}
              >
                {isLoading || loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    Envoyer le lien
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
              <h2 className="text-4xl font-bold mb-4">Récupération rapide</h2>
              <p className="text-lg text-white/80">
                Récupérez l'accès à votre compte en quelques minutes seulement.
              </p>
            </div>

            {/* Features Section */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#f4a261] rounded-lg flex items-center justify-center">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Email sécurisé</h3>
                  <p className="text-white/70">Lien de récupération chiffré envoyé instantanément</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#e76f51] rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Protection totale</h3>
                  <p className="text-white/70">Votre sécurité est notre priorité absolue</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#2a9d8f] rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Support 24/7</h3>
                  <p className="text-white/70">Notre équipe est là pour vous aider</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}