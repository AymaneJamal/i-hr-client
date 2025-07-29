"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { 
  verifyMFA, 
  verifyEmail, 
  resendMFACode, 
  resendEmailVerification, 
  clearError 
} from "@/lib/store/auth-slice"
import { Shield, Mail, RefreshCw, ArrowLeft } from "lucide-react"

export default function VerifyPage() {
  const [code, setCode] = useState("")
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState("")

  const dispatch = useAppDispatch()
  const router = useRouter()
  const { authState, user, tempEmail, loading, error } = useAppSelector((state) => state.auth)

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  // Redirect if not in semi-auth state
  useEffect(() => {
    if (authState === "AUTHENTICATED") {
      router.push("/dashboard")
    } else if (authState === "NOT_AUTH") {
      router.push("/login")
    }
  }, [authState, router])

  // Determine if it's MFA or Email verification
  const isMFAVerification = user?.isMfaRequired === 1
  const isEmailVerification = user?.isEmailVerified === 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearError())
    setResendMessage("")

    if (!code.trim()) {
      return
    }

    try {
      if (isMFAVerification) {
        await dispatch(verifyMFA(code)).unwrap()
      } else {
        await dispatch(verifyEmail(code)).unwrap()
      }
      
      router.push("/dashboard")
    } catch (err) {
      // Error is handled by Redux slice
      console.error("Verification error:", err)
    }
  }

  const handleResendCode = async () => {
    setIsResending(true)
    setResendMessage("")
    dispatch(clearError())

    try {
      if (isMFAVerification) {
        await dispatch(resendMFACode()).unwrap()
        setResendMessage("Code MFA renvoyé avec succès")
      } else {
        await dispatch(resendEmailVerification()).unwrap()
        setResendMessage("Code de vérification renvoyé avec succès")
      }
    } catch (err) {
      // Error is handled by Redux slice
      console.error("Resend error:", err)
    } finally {
      setIsResending(false)
    }
  }

  const handleBackToLogin = () => {
    router.push("/login")
  }

  // Show loading while auth state is being determined
  if (authState !== "SEMI_AUTH") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
          <p className="text-gray-600">Vérification de l'état d'authentification...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-teal-600 text-white p-3 rounded-lg">
              {isMFAVerification ? <Shield className="h-6 w-6" /> : <Mail className="h-6 w-6" />}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {isMFAVerification ? "Authentification 2FA" : "Vérification Email"}
          </CardTitle>
          <CardDescription className="text-center">
            {isMFAVerification 
              ? `Entrez le code de vérification envoyé à votre application d'authentification`
              : `Entrez le code de vérification envoyé à ${tempEmail}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {resendMessage && (
              <Alert>
                <AlertDescription className="text-green-600">
                  {resendMessage}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="code">
                {isMFAVerification ? "Code d'authentification" : "Code de vérification"}
              </Label>
              <Input
                id="code"
                name="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={isMFAVerification ? "000000" : "123456"}
                maxLength={6}
                required
                className="text-center text-lg tracking-widest"
                autoComplete="one-time-code"
              />
            </div>

            <div className="space-y-3">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !code.trim()}
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  "Vérifier"
                )}
              </Button>

              <div className="flex flex-col space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    `Renvoyer le code ${isMFAVerification ? "MFA" : "de vérification"}`
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBackToLogin}
                  className="w-full"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à la connexion
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}