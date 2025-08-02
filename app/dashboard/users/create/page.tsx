"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { PermissionRoute } from "@/components/auth/route-protector"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  UserPlus, 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle2,
  Loader2,
  Mail,
  Lock,
  User,
  Briefcase,
  Check,
  X,
  Eye,
  EyeOff
} from "lucide-react"
import { UsersEndpoints, type CreateUserRequest } from "@/lib/api/users-endpoints"

export default function CreateUserPage() {
  const router = useRouter()
  
  // États pour la vérification des limites
  const [isCheckingLimits, setIsCheckingLimits] = useState(true)
  const [canAddUser, setCanAddUser] = useState(false)
  const [limitMessage, setLimitMessage] = useState("")
  const [showLimitModal, setShowLimitModal] = useState(false)
  
  // États pour la soumission
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [createdUser, setCreatedUser] = useState<any>(null)
  const [error, setError] = useState("")

  // États pour l'affichage des mots de passe
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // États du formulaire
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    companyRole: ""
  })

  // Check tenant limits UNE SEULE FOIS
  useEffect(() => {
    let mounted = true
    
    const checkLimits = async () => {
      try {
        const result = await UsersEndpoints.checkCanAddUser()
        
        if (!mounted) return
        
        if (result.canAddUser) {
          setCanAddUser(true)
        } else {
          setCanAddUser(false)
          setLimitMessage(result.message || "Limite d'utilisateurs atteinte")
          setShowLimitModal(true)
        }
      } catch (error) {
        if (!mounted) return
        
        console.error("Error checking tenant limits:", error)
        setCanAddUser(false)
        setLimitMessage("Erreur lors de la vérification des limites")
        setShowLimitModal(true)
      } finally {
        if (mounted) {
          setIsCheckingLimits(false)
        }
      }
    }

    checkLimits()
    
    return () => {
      mounted = false
    }
  }, [])

  // Handler optimisé pour les champs
  const handleFieldChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  // Validation du mot de passe - calculée uniquement quand nécessaire
  const getPasswordValidation = useCallback((password: string) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    }
  }, [])

  const passwordValidation = getPasswordValidation(formData.password)
  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!canAddUser) return

    // Validation
    const { email, password, confirmPassword, firstName, lastName, companyRole } = formData
    
    if (!email.trim() || !password.trim() || !confirmPassword.trim() || 
        !firstName.trim() || !lastName.trim() || !companyRole.trim()) {
      setError("Tous les champs sont requis")
      return
    }

    if (!email.includes("@")) {
      setError("Format email invalide")
      return
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    const validation = getPasswordValidation(password)
    if (!validation.length || !validation.uppercase || !validation.lowercase || !validation.number || !validation.special) {
      setError("Le mot de passe ne respecte pas les critères de sécurité")
      return
    }

    setIsSubmitting(true)
    try {
      const userData: CreateUserRequest = {
        email: email.trim(),
        password: password.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        companyRole: companyRole.trim()
      }

      const result = await UsersEndpoints.createUser(userData)
      
      if (result.success) {
        setCreatedUser(result.data.dynamoUser)
        setShowSuccessModal(true)
        
        // Reset uniquement en cas de succès
        setFormData({
          email: "",
          password: "",
          confirmPassword: "",
          firstName: "",
          lastName: "",
          companyRole: ""
        })
      }
    } catch (error: any) {
      console.error("Error creating user:", error)
      setError(error.message || "Erreur lors de la création de l'utilisateur")
      // NE PAS reset les données en cas d'erreur
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoBack = () => {
    router.push("/dashboard/users")
  }

  const handleSuccessClose = () => {
    setShowSuccessModal(false)
    setCreatedUser(null)
    router.push("/dashboard/users")
  }

  // Loading state
  if (isCheckingLimits) {
    return (
      <PermissionRoute permission="TENANT_USERS" level="WRITE">
        <div className="p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
              <p className="text-gray-600">Vérification des limites du tenant...</p>
            </div>
          </div>
        </div>
      </PermissionRoute>
    )
  }

  return (
    <PermissionRoute permission="TENANT_USERS" level="WRITE">
      <div className="p-6 space-y-6">
        
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoBack}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Retour
              </Button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <UserPlus className="mr-3 h-7 w-7 text-teal-600" />
              Créer un utilisateur
            </h1>
            <p className="text-gray-600">
              Ajoutez un nouveau membre à votre équipe
            </p>
          </div>
        </div>

        {/* Main Content */}
        {canAddUser ? (
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 border-b">
                <CardTitle className="text-xl text-gray-800 flex items-center">
                  <UserPlus className="mr-2 h-5 w-5 text-teal-600" />
                  Informations utilisateur
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      Adresse email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="utilisateur@entreprise.com"
                      value={formData.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      className="border-gray-300 focus:border-teal-500 transition-colors"
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center">
                      <Lock className="h-4 w-4 mr-2 text-gray-500" />
                      Mot de passe
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimum 8 caractères"
                        value={formData.password}
                        onChange={(e) => handleFieldChange('password', e.target.value)}
                        className="border-gray-300 focus:border-teal-500 transition-colors pr-10"
                        disabled={isSubmitting}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isSubmitting}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    
                    {/* Password criteria */}
                    {formData.password && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                        <p className="text-sm font-medium text-gray-700 mb-2">Le mot de passe doit contenir :</p>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            {passwordValidation.length ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                            <span className={`text-sm ${passwordValidation.length ? 'text-green-700' : 'text-red-600'}`}>
                              Au moins 8 caractères
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {passwordValidation.uppercase ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                            <span className={`text-sm ${passwordValidation.uppercase ? 'text-green-700' : 'text-red-600'}`}>
                              Une majuscule (A-Z)
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {passwordValidation.lowercase ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                            <span className={`text-sm ${passwordValidation.lowercase ? 'text-green-700' : 'text-red-600'}`}>
                              Une minuscule (a-z)
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {passwordValidation.number ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                            <span className={`text-sm ${passwordValidation.number ? 'text-green-700' : 'text-red-600'}`}>
                              Un chiffre (0-9)
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {passwordValidation.special ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                            <span className={`text-sm ${passwordValidation.special ? 'text-green-700' : 'text-red-600'}`}>
                              Un caractère spécial (!@#$%...)
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 flex items-center">
                      <Lock className="h-4 w-4 mr-2 text-gray-500" />
                      Confirmer le mot de passe
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirmer le mot de passe"
                        value={formData.confirmPassword}
                        onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                        className="border-gray-300 focus:border-teal-500 transition-colors pr-10"
                        disabled={isSubmitting}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isSubmitting}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    
                    {/* Password match indicator */}
                    {formData.confirmPassword && (
                      <div className="flex items-center space-x-2">
                        {passwordsMatch ? (
                          <>
                            <Check className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-700">Les mots de passe correspondent</span>
                          </>
                        ) : (
                          <>
                            <X className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-red-600">Les mots de passe ne correspondent pas</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* First Name & Last Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        Prénom
                      </Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Jean"
                        value={formData.firstName}
                        onChange={(e) => handleFieldChange('firstName', e.target.value)}
                        className="border-gray-300 focus:border-teal-500 transition-colors"
                        disabled={isSubmitting}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                        Nom
                      </Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Dupont"
                        value={formData.lastName}
                        onChange={(e) => handleFieldChange('lastName', e.target.value)}
                        className="border-gray-300 focus:border-teal-500 transition-colors"
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                  </div>

                  {/* Company Role */}
                  <div className="space-y-2">
                    <Label htmlFor="companyRole" className="text-sm font-medium text-gray-700 flex items-center">
                      <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                      Rôle dans l'entreprise
                    </Label>
                    <Input
                      id="companyRole"
                      type="text"
                      placeholder="Développeur, Manager, RH..."
                      value={formData.companyRole}
                      onChange={(e) => handleFieldChange('companyRole', e.target.value)}
                      className="border-gray-300 focus:border-teal-500 transition-colors"
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  {/* Error Alert */}
                  {error && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGoBack}
                      disabled={isSubmitting}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-8"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Création...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Créer l'utilisateur
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Show disabled state when can't add user
          <div className="max-w-2xl mx-auto">
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {limitMessage}
              </AlertDescription>
            </Alert>
            
            <Card className="shadow-lg border-0 opacity-50">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="text-xl text-gray-500 flex items-center">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Création d'utilisateur désactivée
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-gray-500 text-center">
                  La création d'utilisateurs n'est pas disponible actuellement.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Limit Reached Modal */}
        <Dialog open={showLimitModal} onOpenChange={setShowLimitModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center text-red-600">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Limite atteinte
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {limitMessage}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={handleGoBack} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retourner à la liste
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Success Modal - CORRECTION DES ERREURS HTML */}
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center text-green-600">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Utilisateur créé avec succès
              </DialogTitle>
              <DialogDescription asChild>
                <div className="text-gray-600">
                  {createdUser && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <div><strong>Nom :</strong> {createdUser.firstName} {createdUser.lastName}</div>
                      <div><strong>Email :</strong> {createdUser.email}</div>
                      <div><strong>Rôle :</strong> {createdUser.companyRole}</div>
                      <div><strong>ID :</strong> {createdUser.id}</div>
                    </div>
                  )}
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={handleSuccessClose} className="w-full bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Continuer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </PermissionRoute>
  )
}