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
      router.push("/dashboard/employees")
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
      const result = await dispatch(loginUser({ email, password })).unwrap()
      
      if (result && result.requiresMFA) {
        router.push("/verify")
      } else {
        router.push("/dashboard/employees")
      }
    } catch (err: any) {
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
            <p className="text-gray-600">Connectez-vous à votre espace i-RH</p>
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
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-gray-300 focus:border-[#2d5a5a] focus:ring-[#2d5a5a]"
                    placeholder="votre@email.com"
                    disabled={isLoading || loading}
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
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
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 border-gray-300 focus:border-[#2d5a5a] focus:ring-[#2d5a5a]"
                    placeholder="••••••••"
                    disabled={isLoading || loading}
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading || loading}
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
                  <p className="text-white/70">Gérez facilement les profils, contrats et informations de vos employés</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#e76f51] rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Tableaux de bord</h3>
                  <p className="text-white/70">Visualisez vos données RH avec des statistiques en temps réel</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#2a9d8f] rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Sécurité avancée</h3>
                  <p className="text-white/70">Vos données sont protégées par un chiffrement de niveau entreprise</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}