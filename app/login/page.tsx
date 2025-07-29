"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { loginUser, clearError } from "@/lib/store/auth-slice"
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield, Users, BarChart3 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const dispatch = useAppDispatch()
  const router = useRouter()
  const { authState, loading, error } = useAppSelector((state) => state.auth)

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  // Handle redirect based on auth state
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

    if (!email.trim() || !password.trim()) {
      setIsLoading(false)
      return
    }

    try {
      // Redux Vanilla : dispatch retourne directement le résultat ou lance une erreur
      const result = await dispatch(loginUser({ email, password }))
      
      // Si on arrive ici, c'est que ça a réussi
      if (result && (result.requiresMFA || result.requiresEmailVerification)) {
        router.push("/verify")
      } else {
        router.push("/dashboard")
      }
    } catch (err: any) {
      // Les erreurs sont gérées automatiquement par le reducer
      console.error("Login error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <div className="w-15 h-15 flex items-center justify-center mx-auto mb-2">
              <Image
                src="/rivolio-carre.png"
                alt="Rivolio Logo"
                width={150}
                height={150}
                className="w-30 h-30 object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bon retour !</h1>
            <p className="text-gray-600">Connectez-vous à votre espace client</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
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

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
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
                    Se connecter
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <Link href="/forgot-password">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-[#2d5a5a] hover:text-[#2d5a5a]/80 hover:bg-[#2d5a5a]/5"
                >
                  Mot de passe oublié ?
                </Button>
              </Link>
            </div>
          </form>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500">
            <p>© 2025 Rivolio - Tous droits réservés</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Features */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#2d5a5a] to-[#1a4040] text-white">
        <div className="flex flex-col justify-center p-5 max-w-lg mx-auto">
          <div className="space-y-8">
            <div>
              <div className="w-15 h-15 flex items-center justify-center mx-auto mb-4">
              <Image
                src="/rivolio-text-wb.png"
                alt="Rivolio Logo"
                width={150}
                height={150}
                className="w-40 h-40 object-contain"
              />
              </div>
              <h2 className="text-4xl font-bold mb-4">Gérez vos ressources humaines simplement</h2>
              <p className="text-lg text-white/80">
                Plateforme complète pour la gestion des employés, congés, avertissements et bien plus encore.
              </p>
            </div>

            {/* Features Section */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#f4a261] rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Gestion des employés</h3>
                  <p className="text-white/70">Centralisez toutes les informations de vos collaborateurs</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#e76f51] rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Rapports avancés</h3>
                  <p className="text-white/70">Analysez les performances et tendances RH</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#2a9d8f] rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Sécurité renforcée</h3>
                  <p className="text-white/70">Vos données sont protégées par les meilleurs standards</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}