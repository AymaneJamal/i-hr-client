"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield, Users, BarChart3 } from "lucide-react"
import Image from "next/image"

interface LoginFormProps {
  onForgotPassword: () => void
}

export function LoginForm({ onForgotPassword }: LoginFormProps) {
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Header */}
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <Image src="/rivolio-text.png" alt="Rivolio" width={300} height={80} className="h-16 w-auto" priority />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">Bon retour !</h1>
              <p className="text-gray-600">Connectez-vous à votre espace Rivolio</p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
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

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 text-gray-400 -translate-y-1/2" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11 h-12 border-gray-200 focus:border-[#2d5a5a] focus:ring-[#2d5a5a] rounded-lg"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 hover:bg-gray-100"
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
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-[#2d5a5a] hover:text-[#2d5a5a]/80 hover:bg-[#2d5a5a]/5"
                onClick={onForgotPassword}
              >
                Mot de passe oublié ?
              </Button>
            </div>
          </form>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500">
            <p>© 2024 Rivolio. Tous droits réservés.</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Brand/Features */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#2d5a5a] via-[#2d5a5a]/90 to-[#1a4040] relative overflow-hidden">
        {/* Background Pattern */}
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
                  src="/logo-dark.png"
                  alt="Rivolio Logo"
                  width={120}
                  height={120}
                  className="h-24 w-24"
                  priority
                />
              </div>
              <div className="space-y-4">
                <h1 className="text-6xl font-bold leading-tight tracking-tight">RIVOLIO</h1>
                <h2 className="text-2xl font-semibold text-white/90">Gestion des Ressources Humaines</h2>
                <p className="text-lg text-white/80 leading-relaxed max-w-md">
                  La plateforme SaaS moderne qui révolutionne la gestion de vos équipes avec simplicité et efficacité.
                </p>
              </div>
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
