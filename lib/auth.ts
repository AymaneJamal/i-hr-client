export type AuthState = "NOT_AUTH" | "SEMI_AUTH" | "AUTHENTICATED"

export interface User {
  id: string
  email: string
  name: string
  role: string
  permissions: Record<string, string[]>
}

export interface AuthContext {
  user: User | null
  authState: AuthState
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  verifyEmail: (code: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  setNewPassword: (token: string, password: string) => Promise<void>
}

// Mock user data
export const mockUser: User = {
  id: "1",
  email: "demo@rivolio.fr",
  name: "Marie Dubois",
  role: "Administrateur RH",
  permissions: {
    EMPLOYEES: ["READ", "WRITE", "DELETE"],
    TENANT_USERS: ["READ", "WRITE"],
    DEPARTEMENTS: ["READ", "WRITE"],
    PAYROLL: ["READ"],
    REPORTS: ["READ", "WRITE"],
  },
}

export const mockCredentials = {
  email: "demo@rivolio.fr",
  password: "Demo123!",
}
